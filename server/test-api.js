import { connectDB } from './src/config/db.js';
import { encrypt, decrypt } from './src/services/cryptoService.js';
import { aiGenerationService } from './src/services/aiGenerationService.js';
import { authService } from './src/services/authService.js';
import { workflowService } from './src/services/workflowService.js';
import { executionService } from './src/services/executionService.js';
import { integrationService } from './src/services/integrationService.js';
import { plannerAgent } from './src/agents/plannerAgent.js';
import { orchestrator } from './src/agents/orchestrator.js';

async function runTests() {
  console.log('🧪 Starting Backend Automated Test Suite...\n');

  try {
    // 1. Test Crypto Service
    console.log('1. Testing AES-256-GCM Credential Encryption...');
    const plainText = 'xoxb-test-slack-token-secret-12345';
    const encrypted = encrypt(plainText);
    const decrypted = decrypt(encrypted);
    if (decrypted !== plainText) throw new Error('Crypto decryption mismatch!');
    console.log('   ✅ Encryption & Decryption verified.');

    // 2. Test Auth Service
    console.log('\n2. Testing Authentication (Register, Login, JWT)...');
    const testEmail = `operator_${Date.now()}@agentflow.io`;
    const { user: regUser, token: regToken } = await authService.register({
      name: 'Test Operator',
      email: testEmail,
      password: 'password123',
      role: 'admin',
    });
    console.log(`   ✅ User registered with ID: ${regUser.id}, role: ${regUser.role}`);

    const { user: loginUser, token: loginToken } = await authService.login({
      email: testEmail,
      password: 'password123',
    });
    if (!loginToken || loginUser.email !== testEmail) throw new Error('Login failed!');
    console.log('   ✅ User login and JWT verified.');

    // 3. Test AI Workflow Generation
    console.log('\n3. Testing Prompt-to-Workflow AI Generator...');
    const generatedGraph = await aiGenerationService.generateWorkflowFromPrompt(
      'When an invoice arrives via webhook, analyze it with AI and send a summary to Slack and log to Google Sheets'
    );
    console.log(`   ✅ Generated workflow: "${generatedGraph.name}" with ${generatedGraph.nodes.length} nodes and ${generatedGraph.edges.length} edges.`);
    if (generatedGraph.nodes.length < 3) throw new Error('Generated workflow nodes count too low!');

    // 4. Test Workflow CRUD
    console.log('\n4. Testing Workflow CRUD & Dashboard Metrics...');
    const createdWorkflow = await workflowService.createWorkflow(loginUser.id, {
      name: generatedGraph.name,
      description: generatedGraph.description,
      nodes: generatedGraph.nodes,
      edges: generatedGraph.edges,
      trigger: generatedGraph.trigger,
      tags: ['test', 'invoice-ops'],
    });
    console.log(`   ✅ Workflow created in database with ID: ${createdWorkflow._id || createdWorkflow.id}`);

    const dashboard = await workflowService.getDashboardMetrics(loginUser.id);
    if (dashboard.metrics.totalWorkflows < 1) throw new Error('Dashboard metrics did not increment!');
    console.log(`   ✅ Dashboard metrics active (Total Workflows: ${dashboard.metrics.totalWorkflows}).`);

    // 5. Test Planner Agent
    console.log('\n5. Testing Planner Agent DAG & Topological Ordering...');
    const plan = await plannerAgent.plan(createdWorkflow);
    console.log(`   ✅ Plan created: ${plan.plannedSteps.length} steps with confidence ${(plan.confidence * 100).toFixed(0)}%.`);
    console.log(`      Sequence: ${plan.plannedSteps.map((s) => s.label).join(' ➔ ')}`);

    // 6. Test Multi-Agent Orchestrator Execution
    console.log('\n6. Testing 5-Agent Orchestration Chain...');
    const execution = await workflowService.executeWorkflow(createdWorkflow._id || createdWorkflow.id, loginUser.id, {
      invoiceId: 'INV-2026-009',
      amount: 4500,
      currency: 'USD',
    });

    console.log(`   ✅ Execution dispatched with ID: ${execution._id || execution.id}`);

    // Wait a brief moment for the in-memory queue to run steps
    await new Promise((r) => setTimeout(r, 600));

    const timeline = await executionService.getExecutionTimeline(execution._id || execution.id, loginUser.id);
    console.log(`   ✅ Execution timeline contains ${timeline.timeline.length} agent events.`);

    const agentEvents = timeline.timeline.map((e) => `[${e.agent.toUpperCase()}] ${e.message}`);
    agentEvents.slice(0, 4).forEach((msg) => console.log(`      - ${msg}`));

    // 7. Test Integration Management
    console.log('\n7. Testing Integrations Status & Management...');
    const integrations = await integrationService.listUserIntegrations(loginUser.id);
    console.log(`   ✅ Integrations loaded: ${integrations.length} providers supported.`);

    console.log('\n🎉 ALL BACKEND TESTS PASSED SUCCESSFULLY! 🚀\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Backend test failed:', err);
    process.exit(1);
  }
}

runTests();
