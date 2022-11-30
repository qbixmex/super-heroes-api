import { Router } from 'express';
import { check } from 'express-validator';
import * as HeroesController from './heroes.controller';
import { fieldValidation } from '../../middlewares/field-validation';
import { isHeroExist } from '../../helpers/db-validators';

const router = Router();

router.get('/', HeroesController.heroesList);
router.get('/:id', HeroesController.heroDetails);

router.post('/', [
  check('heroName', 'Hero name is required!').not().isEmpty(),
  check('realName', 'Hero real name is required!').not().isEmpty(),
  check('studio', 'Studio is required!').not().isEmpty(),
  check('heroName').custom(isHeroExist),
  fieldValidation,
], HeroesController.create);

router.patch('/:id', HeroesController.update);
router.delete('/:id', HeroesController.destroy);

export default router;
