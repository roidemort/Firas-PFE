import * as dotenv from "dotenv";
import "reflect-metadata";
import { AppDataSource } from "../orm/data-source";
import { UserEntity } from "../orm/entities/user.entity";

dotenv.config();

async function createAdmin() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log("✅ Database connected");

    const userRepository = AppDataSource.getRepository(UserEntity);

    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: "admin@galiocare.com" },
    });

    if (existingAdmin) {
      console.log("⚠️  Admin account already exists with email: admin@galiocare.com");
      console.log("   You can use this account to login.");
      await AppDataSource.destroy();
      return;
    }

    // Create admin user
    // Note: Password will be automatically hashed by BeforeInsert hook in UserEntity
    const adminUser = new UserEntity();
    adminUser.email = "admin@galiocare.com";
    adminUser.password = "admin123"; // Plain password - will be hashed by BeforeInsert hook
    adminUser.role = "SUPER_ADMIN";
    adminUser.provider = "EMAIL";
    adminUser.firstName = "Admin";
    adminUser.lastName = "Galiocare";
    adminUser.status = 1; // Active

    const savedAdmin = await userRepository.save(adminUser);

    console.log("✅ Admin account created successfully!");
    console.log("\n📧 Login credentials:");
    console.log("   Email: admin@galiocare.com");
    console.log("   Password: admin123");
    console.log("\n🔐 Please change the password after first login!");
    console.log("\n📝 Admin ID:", savedAdmin.id);

    await AppDataSource.destroy();
  } catch (error) {
    console.error("❌ Error creating admin account:", error);
    process.exit(1);
  }
}

createAdmin();
