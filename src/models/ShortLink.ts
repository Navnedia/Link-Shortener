import mongoose, {Model, HydratedDocument} from 'mongoose';

// ShortLink data shape interface:
interface IShortLink {
    name?: string;
    shortID: string;
    destination: string;
    clicks: number;
}

// Define ShortLink instance methods as interface:
interface IShortLinkMethods {
    showRedirect(): string;
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


// Define method implementations:

shortLinkSchema.method('showRedirect', function showRedirect() {
    return `shortID: ${this.shortID} --> destination: ${this.destination}`;
});

shortLinkSchema.static('findByShortID', async function findByShortID(shortID: string) {
    return this.findOne({ shortID }).exec();
});

// Create and export the model:
export const ShortLink = mongoose.model<IShortLink, ShortLinkModel>('ShortLink', shortLinkSchema);



// Testing methods:

// const shortLink = new ShortLink({shortID: '3UjfB7N', destination: 'http://example.com'});
// console.log(shortLink.showRedirect());