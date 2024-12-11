import mongoose from "mongoose";

export async function connectToMongoDB(options?: { isForSeeding?: boolean }) {
	try {
		console.log("Will try to connect with MongoDB");

		let [host, port] = process.env.MONGO_HOST!.split(":");

		// If host is equal to `"mongo"` it is assumed the container is running locally
		if (options?.isForSeeding && host === "mongo") {
			host = "127.0.0.1";
		}

		const mongoURL = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${host}:${port}/${process.env.MONGO_DATABASE}`;
		await mongoose.connect(mongoURL);

		console.log("Connected to MongoDB");
	} catch (error) {
		console.error("Error while connecting to MongoDB", error);
	}
}
