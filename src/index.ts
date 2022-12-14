import app from './app';
import { dbConnection } from './database/config';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST;

if (process.env.NODE_ENV !== 'test') {
  dbConnection();
}

app.listen(PORT, () => {
  console.log(`Listening on: ${HOST}:${PORT}`);
});
