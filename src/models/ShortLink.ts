import mongoose, {Model, HydratedDocument} from 'mongoose';

// ShortLink DATA shape interface:
export interface IShortLink {
    /**
     * The display name of the link.
     */
    name?: string;

    /**
     * The identifier used to refrence and redirect with the link.
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
}

// ShortLink API RESPONSE shape interface:
export interface IShortLinkAPIResponse {
    /**
     * The display name of the link.
     */
    name?: string;

    /**
     * The identifier used to refrence and redirect with the link.
     */
    shortID: string;

    /**
     * The URL to redirect to.
     */
    destination: string;

    /**
     * The full shortlink made up of the protocol,
     * the hostname, and the shortID as the path.
     * Example: `https://example.com/3LqNCVy`
     * Composed on request to avoid storing duplicate
     * data.
     */
    link: string;

    /**
     * The number of clicks the shortlink has.
     */
    clicks: number;

    /**
     * the date & time this link was created.
     */
    created: Date;
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
    created: {
        type: Date,
        default: new Date()
    }
});


// Define method implementations:

shortLinkSchema.method('showRedirect', function showRedirect() {
    return `shortID: ${this.shortID} --> destination: ${this.destination}`;
});

shortLinkSchema.method('getAPIResponse', function getAPIResponse(): IShortLinkAPIResponse {
    const link = `${process.env.DOMAIN_NAME}/${this.shortID}`;

    return {
        name: this.name,
        shortID: this.shortID,
        destination: this.destination,
        link: link,
        clicks: this.clicks,
        created: this.created
    };
});

shortLinkSchema.static('findByShortID', async function findByShortID(shortID: string) {
    return this.findOne({ shortID }).exec();
});

// Create and export the model:
export const ShortLink = mongoose.model<IShortLink, ShortLinkModel>('ShortLink', shortLinkSchema);