
import mongoose from 'mongoose';

const StoreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

export const Store = mongoose.models.Store || mongoose.model('Store', StoreSchema);
