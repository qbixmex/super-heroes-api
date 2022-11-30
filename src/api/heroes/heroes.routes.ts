import { Router } from 'express';
import { check, body } from 'express-validator';
import * as HeroesController from './heroes.controller';
import { fieldValidation } from '../../middlewares/field-validations';
import { isHeroExist, isHeroExistById, isEmptyBody } from '../../helpers/db-validators';

const router = Router();

router.get('/', HeroesController.heroesList);
router.get('/:id', HeroesController.heroDetails);

router.post('/', [
  body().custom((_, { req }) => isEmptyBody(req)),
  check('heroName', 'Hero name is required!').notEmpty(),
  check('realName', 'Hero real name is required!').notEmpty(),
  check('studio', 'Studio is required!').notEmpty(),
  check('heroName').custom(isHeroExist),
  fieldValidation,
], HeroesController.create);

router.patch('/:id', [
  check('id', 'Provided id is not a valid Mongo ID').isMongoId(),
  check('id').custom(isHeroExistById),
  body().custom((_, { req }) => isEmptyBody(req)),
  fieldValidation,
], HeroesController.update);

router.delete('/:id', HeroesController.destroy);

export default router;
