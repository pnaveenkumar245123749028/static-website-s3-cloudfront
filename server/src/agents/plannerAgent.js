export class PlannerAgent {
  constructor() {
    this.name = 'planner';
  }

  async plan(workflow, initialInput = {}) {
    const nodes = workflow.nodes || [];
    const edges = workflow.edges || [];

    if (nodes.length === 0) {
      throw new Error('PLANNER_ERROR: Cannot plan execution for workflow with 0 nodes.');
    }

    // Build Adjacency List and In-Degree count for Topological Sorting (DAG)
    const adj = new Map();
    const inDegree = new Map();

    nodes.forEach((n) => {
      adj.set(n.id, []);
      inDegree.set(n.id, 0);
    });

    edges.forEach((e) => {
      if (adj.has(e.source) && inDegree.has(e.target)) {
        adj.get(e.source).push(e.target);
        inDegree.set(e.target, inDegree.get(e.target) + 1);
      }
    });

    // Kahn's Algorithm for Topological Sort
    const queue = [];
    inDegree.forEach((deg, nodeId) => {
      if (deg === 0) queue.push(nodeId);
    });

    const orderedNodeIds = [];
    while (queue.length > 0) {
      const u = queue.shift();
      orderedNodeIds.push(u);

      const neighbors = adj.get(u) || [];
      for (const v of neighbors) {
        inDegree.set(v, inDegree.get(v) - 1);
        if (inDegree.get(v) === 0) {
          queue.push(v);
        }
      }
    }

    // If topological sort count does not match total nodes, there is a cycle or disconnected graph
    let hasCycle = false;
    if (orderedNodeIds.length !== nodes.length) {
      hasCycle = true;
      // Fallback: append any missing nodes preserving position.x ordering
      const sortedByPos = [...nodes].sort((a, b) => (a.position?.x || 0) - (b.position?.x || 0));
      for (const node of sortedByPos) {
        if (!orderedNodeIds.includes(node.id)) {
          orderedNodeIds.push(node.id);
        }
      }
    }

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const plannedSteps = orderedNodeIds.map((id, index) => {
      const node = nodeMap.get(id);
      return {
        stepIndex: index,
        nodeId: id,
        label: node?.data?.label || `Step ${index + 1}`,
        type: node?.type || 'action',
        provider: node?.data?.provider || 'system',
        action: node?.data?.action || 'execute',
        config: node?.data?.config || {},
      };
    });

    // Compute plan confidence score (0.0 to 1.0)
    let confidence = 0.98;
    if (hasCycle) confidence -= 0.15;
    if (nodes.length > 8) confidence -= 0.05;
    if (!edges.length && nodes.length > 1) confidence -= 0.10;

    return {
      plannedSteps,
      confidence: Math.max(0.6, Math.min(1.0, confidence)),
      hasCycle,
      totalSteps: plannedSteps.length,
      estimatedDurationMs: plannedSteps.length * 450,
      reasoning: `Orchestrator planned ${plannedSteps.length} execution steps in topological sequence across ${nodes.length} nodes and ${edges.length} edges.`,
    };
  }
}

export const plannerAgent = new PlannerAgent();
