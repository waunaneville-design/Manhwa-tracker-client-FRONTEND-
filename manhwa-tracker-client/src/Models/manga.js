const mongoose = require('mongoose');

const MangaSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  externalId: { type: String, required: true }, // e.g. MangaDex ID
  title: { type: String, required: true },
  coverUrl: { type: String },
  status: { type: String, enum: ['Reading','Completed','On Hold','Plan to Read','Dropped'], default: 'Plan to Read' },
  progress: {
    read: { type: Number, default: 0 },
    latest: { type: Number, default: 0 }
  },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Manga', MangaSchema);
