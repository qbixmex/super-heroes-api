import express from 'express';

import heroes from './heroes/heroes.routes';
import users from './users/users.routes';
import auth from './auth/auth.routes';

const router = express.Router();

router.get('/', (request, response) => {
  response.json({
    message: '👋🌎',
  });
});

router.use('/heroes', heroes);
router.use('/users', users);
router.use('/auth', auth);

export default router;
