import mongoose from "mongoose";

const port = process.env.PORT || 3000;
const database = process.env.MONGODB_URI || "mongodb://localhost:27017";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(database).then(mongoose => {
      return mongoose
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;