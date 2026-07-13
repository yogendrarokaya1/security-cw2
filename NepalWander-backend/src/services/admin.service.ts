import { UserRepository } from "../repositories/user.repository";
import { hashPassword } from "../utils/hash.util";
import emailService from "./email.service";
import { UserRole, AccountStatus } from "../types";
import { ENV } from "../config/env";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../middlewares/error.middleware";

const userRepository = new UserRepository();

class AdminService {

  async createAdmin(input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    const { firstName, lastName, email, password } = input;

    const existing = await userRepository.findByEmail(email);
    if (existing) throw new ConflictError("Email is already registered");

    const hashed = await hashPassword(password);

    const admin = await userRepository.create({
      firstName,
      lastName,
      email,
      password: hashed,
      role: UserRole.ADMIN,
      isSuperAdmin: false,
      isVerified: true,
      isActive: true,
      accountStatus: AccountStatus.APPROVED,
    });

    if (ENV.NODE_ENV === "production") {
      await emailService.sendAdminWelcomeEmail(email, firstName, password);
    } else {
      console.log(`\n── Admin Created ──`);
      console.log(`📧 Email    : ${email}`);
      console.log(`🔑 Password : ${password}\n`);
    }

    return {
      message: "Admin account created successfully",
      admin: {
        id: admin._id.toString(),
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
        isSuperAdmin: admin.isSuperAdmin,
      },
    };
  }

  async getAllAdmins() {
    return userRepository.findByRole(UserRole.ADMIN);
  }

  async deleteAdmin(adminId: string, requesterId: string) {
    if (adminId === requesterId) {
      throw new BadRequestError("You cannot delete your own account");
    }
    const admin = await userRepository.findById(adminId);
    if (!admin) throw new NotFoundError("Admin not found");
    if (admin.isSuperAdmin) throw new BadRequestError("Super Admin cannot be deleted");

    await userRepository.delete(adminId);
    return { message: "Admin deleted successfully" };
  }

  async toggleAdminStatus(adminId: string, requesterId: string) {
    if (adminId === requesterId) {
      throw new BadRequestError("You cannot deactivate your own account");
    }
    const admin = await userRepository.findById(adminId);
    if (!admin) throw new NotFoundError("Admin not found");
    if (admin.isSuperAdmin) throw new BadRequestError("Super Admin status cannot be changed");

    const updated = await userRepository.update(adminId, { isActive: !admin.isActive });
    return {
      message: `Admin ${updated?.isActive ? "activated" : "deactivated"} successfully`,
      admin: updated,
    };
  }

  // ── Toggle any user's active status ───────────────────
  async toggleUserStatus(userId: string, isActive: boolean) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    if (user.isSuperAdmin) throw new BadRequestError("Super Admin status cannot be changed");

    const updated = await userRepository.update(userId, { isActive });
    return {
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      user: updated,
    };
  }

  // ── Approve guide/operator account ────────────────────
  async approveAccount(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    if (user.role !== UserRole.GUIDE && user.role !== UserRole.OPERATOR) {
      throw new BadRequestError("Only guide or operator accounts need approval");
    }
    if (user.accountStatus === AccountStatus.APPROVED) {
      throw new BadRequestError("Account is already approved");
    }

    await userRepository.update(userId, { accountStatus: AccountStatus.APPROVED });

    // Only send email in production
    if (ENV.NODE_ENV === "production") {
      await emailService.sendAccountApprovedEmail(user.email, user.firstName, user.role);
    } else {
      console.log(`\n── Account Approved ──`);
      console.log(`👤 ${user.firstName} ${user.lastName} (${user.role})`);
      console.log(`📧 ${user.email}\n`);
    }

    return { message: `${user.role} account approved successfully` };
  }

  // ── Reject guide/operator account ─────────────────────
  async rejectAccount(userId: string, reason: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    await userRepository.update(userId, { accountStatus: AccountStatus.REJECTED });

    // Only send email in production
    if (ENV.NODE_ENV === "production") {
      await emailService.sendAccountRejectedEmail(user.email, user.firstName, user.role, reason);
    } else {
      console.log(`\n── Account Rejected ──`);
      console.log(`👤 ${user.firstName} ${user.lastName} (${user.role})`);
      console.log(`📧 ${user.email}`);
      console.log(`❌ Reason: ${reason}\n`);
    }

    return { message: "Account rejected" };
  }

  async getAllUsers() {
    return userRepository.findAll();
  }

  async getPendingAccounts() {
    return userRepository.findByStatus(AccountStatus.PENDING);
  }
}

export default new AdminService();