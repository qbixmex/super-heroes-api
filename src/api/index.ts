import express from 'express';

import heroes from './heroes/heroes.routes';

const router = express.Router();

router.get('/', (request, response) => {
  response.json({
    message: '👋🌎',
  });
});

router.use('/heroes', heroes);

export default router;
