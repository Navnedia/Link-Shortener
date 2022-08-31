import mongoose, {Model, HydratedDocument} from 'mongoose';

// ShortLink DATA shape interface:
export interface IShortLink {
    name?: string;
    shortID: string;
    destination: string;
    clicks: number;
    created: Date;
}

// ShortLink API RESPONSE shape interface:
export interface IShortLinkAPIResponse {
    name?: string;
    shortID: string;
    destination: string;
    link: string;
    clicks: number;
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
    shortID: {type: String, required: true},
    destination: {type: String, required: true},
    clicks: {type: Number, default: 0},
    created: {type: Date,  default: new Date()}
});

/**
 * ! The virtuals aproach has been set aside for now because it returns a
 * ! lot of unuseful data to the user like the internal object id, etc.
 */
// /**
//  * Add a virtual property to the schema. This link property contains the 
//  * full shortlink including the domain name. This property has been 
//  * virtualized to avoid storing unnessasary duplicate data in the database.
//  */
// shortLinkSchema.virtual('link').get(function() {
//     return `${process.env.DOMAIN_NAME}/${this.shortID}`;
// });

// // Make sure the virtual link property is included in the API response:
// shortLinkSchema.set('toJSON', {virtuals: true});
// shortLinkSchema.set('toObject', {virtuals: true });


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