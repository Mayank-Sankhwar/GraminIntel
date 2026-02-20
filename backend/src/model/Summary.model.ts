import mongoose, { Schema, Document, Model } from "mongoose";

export type CallStatus =
  | "initiated"
  | "in_progress"
  | "completed"
  | "failed";

export interface ICall extends Document {
  userId: string;
  callSid?: string;        // Twilio CallSid
  query: string;           // User's initial query
  status: CallStatus;
  summary?: string;        // AI-generated summary
  error?: string;          // In case of failure
  startedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CallSchema = new Schema<ICall>(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },

    callSid: {
      type: String,
      unique: true,
      sparse: true
    },

    query: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["initiated", "in_progress", "completed", "failed"],
      default: "initiated",
      index: true
    },

    summary: {
      type: String
    },

    error: {
      type: String
    },

    startedAt: {
      type: Date
    },

    endedAt: {
      type: Date
    }
  },
  {
    timestamps: true // adds createdAt & updatedAt
  }
);

CallSchema.index({ status: 1, updatedAt: -1 });
CallSchema.index({ callSid: 1 });

export const Call: Model<ICall> =
  mongoose.models.Call || mongoose.model<ICall>("Call", CallSchema);
