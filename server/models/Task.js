const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dueDate: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
