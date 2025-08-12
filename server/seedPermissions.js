import { seedPermissions } from './seeds/permissions.js';

seedPermissions().then(() => {
  console.log('Permissions seeded successfully!');
  process.exit(0);
}).catch(error => {
  console.error('Error seeding permissions:', error);
  process.exit(1);
});