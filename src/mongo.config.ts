import mongoose from "mongoose";

export async function connectToMongoDB() {
  const mongoURL = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DATABASE}`;
  await mongoose.connect(mongoURL);

  console.log("Connected to MongoDB");
}
