/**
 * Database Seed Runner
 *
 * Run with: npm run db:seed
 *
 * This script seeds the database with initial category data.
 * It can be run multiple times safely - existing categories will be updated.
 */

import { db } from '../index';
import { categories } from '../schema';
import { CATEGORIES } from './categories';

async function seedCategories() {
  console.log('🌱 Seeding categories...');

  for (const category of CATEGORIES) {
    try {
      await db
        .insert(categories)
        .values({
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon: category.icon,
          color: category.color,
          sort_order: category.sort_order,
        })
        .onConflictDoUpdate({
          target: categories.slug,
          set: {
            name: category.name,
            description: category.description,
            icon: category.icon,
            color: category.color,
            sort_order: category.sort_order,
            updated_at: new Date(),
          },
        });
      
      console.log(`  ✓ ${category.name}`);
    } catch (error) {
      console.error(`  ✗ Failed to seed ${category.name}:`, error);
    }
  }
  
  console.log(`\n✅ Seeded ${CATEGORIES.length} categories`);
}

async function main() {
  try {
    await seedCategories();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

main();
