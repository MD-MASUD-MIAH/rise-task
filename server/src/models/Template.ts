import { Schema, model, Document } from 'mongoose';

export type OccasionType =
  | 'election'
  | 'rally'
  | 'independence_day'
  | 'national_holiday'
  | 'party_event'
  | 'other';

/** Describes a single visual element's position and dimensions within the poster canvas */
export interface LayoutElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'logo';
  label: string;        // human-readable label e.g. "Candidate Name"
  x: number;            // left offset in pixels (relative to canvas)
  y: number;            // top offset in pixels
  width: number;
  height: number;
  zIndex?: number;
  style?: Record<string, string | number>; // optional CSS-like overrides
}

export interface ILayoutConfig {
  canvasWidth: number;
  canvasHeight: number;
  elements: LayoutElement[];
}

export interface ITemplate extends Document {
  title: string;
  occasionType: OccasionType;
  thumbnailUrl: string;
  layoutConfig: ILayoutConfig;
  isActive: boolean;
  createdAt: Date;
}

const layoutElementSchema = new Schema<LayoutElement>(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ['text', 'image', 'shape', 'logo'], required: true },
    label: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    zIndex: { type: Number, default: 0 },
    style: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const layoutConfigSchema = new Schema<ILayoutConfig>(
  {
    canvasWidth: { type: Number, required: true, default: 1080 },
    canvasHeight: { type: Number, required: true, default: 1350 },
    elements: { type: [layoutElementSchema], required: true, default: [] },
  },
  { _id: false }
);

const templateSchema = new Schema<ITemplate>(
  {
    title: {
      type: String,
      required: [true, 'Template title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    occasionType: {
      type: String,
      enum: ['election', 'rally', 'independence_day', 'national_holiday', 'party_event', 'other'],
      required: [true, 'Occasion type is required'],
    },
    thumbnailUrl: {
      type: String,
      required: [true, 'Thumbnail URL is required'],
      trim: true,
    },
    layoutConfig: {
      type: layoutConfigSchema,
      required: [true, 'Layout config is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

export const Template = model<ITemplate>('Template', templateSchema);
