import mongoose, {Model, HydratedDocument} from 'mongoose';

// ShortLink DATA shape interface:
export interface IShortLink {
    /**
     * The display name of the link.
     */
    name?: string;

    /**
     * The identifier used to reference and redirect with the link.
     */
    shortID: string;

    /**
     * The URL to redirect to.
     */
    destination: string;

    /**
     * The number of clicks the shortlink has.
     */
    clicks: number;

    /**
     * The id of the user that owns this link.
     */
    user: mongoose.ObjectId;

    /**
     * The date & time this link was created.
     */
    created: Date;

    /**
     * Specifies if the shortlink has been blocked for any reason. This may mean
     * the destination url, or the user has been flagged as malicious.
     */
    isBlocked: boolean;
}

// ShortLink API RESPONSE shape interface:
export interface IShortLinkAPIResponse {
    /**
     * The display name of the link.
     */
    name?: string;

    /**
     * The identifier used to reference and redirect with the link.
     */
    shortID: string;

    /**
     * The URL to redirect to.
     */
    destination: string;

    /**
     * The number of clicks the shortlink has.
     */
    clicks: number;

    /**
     * the date & time this link was created.
     */
    created: Date;

    /**
     * Specifies if the shortlink has been blocked for any reason. This may mean
     * the destination url, or the user has been flagged as malicious.
     */
    isBlocked: boolean;
}


// Define ShortLink instance methods as interface:
interface IShortLinkMethods {
    showRedirect(): string;
    getAPIResponse(): IShortLinkAPIResponse;
}

// Create a new Model type that knows about the instance methods:
interface ShortLinkModel extends Model<IShortLink, {}, IShortLinkMethods>{
    // Define ShortLink static methods as interface:
    findByShortID(shortID: string): Promise<HydratedDocument<IShortLink, IShortLinkMethods>>;
    findByUserID(userID: string): Promise<HydratedDocument<IShortLink, IShortLinkMethods>>;
}

// Create the schema:
const shortLinkSchema = new mongoose.Schema<IShortLink, ShortLinkModel, IShortLinkMethods>({
    name: String,
    shortID: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    clicks: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    created: {
        type: Date,
        default: new Date()
    },
    isBlocked: {
        type: Boolean,
        default: false
    }
});


// Define method implementations:

shortLinkSchema.method('showRedirect', function showRedirect() {
    return `shortID: ${this.shortID} --> destination: ${this.destination}`;
});

// Function to generate an API response with only the necessary information and nothing internal.
shortLinkSchema.method('getAPIResponse', function getAPIResponse(): IShortLinkAPIResponse {
    return {
        name: this.name,
        shortID: this.shortID,
        destination: this.destination,
        clicks: this.clicks,
        created: this.created,
        isBlocked: this.isBlocked
    };
});

shortLinkSchema.static('findByShortID', async function findByShortID(shortID: string) {
    return this.findOne({ shortID }).exec();
});

shortLinkSchema.static('findByUserID', async function findByUserID(userID: string) {
    return this.find({ user: userID }).exec();
});

// Create and export the model:
export const ShortLink = mongoose.model<IShortLink, ShortLinkModel>('ShortLink', shortLinkSchema);