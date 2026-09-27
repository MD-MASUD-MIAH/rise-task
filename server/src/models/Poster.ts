import { Schema, model, Document, Types } from 'mongoose';

export type PosterStatus = 'draft' | 'processing' | 'ready' | 'failed';

/**
 * formData holds all the Bangla text values entered by the user,
 * keyed by the element `id` from the Template's layoutConfig.
 *
 * Example:
 * {
 *   "candidate_name": "মোহাম্মদ আলী",
 *   "party_slogan": "এগিয়ে যাই একসাথে",
 *   "district": "ঢাকা-১৭"
 * }
 */
export type FormData = Record<string, string>;

export interface IPoster extends Document {
  userId: Types.ObjectId;
  templateId: Types.ObjectId;
  formData: FormData;
  uploadedPhotoUrls: string[];
  generatedImageUrl?: string;
  status: PosterStatus;
  createdAt: Date;
}

const posterSchema = new Schema<IPoster>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'Template',
      required: [true, 'Template ID is required'],
      index: true,
    },
    formData: {
      type: Schema.Types.Mixed, // flexible key-value map for Bangla text
      required: [true, 'Form data is required'],
      default: {},
    },
    uploadedPhotoUrls: {
      type: [String],
      default: [],
    },
    generatedImageUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['draft', 'processing', 'ready', 'failed'],
      default: 'draft',
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    versionKey: false,
  }
);

// Compound index to efficiently list all posters for a specific user
posterSchema.index({ userId: 1, createdAt: -1 });

export const Poster = model<IPoster>('Poster', posterSchema);
