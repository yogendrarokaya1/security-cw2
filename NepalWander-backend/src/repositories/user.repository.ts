import { UserModel, UserDocument } from "../models/User.model";
import { IUser, UserRole, AccountStatus } from "../types";
import mongoose from "mongoose";

export class UserRepository {

  async create(data: Partial<IUser>): Promise<UserDocument> {
    return UserModel.create(data);
  }

  async findById(id: string): Promise<UserDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return UserModel.findById(id);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email });
  }

  async findByEmailWithPassword(
    email: string
  ): Promise<UserDocument | null> {
    return UserModel.findOne({ email }).select(
      "+password +refreshToken"
    );
  }

  async findByEmailWithOtp(
    email: string
  ): Promise<UserDocument | null> {
    return UserModel.findOne({ email }).select(
      "+otp +otpExpires +password"
    );
  }

  async update(
    id: string,
    data: Partial<IUser>
  ): Promise<UserDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return UserModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );
  }

  async saveOtp(
    email: string,
    otp: string,
    otpExpires: Date
  ): Promise<void> {
    await UserModel.findOneAndUpdate(
      { email },
      { $set: { otp, otpExpires } }
    );
  }

  async saveRefreshToken(
    id: string,
    token: string
  ): Promise<void> {
    await UserModel.findByIdAndUpdate(
      id,
      { $set: { refreshToken: token } }
    );
  }

  async clearRefreshToken(id: string): Promise<void> {
    await UserModel.findByIdAndUpdate(
      id,
      { $unset: { refreshToken: 1 } }
    );
  }

  async findAll(): Promise<UserDocument[]> {
    return UserModel.find().sort({ createdAt: -1 });
  }

  // ← new methods below

  async findByRole(role: UserRole): Promise<UserDocument[]> {
    return UserModel.find({ role }).sort({ createdAt: -1 });
  }

  async findByStatus(
    status: AccountStatus
  ): Promise<UserDocument[]> {
    return UserModel.find({
      accountStatus: status,
    }).sort({ createdAt: -1 });
  }

  async delete(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }
}