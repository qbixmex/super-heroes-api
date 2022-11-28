import { Router } from 'express';
// import { validateRequest } from '../../middlewares';
import * as HeroesController from './heroes.controller';

const router = Router();

router.get('/', HeroesController.heroes);

export default router;
