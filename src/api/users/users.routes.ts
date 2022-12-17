import { Router } from 'express';
import { check, body } from 'express-validator';
import { isUserExistById, isEmptyBody, isValidRole, isEmailExist, isPasswordSet } from '../../helpers/db-validators';
import { fieldValidation, validateFile } from '../../middlewares/';
import { validateJWT } from '../../middlewares/validate-jwt';
import * as UsersController from './users.controller';

const router = Router();

// JWT Validate
router.use(validateJWT);

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
  check('email').custom((email) => isEmailExist(email)),
  check('role').custom((role) => isValidRole(role)),
  check('password', 'Password is required!').notEmpty(),
  check('password', 'Password must be at least 8 characters long!')
    .isLength({ min: 8 }),
  fieldValidation,
  validateFile, // <- Custom Middleware
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
  check('password').custom((password) => isPasswordSet(password)),
  fieldValidation,
], UsersController.updateUser);

router.delete('/:id', [
  check('id', 'Provided id is not a valid Mongo ID').isMongoId(),
  check('id').custom((id) => isUserExistById(id)),
  fieldValidation,
], UsersController.deleteUser);

export default router;
