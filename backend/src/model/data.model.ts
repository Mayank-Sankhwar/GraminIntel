import mongoose, { Schema, Document, Model } from "mongoose";

interface IData extends Document {
    website: string;
    content: string;
    embedding: number[];
}

const DataSchema: Schema<IData> = new Schema({
    website: { type: String, required: true, index: true },
    content: { type: String, required: true },
    embedding: { type: [Number], required: true, index: "2dsphere" }
});

const DataModel: Model<IData> = mongoose.model<IData>("Data", DataSchema);

export default DataModel;