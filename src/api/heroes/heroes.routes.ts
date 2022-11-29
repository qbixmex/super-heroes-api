import { Router } from 'express';
// import { validateRequest } from '../../middlewares';
import * as HeroesController from './heroes.controller';

const router = Router();

router.get('/', HeroesController.heroesList);
router.get('/:id', HeroesController.heroDetails);
router.post('/', HeroesController.create);
router.patch('/:id', HeroesController.update);
router.delete('/:id', HeroesController.destroy);

export default router;
