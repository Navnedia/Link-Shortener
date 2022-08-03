import mongoose, {Model, HydratedDocument} from 'mongoose';

// ShortLink data shape interface:
export interface IShortLink {
    name?: string;
    shortID: string;
    destination: string;
    clicks: number;
}

// Define ShortLink instance methods as interface:
interface IShortLinkMethods {
    showRedirect(): string;
    getAPIResponse(): object;
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
    clicks: {type: Number, default: 0}
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

shortLinkSchema.method('getAPIResponse', function getAPIResponse() {
    const link = `${process.env.DOMAIN_NAME}/${this.shortID}`;

    return {
        name: this.name,
        shortID: this.shortID,
        destination: this.destination,
        clicks: this.clicks,
        link: link
    };
});

shortLinkSchema.static('findByShortID', async function findByShortID(shortID: string) {
    return this.findOne({ shortID }).exec();
});

// Create and export the model:
export const ShortLink = mongoose.model<IShortLink, ShortLinkModel>('ShortLink', shortLinkSchema);



// Testing methods:

// const shortLink = new ShortLink({shortID: '3UjfB7N', destination: 'http://example.com'});
// console.log(shortLink.showRedirect());