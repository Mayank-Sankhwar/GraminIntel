import mongoose, { Schema, Document, Model } from "mongoose";

interface IUser extends Document {
    username: string;
    email: string;
    code: number;
    language_preference?: string;
    phone_number: string;
    disability_is:boolean
    disability_type: "Visual Impairment" | "Hearing Impairment" | "Speech Disability" | "Other"
    answer_preference: "voice" | "chat"
}

const UserSchema: Schema<IUser> = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    code: { type: Number, required: true },
    language_preference: { type: String, default: "hi" },
    phone_number: { type: String, required: true },
    disability_is: { type: Boolean, required: true },
    disability_type: { type: String, enum: ["Visual Impairment", "Hearing Impairment", "Speech Disability", "Other"], required: true },
    answer_preference: { type: String, enum: ["voice", "chat"], required: true },
});

const UserModel: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default UserModel;