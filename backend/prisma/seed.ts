// ─── Database Seed ────────────────────────────────────────────
// Populates the database with the same data currently used by
// the frontend's mockData.js, ensuring feature parity.
// Run with: npx ts-node prisma/seed.ts
// ──────────────────────────────────────────────────────────────

import { PrismaClient, Role, IncidentType, Severity, IncidentStatus, ResourceStatus, VolunteerStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── 1. Users ──────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('ResQLink2024!', 12);

  const _agencyUser = await prisma.user.upsert({
    where: { email: 'commander@agency.gov' },
    update: {},
    create: {
      email: 'commander@agency.gov',
      passwordHash,
      name: 'Commander R. Singh',
      role: Role.AGENCY,
    },
  });

  const _volunteerUser = await prisma.user.upsert({
    where: { email: 'volunteer@resqlink.org' },
    update: {},
    create: {
      email: 'volunteer@resqlink.org',
      passwordHash,
      name: 'Volunteer Priya M.',
      role: Role.VOLUNTEER,
    },
  });

  const civilianUser = await prisma.user.upsert({
    where: { email: 'civilian@email.com' },
    update: {},
    create: {
      email: 'civilian@email.com',
      passwordHash,
      name: 'Civilian Amit K.',
      role: Role.CIVILIAN,
    },
  });

  console.log('  ✔ Users seeded');

  // ─── 2. Incidents (from mockData.js) ───────────────────────
  const incidentsData = [
    {
      type: IncidentType.FIRE,
      severity: Severity.CRITICAL,
      status: IncidentStatus.IN_PROGRESS,
      lat: 28.6139,
      lng: 77.2090,
      locationName: 'Connaught Place, Block B',
      description: 'Structure fire reported in commercial building. Smoke visible.',
      reporterId: civilianUser.id,
      verified: true,
      votes: 12,
    },
    {
      type: IncidentType.FLOOD,
      severity: Severity.HIGH,
      status: IncidentStatus.REPORTED,
      lat: 28.6219,
      lng: 77.2190,
      locationName: 'Barakhamba Road',
      description: 'Heavy water logging blocking ambulance access.',
      reporterId: civilianUser.id,
      verified: false,
      votes: 5,
    },
    {
      type: IncidentType.MEDICAL,
      severity: Severity.CRITICAL,
      status: IncidentStatus.REPORTED,
      lat: 28.6100,
      lng: 77.2300,
      locationName: 'India Gate Circle',
      description: 'Multi-vehicle collision. Multiple injuries reported.',
      reporterId: civilianUser.id,
      verified: true,
      votes: 8,
    },
  ];

  for (const incident of incidentsData) {
    await prisma.incident.create({ data: incident });
  }
  console.log('  ✔ Incidents seeded');

  // ─── 3. Resources ─────────────────────────────────────────
  const resourcesData = [
    { type: 'Water', quantity: 500, unit: 'Liters', lat: 28.6129, lng: 77.2293, status: ResourceStatus.AVAILABLE },
    { type: 'Medical Kits', quantity: 50, unit: 'Kits', lat: 28.6149, lng: 77.2000, status: ResourceStatus.LIMITED },
    { type: 'Food', quantity: 200, unit: 'Packets', lat: 28.6200, lng: 77.2100, status: ResourceStatus.AVAILABLE },
  ];

  for (const resource of resourcesData) {
    await prisma.resource.create({ data: resource });
  }
  console.log('  ✔ Resources seeded');

  // ─── 4. Volunteers ────────────────────────────────────────
  const volunteersData = [
    { name: 'Team Alpha', status: VolunteerStatus.DEPLOYED, lat: 28.6130, lng: 77.2080, currentTaskId: null },
    { name: 'Team Beta', status: VolunteerStatus.AVAILABLE, lat: 28.6180, lng: 77.2150, currentTaskId: null },
  ];

  for (const volunteer of volunteersData) {
    await prisma.volunteer.create({ data: volunteer });
  }
  console.log('  ✔ Volunteers seeded');

  console.log('✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
