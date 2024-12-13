import mongoose from "mongoose";

export async function connectToMongoDB() {
	try {
		console.log("Will try to connect with MongoDB");

		let [host, port] = process.env.MONGO_HOST!.split(":");

		const mongoURL = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${host}:${port}/${process.env.MONGO_DATABASE}`;
		await mongoose.connect(mongoURL);

		console.log("Connected to MongoDB");
	} catch (error) {
		console.error("Error while connecting to MongoDB", error);
		process.exit(1);
	}
}
