const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // OAuth provider IDs
  googleId: { type: String, sparse: true },
  githubId: { type: String, sparse: true },
  linkedinId: { type: String, sparse: true },
  
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for OAuth users
  name: { type: String, required: true },
  bio: { type: String, default: '' },
  avatar: String,
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user has password (for OAuth users)
userSchema.methods.hasPassword = function() {
  return !!this.password;
};

// Method to check if user has any OAuth provider
userSchema.methods.hasOAuthProvider = function() {
  return !!(this.googleId || this.githubId || this.linkedinId);
};

// Method to get OAuth provider
userSchema.methods.getOAuthProvider = function() {
  if (this.googleId) return 'google';
  if (this.githubId) return 'github';
  if (this.linkedinId) return 'linkedin';
  return null;
};

module.exports = mongoose.model('User', userSchema);
