/**
 * Fix script: Create missing PharmacyUserEntity link for existing PHARMACIST_HOLDER users
 * Run with: npx ts-node -r tsconfig-paths/register src/fix-titulaire-link.ts
 */
import { AppDataSource } from './orm/data-source';
import { Equal } from 'typeorm';
import { UserEntity } from './orm/entities/user.entity';
import { PharmacyUserEntity } from './orm/entities/pharmacy-user.entity';
import { PharmacyEntity } from './orm/entities/pharmacy.entity';

async function fix() {
  await AppDataSource.initialize();
  console.log('Database connected.');

  const userRepo = AppDataSource.getRepository(UserEntity);
  const pharmacyUserRepo = AppDataSource.getRepository(PharmacyUserEntity);
  const pharmacyRepo = AppDataSource.getRepository(PharmacyEntity);

  // Find all PHARMACIST_HOLDER users
  const holders = await userRepo.find({
    where: { role: 'PHARMACIST_HOLDER' },
    relations: ['key'],
  });

  console.log(`Found ${holders.length} PHARMACIST_HOLDER users.`);

  for (const holder of holders) {
    if (holder.key) {
      console.log(`✅ User ${holder.email} already has a pharmacy user link.`);
      continue;
    }

    console.log(`❌ User ${holder.email} is missing a pharmacy user link. Fixing...`);

    // Find pharmacy by email (the pharmacy email matches the user email)
    const pharmacy = await pharmacyRepo.findOne({
      where: { email: Equal(holder.email) },
    });

    if (!pharmacy) {
      console.log(`  ⚠️ No pharmacy found with email ${holder.email}. Skipping.`);
      continue;
    }

    // Create the pharmacy user link
    const pharmacyUser = pharmacyUserRepo.create({
      pharmacy: pharmacy,
      role: 'PHARMACIST_HOLDER',
      status: 1,
      userId: holder.id,
      user: holder,
    });

    await pharmacyUserRepo.save(pharmacyUser);
    console.log(`  ✅ Created pharmacy user link for ${holder.email} → pharmacy "${pharmacy.name}"`);
  }

  console.log('Done!');
  await AppDataSource.destroy();
}

fix().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
