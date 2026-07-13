import "dotenv/config";
import mongoose from "mongoose";
import { UserModel } from "../models/User.model";
import { hashPassword } from "../utils/hash.util";
import { UserRole, AccountStatus } from "../types";

const seedAdmin = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Connected to MongoDB");

    const existing = await UserModel.findOne({
      role: UserRole.ADMIN,
      isSuperAdmin: true,
    });

    if (existing) {
      console.log("Super Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await hashPassword("Admin@1234");

    await UserModel.create({
      firstName: "Super",
      lastName: "Admin",
      email: "admin@nepalwander.com",
      password: hashedPassword,
      role: UserRole.ADMIN,
      isSuperAdmin: true,            // ← only this one is super admin
      isVerified: true,
      isActive: true,
      accountStatus: AccountStatus.APPROVED,
    });

    console.log("Super Admin created");
    console.log("Email    : admin@nepalwander.com");
    console.log("Password : Admin@1234");
    console.log("Role     : Super Admin");

  } catch (error) {
    console.error("Seed failed:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedAdmin();

