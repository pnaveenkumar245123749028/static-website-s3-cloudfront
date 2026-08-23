import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import TriggerNode from './TriggerNode.js';
import ActionNode from './ActionNode.js';
import AINode from './AINode.js';
import LogicNode from './LogicNode.js';
import { useWorkflowStore } from '../../store/workflowStore.js';

function FlowCanvas({ readOnly = false }) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setSelectedNode, addNode } = useWorkflowStore();
  const reactFlowInstance = useReactFlow();

  const nodeTypes = useMemo(
    () => ({
      trigger: TriggerNode,
      action: ActionNode,
      ai: AINode,
      logic: LogicNode,
    }),
    []
  );

  const onNodeClick = useCallback(
    (_, node) => {
      setSelectedNode(node);
    },
    [setSelectedNode]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const typeData = event.dataTransfer.getData('application/agentflow-node');
      if (!typeData) return;

      try {
        const item = JSON.parse(typeData);
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        const id = `node-${Date.now()}`;
        const newNode = {
          id,
          type: item.category,
          position,
          data: {
            label: item.name,
            category: item.category,
            provider: item.provider,
            action: item.defaultAction,
            config: item.defaultConfig || {},
          },
        };

        // Add node via store
        const currentNodes = useWorkflowStore.getState().nodes;
        const currentEdges = useWorkflowStore.getState().edges;

        const newEdges = [...currentEdges];
        if (currentNodes.length > 0) {
          const prevNode = currentNodes[currentNodes.length - 1];
          newEdges.push({
            id: `edge-${prevNode.id}-${id}`,
            source: prevNode.id,
            target: id,
            animated: true,
          });
        }

        useWorkflowStore.setState({
          nodes: [...currentNodes, newNode],
          edges: newEdges,
          selectedNode: newNode,
        });
      } catch (err) {
        console.error('Failed to parse dropped node:', err);
      }
    },
    [reactFlowInstance]
  );

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDragOver={readOnly ? undefined : onDragOver}
        onDrop={readOnly ? undefined : onDrop}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2.5 },
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="rgba(255, 255, 255, 0.08)" />
        <Controls className="!bg-slate-900 !border-slate-800" />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === 'trigger') return '#10b981';
            if (n.type === 'action') return '#06b6d4';
            if (n.type === 'ai') return '#a855f7';
            return '#f59e0b';
          }}
          className="!bg-slate-900/90 !border !border-slate-800 !rounded-xl overflow-hidden"
          maskColor="rgba(11, 15, 23, 0.75)"
        />
      </ReactFlow>
    </div>
  );
}

export default function WorkflowCanvas(props) {
  return (
    <ReactFlowProvider>
      <FlowCanvas {...props} />
    </ReactFlowProvider>
  );
}
