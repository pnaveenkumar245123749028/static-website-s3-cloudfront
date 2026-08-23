import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.js';
import { config } from '../config/env.js';

export function signToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );
}

export const authService = {
  async register({ name, email, password, role = 'operator' }) {
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      const error = new Error('An account with this email already exists.');
      error.statusCode = 400;
      error.code = 'DUPLICATE_EMAIL';
      throw error;
    }

    const user = await UserModel.create({
      name,
      email,
      password,
      role,
    });

    const token = signToken(user);
    return { user, token };
  },

  async login({ email, password }) {
    const user = await UserModel.findByEmail(email, true);
    if (!user) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const isMatch = await UserModel.comparePassword(password, user.password);
    if (!isMatch) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    await UserModel.updateLastLogin(user._id);

    const safeUser = {
      _id: user._id.toString(),
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      lastLogin: new Date(),
    };

    const token = signToken(safeUser);
    return { user: safeUser, token };
  },

  async getMe(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }
    return user;
  },
};
