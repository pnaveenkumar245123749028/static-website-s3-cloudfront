import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import { api } from '../utils/api.js';

export const useWorkflowStore = create((set, get) => ({
  workflow: null,
  nodes: [],
  edges: [],
  selectedNode: null,
  isSaving: false,
  isExecuting: false,
  isGenerating: false,
  error: null,

  setWorkflow: (workflow) => {
    set({
      workflow,
      nodes: workflow?.nodes || [],
      edges: workflow?.edges || [],
      selectedNode: null,
    });
  },

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge({ ...connection, animated: true }, get().edges),
    });
  },

  setSelectedNode: (node) => {
    set({ selectedNode: node });
  },

  updateNodeData: (nodeId, newData) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          const updated = {
            ...node,
            data: {
              ...node.data,
              ...newData,
              config: {
                ...(node.data.config || {}),
                ...(newData.config || {}),
              },
            },
          };
          // Update selectedNode reference if currently selected
          if (get().selectedNode?.id === nodeId) {
            set({ selectedNode: updated });
          }
          return updated;
        }
        return node;
      }),
    });
  },

  addNode: (nodeType, category, provider, label, defaultAction = 'execute', defaultConfig = {}) => {
    const nodes = get().nodes;
    const id = `node-${Date.now()}`;
    const x = nodes.length > 0 ? (nodes[nodes.length - 1].position?.x || 100) + 320 : 100;
    const y = 160;

    const newNode = {
      id,
      type: category, // trigger, action, ai, logic
      position: { x, y },
      data: {
        label,
        category,
        provider,
        action: defaultAction,
        config: defaultConfig,
      },
    };

    const newEdges = [...get().edges];
    if (nodes.length > 0) {
      const prevNode = nodes[nodes.length - 1];
      newEdges.push({
        id: `edge-${prevNode.id}-${id}`,
        source: prevNode.id,
        target: id,
        animated: true,
      });
    }

    set({
      nodes: [...nodes, newNode],
      edges: newEdges,
      selectedNode: newNode,
    });

    return newNode;
  },

  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNode: get().selectedNode?.id === nodeId ? null : get().selectedNode,
    });
  },

  saveWorkflow: async () => {
    const { workflow, nodes, edges } = get();
    if (!workflow) return;

    set({ isSaving: true, error: null });
    try {
      const payload = {
        name: workflow.name,
        description: workflow.description,
        status: workflow.status,
        trigger: workflow.trigger || { type: 'manual' },
        nodes,
        edges,
        tags: workflow.tags || [],
      };

      let res;
      if (workflow._id || workflow.id) {
        const id = workflow._id || workflow.id;
        res = await api.put(`/api/workflows/${id}`, payload);
      } else {
        res = await api.post('/api/workflows', payload);
      }

      const saved = res.data.data.workflow;
      set({ workflow: saved, isSaving: false });
      return saved;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to save workflow';
      set({ error: msg, isSaving: false });
      throw new Error(msg);
    }
  },

  generateFromPrompt: async (prompt) => {
    set({ isGenerating: true, error: null });
    try {
      const res = await api.post('/api/workflows/generate', { prompt });
      const generated = res.data.data;
      set({
        workflow: {
          name: generated.name,
          description: generated.description,
          tags: generated.tags,
          trigger: generated.trigger,
          status: 'active',
        },
        nodes: generated.nodes,
        edges: generated.edges,
        selectedNode: null,
        isGenerating: false,
      });
      return generated;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'AI Generation failed';
      set({ error: msg, isGenerating: false });
      throw new Error(msg);
    }
  },
}));
