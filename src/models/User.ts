import {Schema, model} from 'mongoose';

// Define the interface layout of the User:
interface IUser {
    googleId: string;
    displayName: string;
    firstName: string;
    lastName: string;
    image?: string;
    createdAt: Date;
}

// Define the mongoose schema:
const userSchema = new Schema<IUser>({
    googleId: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    image: String,
    createdAt: {
        type: Date,
        default: new Date()
    }
});

export const User = model<IUser>('User', userSchema); // Construct and export User model from schema.