import { Schema, model, Document } from 'mongoose';

export interface IFarmerInfo extends Document {
    location: string;
    soilType: string;
    landSize: number;
    createdAt?: Date;
    updatedAt?: Date;
}

const farmerInfoSchema = new Schema<IFarmerInfo>(
    {
        location: {
            type: String,
            required: true,
        },
        soilType: {
            type: String,
            required: true,
        },
        landSize: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const FarmerInfo = model<IFarmerInfo>('FarmerInfo', farmerInfoSchema);

