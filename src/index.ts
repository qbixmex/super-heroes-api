import app from './app';
import { dbConnection } from './database/config';

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  dbConnection();
}

app.listen(PORT, () => {
  /* eslint-disable no-console */
  console.log(`Listening on port: ${PORT}`);
  /* eslint-enable no-console */
});
