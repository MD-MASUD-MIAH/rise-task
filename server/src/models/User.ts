import { Schema, model, Document } from 'mongoose';

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface IUser extends Document {
  name: string;
  email?: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // allows multiple docs with no email (when using phone login)
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      match: [/^[+]?[0-9]{10,15}$/, 'Please provide a valid phone number'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // never return passwordHash by default in queries
    },
    role: {
      type: String,
      enum: ['admin', 'editor', 'viewer'],
      default: 'viewer',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

// Ensure at least one of email or phone is provided
userSchema.pre('validate', function (next) {
  if (!this.email && !this.phone) {
    next(new Error('User must have at least an email or a phone number'));
  } else {
    next();
  }
});

export const User = model<IUser>('User', userSchema);
