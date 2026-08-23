import { workflowService } from '../services/workflowService.js';

export const workflowController = {
  async getDashboard(req, res, next) {
    try {
      const data = await workflowService.getDashboardMetrics(req.user.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async list(req, res, next) {
    try {
      const data = await workflowService.listUserWorkflows(req.user.id, req.query);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const workflow = await workflowService.getWorkflowById(req.params.id, req.user.id);
      res.status(200).json({ success: true, data: { workflow } });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const workflow = await workflowService.createWorkflow(req.user.id, req.body);
      res.status(201).json({ success: true, message: 'Workflow created successfully.', data: { workflow } });
    } catch (err) {
      next(err);
    }
  },

  async generate(req, res, next) {
    try {
      const { prompt } = req.body;
      const generated = await workflowService.generateWorkflow(req.user.id, prompt);
      res.status(200).json({ success: true, data: generated });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const workflow = await workflowService.updateWorkflow(req.params.id, req.user.id, req.body);
      res.status(200).json({ success: true, message: 'Workflow updated.', data: { workflow } });
    } catch (err) {
      next(err);
    }
  },

  async duplicate(req, res, next) {
    try {
      const workflow = await workflowService.duplicateWorkflow(req.params.id, req.user.id);
      res.status(201).json({ success: true, message: 'Workflow duplicated.', data: { workflow } });
    } catch (err) {
      next(err);
    }
  },

  async execute(req, res, next) {
    try {
      const execution = await workflowService.executeWorkflow(req.params.id, req.user.id, req.body.input || {});
      res.status(202).json({
        success: true,
        message: 'Workflow execution dispatched to multi-agent orchestrator.',
        data: { execution },
      });
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      await workflowService.deleteWorkflow(req.params.id, req.user.id);
      res.status(200).json({ success: true, message: 'Workflow deleted.' });
    } catch (err) {
      next(err);
    }
  },
};
