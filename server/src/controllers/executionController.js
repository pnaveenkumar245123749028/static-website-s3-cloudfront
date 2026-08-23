import { executionService } from '../services/executionService.js';

export const executionController = {
  async list(req, res, next) {
    try {
      const data = await executionService.listExecutions(req.user.id, req.query);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const execution = await executionService.getExecutionById(req.params.id, req.user.id);
      res.status(200).json({ success: true, data: { execution } });
    } catch (err) {
      next(err);
    }
  },

  async getTimeline(req, res, next) {
    try {
      const data = await executionService.getExecutionTimeline(req.params.id, req.user.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async pause(req, res, next) {
    try {
      const result = await executionService.pauseExecution(req.params.id, req.user.id);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async resume(req, res, next) {
    try {
      const result = await executionService.resumeExecution(req.params.id, req.user.id);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async cancel(req, res, next) {
    try {
      const result = await executionService.cancelExecution(req.params.id, req.user.id);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
};
