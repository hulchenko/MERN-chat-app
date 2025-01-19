import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

const mongoConnect = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // failed connection timeout after 5 seconds
    });
    mongoose.set("debug", true); // TODO remove
    console.log("Connected to DB.");
  } catch (error) {
    console.error("Error connecting to DB: ", error);
  }
};

export default mongoConnect;
