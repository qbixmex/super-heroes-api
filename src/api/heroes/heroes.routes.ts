import { Router } from 'express';
import { check } from 'express-validator';
import * as HeroesController from './heroes.controller';
import { fieldValidation } from '../../middlewares/field-validation';
import Hero from './heroes.model';

const router = Router();

router.get('/', HeroesController.heroesList);
router.get('/:id', HeroesController.heroDetails);

router.post('/', [
  check('heroName', 'Hero name is required!').not().isEmpty(),
  check('heroName').custom(async (heroName: string = '') => {
    const heroExist = await Hero.findOne({ heroName: heroName });
    if (heroExist) {
      throw new Error(`Hero name "${heroName}" already exists!`);
    }
  }),
  check('realName', 'Hero real name is required!').not().isEmpty(),
  check('studio', 'Studio is required!').not().isEmpty(),
  fieldValidation,
], HeroesController.create);

router.patch('/:id', HeroesController.update);
router.delete('/:id', HeroesController.destroy);

export default router;
