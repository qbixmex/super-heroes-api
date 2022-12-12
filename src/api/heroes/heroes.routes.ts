import { Router } from 'express';
import { check, body } from 'express-validator';
import * as HeroesController from './heroes.controller';
import { fieldValidation } from '../../middlewares/field-validations';
import { isHeroExist, isHeroExistById, isEmptyBody } from '../../helpers/db-validators';
import { validateJWT } from '../../middlewares/validate-jwt';

const router = Router();

// JWT Validate
router.use(validateJWT);

router.get('/', HeroesController.heroesList);

router.get('/:id', [
  check('id', 'Provided id is not a valid Mongo ID').isMongoId(),
  check('id').custom(isHeroExistById),
  fieldValidation,
], HeroesController.heroDetails);

router.post('/', [
  body().custom((_, { req }) => isEmptyBody(req)),
  check('heroName', 'Hero name is required!').notEmpty(),
  check('realName', 'Hero real name is required!').notEmpty(),
  check('studio', 'Studio is required!').notEmpty(),
  check('gender', 'Gender is required!').notEmpty(),
  // check('image', 'Image is required!').notEmpty(),
  check('heroName').custom((heroName) => isHeroExist(heroName)),
  check('nationality', 'Nationality must be a string!').isString(),
  check('powers', 'Powers must be a string!').isString(),
  fieldValidation,
], HeroesController.create);

router.patch('/:id', [
  check('id', 'Provided id is not a valid Mongo ID').isMongoId(),
  check('id').custom(isHeroExistById),
  body().custom((_, { req }) => isEmptyBody(req)),

  check('heroName', 'Hero name is required!').notEmpty(),
  check('realName', 'Hero real name is required!').notEmpty(),
  check('studio', 'Studio is required!').notEmpty(),
  check('gender', 'Gender cannot be empty!').notEmpty(),
  check('image', 'Image cannot be empty!').notEmpty(),
  check('heroName').custom((heroName, { req }) => isHeroExist(heroName, req?.params?.id)),
  check('nationality', 'Nationality must be a string!').isString(),
  check('powers', 'Powers must be a string!').isString(),

  fieldValidation,
], HeroesController.update);

router.delete('/:id', [
  check('id', 'Provided id is not a valid Mongo ID').isMongoId(),
  check('id').custom(isHeroExistById),
  fieldValidation,
], HeroesController.destroy);

export default router;
