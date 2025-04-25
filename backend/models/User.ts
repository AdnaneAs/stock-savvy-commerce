
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  firebase_uid: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true
  },
  name: String,
  role: {
    type: String,
    enum: ['admin', 'owner', 'worker'],
    default: 'worker'
  },
  photo_url: String,
  created_at: {
    type: Date,
    default: Date.now
  }
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
