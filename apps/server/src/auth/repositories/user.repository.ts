import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../entities/user.entity';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  name?: string;
}

/**
 * Data-access layer for the `User` collection. Keeps Mongoose query
 * details out of {@link AuthService}.
 */
@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  /**
   * Looks up a user by their (unique, lowercased) email.
   *
   * @param email - Email to search for.
   * @returns The matching user, or `null` if none exists.
   */
  findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email });
  }

  /**
   * Looks up a user by their Mongo document id.
   *
   * @param id - The user's `_id` as a string.
   * @returns The matching user, or `null` if none exists.
   */
  findById(id: string): Promise<User | null> {
    return this.userModel.findById(id);
  }

  /**
   * Inserts a new user document.
   *
   * @param data - Email, bcrypt password hash, and optional display name.
   * @returns The created user document.
   */
  create(data: CreateUserData): Promise<User> {
    return this.userModel.create(data);
  }

  /**
   * Sets or clears the user's stored (bcrypt-hashed) refresh token.
   * Passing `null` revokes any outstanding refresh token for this user.
   *
   * @param userId - The user's `_id` as a string.
   * @param refreshTokenHash - New hash to store, or `null` to revoke.
   */
  async setRefreshTokenHash(userId: string, refreshTokenHash: string | null): Promise<void> {
    await this.userModel.updateOne({ _id: userId }, { refreshTokenHash });
  }
}
