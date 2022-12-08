import { Router } from 'express';
import { check } from 'express-validator';
import { isUserExistById } from '../../helpers/db-validators';
import { fieldValidation } from '../../middlewares/field-validations';
import * as UsersController from './users.controller';

const router = Router();

router.get('/', UsersController.usersList);
router.get('/:id', [
  check('id', 'Provided id is not a valid Mongo ID').isMongoId(),
  check('id').custom(isUserExistById),
  fieldValidation,
], UsersController.userProfile);

export default router;
