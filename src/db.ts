import mongoose from "mongoose";

export default async function connectDB() {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI!);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        console.log('\nDATABASE CONNECTION ERROR!!!!!!');
        process.exit(1);
    }
}