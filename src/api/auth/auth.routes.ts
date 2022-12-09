import { Router } from 'express';
import { check } from 'express-validator';
import { fieldValidation } from '../../middlewares/field-validations';
import { validateJWT } from '../../middlewares/validate-jwt';
import * as AuthController from './auth.controller';

const router = Router();

router.post('/', [
  check('email', 'Email is required!').notEmpty(),
  check('email', 'Email is not valid!').isEmail(),
  check('password', 'Password is required!').notEmpty(),
  check('password', 'Password must be at least 8 characters long!')
    .isLength({ min: 8 }),
  fieldValidation,
], AuthController.login);

router.get('/renew', validateJWT, AuthController.renewToken);

export default router;
