import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  /* eslint-disable no-console */
  console.log(`Listening on port: ${PORT}`);
  /* eslint-enable no-console */
});
