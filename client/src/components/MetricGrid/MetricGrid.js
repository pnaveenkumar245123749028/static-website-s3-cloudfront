import MetricCard from './MetricCard.js';
import { GitFork, PlaySquare, CheckCircle2, AlertCircle, Zap, Activity } from 'lucide-react';

export default function MetricGrid({ metrics = {} }) {
  const {
    totalWorkflows = 0,
    activeWorkflows = 0,
    totalExecutions = 0,
    completedExecutions = 0,
    failedExecutions = 0,
    runningExecutions = 0,
    successRate = 100,
  } = metrics;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <MetricCard
        title="Total Workflows"
        value={totalWorkflows}
        subtitle={`${activeWorkflows} Active on Canvas`}
        icon={GitFork}
        trend="up"
        trendLabel="Healthy"
        color="indigo"
      />

      <MetricCard
        title="Total Executions"
        value={totalExecutions}
        subtitle={runningExecutions > 0 ? `${runningExecutions} In Progress` : 'All Queues Idle'}
        icon={PlaySquare}
        trend={runningExecutions > 0 ? 'up' : 'neutral'}
        trendLabel={runningExecutions > 0 ? 'Live Running' : 'Standing By'}
        color="cyan"
      />

      <MetricCard
        title="Success Rate"
        value={`${successRate}%`}
        subtitle={`${completedExecutions} Succeeded`}
        icon={CheckCircle2}
        trend="up"
        trendLabel="Optimal"
        color="emerald"
      />

      <MetricCard
        title="Recovered & Failed"
        value={failedExecutions}
        subtitle="Auto-remediated by Agents"
        icon={AlertCircle}
        trend={failedExecutions > 0 ? 'down' : 'neutral'}
        trendLabel={failedExecutions > 0 ? 'Escalated' : 'Zero Critical'}
        color={failedExecutions > 0 ? 'amber' : 'emerald'}
      />
    </div>
  );
}
