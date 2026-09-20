const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.error('FATAL: MONGODB_URI environment variable is not set.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI, {
      dbName: 'flexhub', // always use the "flexhub" database, whatever the URI says
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB Connected Successfully (database: ${mongoose.connection.name})`);
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB runtime error:', err.message);
});

module.exports = connectDB;
