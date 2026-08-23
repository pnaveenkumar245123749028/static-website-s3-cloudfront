import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { isDbConnected } from '../config/db.js';
import { inMemoryStore } from './inMemoryStore.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'operator'], default: 'operator' },
    lastLogin: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const MongooseUser = mongoose.models.User || mongoose.model('User', userSchema);

export const UserModel = {
  async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const data = {
      ...userData,
      password: hashedPassword,
      role: userData.role || 'operator',
      lastLogin: null,
    };
    if (isDbConnected()) {
      const user = new MongooseUser(userData);
      await user.save();
      const obj = user.toObject();
      delete obj.password;
      return obj;
    }
    const created = await inMemoryStore.insert('users', data);
    delete created.password;
    return created;
  },

  async findByEmail(email, includePassword = false) {
    const cleanEmail = email.toLowerCase().trim();
    if (isDbConnected()) {
      const query = MongooseUser.findOne({ email: cleanEmail });
      if (includePassword) query.select('+password');
      return query.lean();
    }
    const user = await inMemoryStore.findOne('users', { email: cleanEmail });
    if (user && !includePassword) {
      delete user.password;
    }
    return user;
  },

  async findById(id) {
    if (isDbConnected()) {
      return MongooseUser.findById(id).lean();
    }
    const user = await inMemoryStore.findById('users', id);
    if (user) delete user.password;
    return user;
  },

  async updateLastLogin(id) {
    const now = new Date();
    if (isDbConnected()) {
      return MongooseUser.findByIdAndUpdate(id, { lastLogin: now }, { new: true }).lean();
    }
    return inMemoryStore.updateById('users', id, { lastLogin: now });
  },

  async comparePassword(candidatePassword, hashedPassword) {
    return bcrypt.compare(candidatePassword, hashedPassword);
  },
};
