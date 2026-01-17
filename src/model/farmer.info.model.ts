import mongoose, { Schema, Document } from "mongoose";

export interface IFarmerProfile extends Document {
  userId: string;          // farmer identifier (phone / user id)
  location?: string;
  soilType?: string;
  landSize?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const FarmerProfileSchema = new Schema<IFarmerProfile>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    location: {
      type: String,
    },

    soilType: {
      type: String,
    },

    landSize: {
      type: Number,
    },
  },
  { timestamps: true }
);

export const FarmerProfile =
  mongoose.models.FarmerProfile ||
  mongoose.model<IFarmerProfile>("FarmerProfile", FarmerProfileSchema);
