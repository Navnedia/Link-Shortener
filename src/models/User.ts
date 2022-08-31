import {Schema, model} from 'mongoose';

// Define the interface layout of the User:
interface IUser {
    /**
     * The user's Google ID.
     */
    googleId: string;

    /**
     * The user's account display name.
     */
    displayName: string;

    /**
     * The user's first name.
     */
    firstName: string;

    /**
     * The user's last name.
     */
    lastName: string;

    /**
     * The user's profile image.
     */
    image?: string;

    /**
     * The date & time this application user first registered.
     */
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