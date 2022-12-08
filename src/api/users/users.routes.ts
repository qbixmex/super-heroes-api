import { Router } from 'express';
import { check, body } from 'express-validator';
import { isUserExistById, isEmptyBody, isValidRole, isEmailExist } from '../../helpers/db-validators';
import { fieldValidation } from '../../middlewares/field-validations';
import * as UsersController from './users.controller';

const router = Router();

router.get('/', UsersController.usersList);
router.get('/:id', [
  check('id', 'Provided id is not a valid Mongo ID').isMongoId(),
  check('id').custom(isUserExistById),
  fieldValidation,
], UsersController.userProfile);

router.post('/', [
  body().custom((_, { req }) => isEmptyBody(req)),
  check('firstName', 'First Name is required!').notEmpty(),
  check('lastName', 'Last Name is required!').notEmpty(),
  check('email', 'Email is required!').notEmpty(),
  check('email', 'Email is not valid!').isEmail(),
  check('role').custom((role) => isValidRole(role)),
  check('password', 'Password is required!').notEmpty(),
  check('password', 'Password must be at least 8 characters long!')
    .isLength({ min: 8 }),
  fieldValidation,
], UsersController.createUser);

router.patch('/:id', [
  check('id', 'Provided id is not a valid Mongo ID').isMongoId(),
  check('id').custom(isUserExistById),
  body().custom((_, { req }) => isEmptyBody(req)),
  check('firstName', 'First Name cannot be empty!').notEmpty(),
  check('lastName', 'Last Name cannot be empty!').notEmpty(),
  check('email', 'Email cannot be empty!').notEmpty(),
  check('email', 'Email is not valid!').isEmail(),
  check('email').custom((email, { req }) => isEmailExist(email, req?.params?.id)),
  check('role').custom(isValidRole),
  check('password', 'Password must be at least 8 characters long!')
    .isLength({ min: 8 }),
  fieldValidation,
], UsersController.updateUser);

export default router;
