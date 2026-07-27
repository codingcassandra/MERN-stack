const mongoose = require("mongoose");

// Serverless (Vercel) reuses the same process across "warm" invocations but
// can freeze it mid-connect between requests, which is what was causing
// connections to hang far past connectTimeoutMS and then fail. Caching the
// connection promise on `global` means only the first request per cold
// start pays the connect cost — every request after that (in the same
// warm instance) reuses the already-established connection instead of
// racing a new one.
let cached = global._mongooseConn;
if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 8000,
      })
      .then((mongooseInstance) => {
        console.log("MongoDB Connected");
        return mongooseInstance;
      })
      .catch((error) => {
        // Let the next request try again instead of caching a dead promise.
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;
