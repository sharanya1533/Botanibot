const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    species: { type: String, required: true, trim: true, maxlength: 60 },
    nickname: { type: String, required: true, trim: true, maxlength: 60 },
    intervalDays: { type: Number, required: true, min: 1, max: 60 },
    potType: { type: String, enum: ['terracotta', 'plastic', 'ceramic'], default: 'plastic' },
    location: { type: String, enum: ['indoor', 'outdoor'], default: 'indoor' },
    sunLevel: { type: String, enum: ['low', 'medium', 'bright'], default: 'medium' },
    lastWateredAt: { type: Date },
    nextDueAt: { type: Date, required: true },
    postponedDays: { type: Number, default: 0 },
    postponeReason: { type: String, maxlength: 200 },
    events: [
      {
        type: { type: String, enum: ['water', 'fertilize', 'prune', 'repot'], required: true },
        note: { type: String, maxlength: 200 },
        amountMl: { type: Number, min: 0 },
        at: { type: Date, default: Date.now },
        _id: false,
      },
    ],
    journal: [
      {
        month: { type: String }, // YYYY-MM
        heightCm: { type: Number, min: 0 },
        note: { type: String, maxlength: 300 },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plant', plantSchema);
