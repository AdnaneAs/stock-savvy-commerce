
import mongoose from 'mongoose';

const UserStoreAccessSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  store_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  role: {
    type: String,
    enum: ['owner', 'worker'],
    default: 'worker'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure uniqueness of user-store pairs
UserStoreAccessSchema.index({ user_id: 1, store_id: 1 }, { unique: true });

export const UserStoreAccess = mongoose.models.UserStoreAccess || 
  mongoose.model('UserStoreAccess', UserStoreAccessSchema);
