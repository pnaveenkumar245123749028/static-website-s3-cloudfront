import { Router } from 'express';
import { body } from 'express-validator';
import { workflowController } from '../controllers/workflowController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';

const router = Router();

router.use(protect);

router.get('/dashboard', workflowController.getDashboard);
router.get('/', workflowController.list);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Workflow name is required'),
    body('nodes').optional().isArray().withMessage('Nodes must be an array'),
    body('edges').optional().isArray().withMessage('Edges must be an array'),
  ],
  validateRequest,
  workflowController.create
);

router.post(
  '/generate',
  [body('prompt').trim().notEmpty().withMessage('Automation prompt is required for generation')],
  validateRequest,
  workflowController.generate
);

router.get('/:id', workflowController.getById);
router.put('/:id', workflowController.update);
router.post('/:id/duplicate', workflowController.duplicate);
router.post('/:id/execute', workflowController.execute);
router.delete('/:id', workflowController.delete);

export default router;
