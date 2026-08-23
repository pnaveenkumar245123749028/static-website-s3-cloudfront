import { Router } from 'express';
import { body } from 'express-validator';
import { integrationController } from '../controllers/integrationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';

const router = Router();

// Public / OAuth callback endpoints
router.get('/oauth/error', integrationController.oauthError);
router.get('/oauth/:provider/callback', integrationController.handleCallback);

// Protected integration endpoints
router.use(protect);

router.get('/', integrationController.list);
router.get('/status', integrationController.getStatus);
router.get('/oauth/:provider/start', integrationController.startOAuth);

router.post(
  '/',
  [
    body('provider').trim().notEmpty().withMessage('Provider is required'),
  ],
  validateRequest,
  integrationController.saveApiKey
);

router.post('/:provider/test', integrationController.testConnection);
router.delete('/:provider', integrationController.disconnect);

export default router;
