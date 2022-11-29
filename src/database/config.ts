import mongoose from 'mongoose';

export async function dbConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Database Connected');
  } catch (error) {
    console.log(error);
    throw new Error('Error: could not initialize database');
  }
}

export async function dbDisconnect() {
  try {
    await mongoose.connection.close();
  } catch (error) {
    console.log(error);
    throw new Error('Error: could not disconnect database');
  }
}