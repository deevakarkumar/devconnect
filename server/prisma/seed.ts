import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database for DevConnect...');

  // Clean existing tables (in reverse order of dependencies)
  await prisma.notification.deleteMany();
  await prisma.endorsement.deleteMany();
  await prisma.connection.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.project.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await bcrypt.hash('password123', 10);

  // 1. Create sample users
  const alex = await prisma.user.create({
    data: {
      email: 'alex@devconnect.io',
      username: 'alex_dev',
      name: 'Alex Rivera',
      passwordHash: defaultPassword,
      bio: 'Full Stack Engineer passionate about React, TypeScript, and distributed systems. Building open source tools.',
      location: 'San Francisco, CA',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    },
  });

  const sarah = await prisma.user.create({
    data: {
      email: 'sarah@devconnect.io',
      username: 'sarah_cloud',
      name: 'Sarah Chen',
      passwordHash: defaultPassword,
      bio: 'Cloud Architect & Backend Dev. AWS certified, Docker enthusiast, PostgreSQL optimization specialist.',
      location: 'Seattle, WA',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    },
  });

  const devon = await prisma.user.create({
    data: {
      email: 'devon@devconnect.io',
      username: 'devon_codes',
      name: 'Devon Patel',
      passwordHash: defaultPassword,
      bio: 'Frontend Craftsperson & UI/UX advocate. Love building fluid animations and accessible design systems.',
      location: 'New York, NY',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    },
  });

  const elena = await prisma.user.create({
    data: {
      email: 'elena@devconnect.io',
      username: 'elena_ml',
      name: 'Elena Rostova',
      passwordHash: defaultPassword,
      bio: 'AI/ML & Python Developer. Integrating LLMs with modern web stacks. Exploring vector databases.',
      location: 'Austin, TX',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    },
  });

  // 2. Create Skills
  const alexSkills = await Promise.all([
    prisma.skill.create({ data: { name: 'React', userId: alex.id } }),
    prisma.skill.create({ data: { name: 'TypeScript', userId: alex.id } }),
    prisma.skill.create({ data: { name: 'Node.js', userId: alex.id } }),
    prisma.skill.create({ data: { name: 'PostgreSQL', userId: alex.id } }),
  ]);

  const sarahSkills = await Promise.all([
    prisma.skill.create({ data: { name: 'PostgreSQL', userId: sarah.id } }),
    prisma.skill.create({ data: { name: 'Docker', userId: sarah.id } }),
    prisma.skill.create({ data: { name: 'Kubernetes', userId: sarah.id } }),
    prisma.skill.create({ data: { name: 'TypeScript', userId: sarah.id } }),
  ]);

  const devonSkills = await Promise.all([
    prisma.skill.create({ data: { name: 'React', userId: devon.id } }),
    prisma.skill.create({ data: { name: 'Tailwind CSS', userId: devon.id } }),
    prisma.skill.create({ data: { name: 'Next.js', userId: devon.id } }),
  ]);

  await Promise.all([
    prisma.skill.create({ data: { name: 'Python', userId: elena.id } }),
    prisma.skill.create({ data: { name: 'FastAPI', userId: elena.id } }),
    prisma.skill.create({ data: { name: 'PyTorch', userId: elena.id } }),
  ]);

  // 3. Create Connections (Alex <-> Sarah accepted, Alex <-> Devon accepted, Alex <- Elena pending)
  const connAlexSarah = await prisma.connection.create({
    data: {
      requesterId: alex.id,
      receiverId: sarah.id,
      status: 'ACCEPTED',
    },
  });

  const connAlexDevon = await prisma.connection.create({
    data: {
      requesterId: devon.id,
      receiverId: alex.id,
      status: 'ACCEPTED',
    },
  });

  await prisma.connection.create({
    data: {
      requesterId: elena.id,
      receiverId: alex.id,
      status: 'PENDING',
    },
  });

  // 4. Create Endorsements between connected users
  // Sarah endorses Alex for TypeScript and PostgreSQL
  await prisma.endorsement.create({
    data: {
      skillId: alexSkills[1].id, // TypeScript
      endorserId: sarah.id,
    },
  });
  await prisma.endorsement.create({
    data: {
      skillId: alexSkills[3].id, // PostgreSQL
      endorserId: sarah.id,
    },
  });

  // Devon endorses Alex for React and TypeScript
  await prisma.endorsement.create({
    data: {
      skillId: alexSkills[0].id, // React
      endorserId: devon.id,
    },
  });
  await prisma.endorsement.create({
    data: {
      skillId: alexSkills[1].id, // TypeScript
      endorserId: devon.id,
    },
  });

  // Alex endorses Sarah for PostgreSQL and Docker
  await prisma.endorsement.create({
    data: {
      skillId: sarahSkills[0].id, // PostgreSQL
      endorserId: alex.id,
    },
  });
  await prisma.endorsement.create({
    data: {
      skillId: sarahSkills[1].id, // Docker
      endorserId: alex.id,
    },
  });

  // 5. Create Projects
  await prisma.project.create({
    data: {
      userId: alex.id,
      title: 'DevConnect Platform',
      description: 'Full stack developer networking & portfolio showcase with real-time Socket.io notifications.',
      techStack: ['React', 'TypeScript', 'Node.js', 'Prisma', 'PostgreSQL', 'Tailwind CSS'],
      liveUrl: 'https://devconnect-demo.vercel.app',
      repoUrl: 'https://github.com/codeanova/devconnect',
    },
  });

  await prisma.project.create({
    data: {
      userId: alex.id,
      title: 'Distributed Rate Limiter',
      description: 'High-throughput sliding-window rate limiter using Redis and Express middleware with token bucket fallback.',
      techStack: ['Node.js', 'Redis', 'TypeScript', 'Docker'],
      repoUrl: 'https://github.com/alexrivera/distributed-limiter',
    },
  });

  await prisma.project.create({
    data: {
      userId: sarah.id,
      title: 'KubeWatch Metrics Agent',
      description: 'Lightweight sidecar container for scraping Prometheus metrics and streaming anomaly alerts.',
      techStack: ['Go', 'Kubernetes', 'Prometheus', 'Docker'],
      liveUrl: 'https://kubewatch.dev',
      repoUrl: 'https://github.com/sarahchen/kubewatch',
    },
  });

  await prisma.project.create({
    data: {
      userId: devon.id,
      title: 'Aura UI Component Library',
      description: 'Accessible, unstyled primitives with Tailwind CSS integration and keyboard navigation support.',
      techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Storybook'],
      liveUrl: 'https://aura-ui.dev',
      repoUrl: 'https://github.com/devonpatel/aura-ui',
    },
  });

  // 6. Create Blog Posts
  await prisma.blogPost.create({
    data: {
      authorId: alex.id,
      title: 'Building Resilient Full Stack Architectures with React 18 and Prisma',
      content: `## Modern Web Architecture in 2026

When designing scalable full-stack applications, striking the right balance between client interactivity and backend integrity is paramount.

### Why Monorepos Win
A monorepo sharing TypeScript contracts between client and server eliminates API drift:

\`\`\`typescript
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
\`\`\`

### Server-State with React Query
Handling server cache with TanStack Query allows optimistic UI updates while preserving backend truth:
\`\`\`typescript
const query = useQuery({
  queryKey: ['user', username],
  queryFn: () => api(\`/users/\${username}\`),
});
\`\`\`

*Happy building!*`,
      views: 142,
    },
  });

  await prisma.blogPost.create({
    data: {
      authorId: sarah.id,
      title: 'PostgreSQL Indexing Strategies for Developer Social Graphs',
      content: `## Optimizing Mutual Connection Lookups

Querying bidirectional social graphs can become a bottleneck at scale without composite indexes.

### Bidirectional Connections Schema
In Prisma, defining unique constraints ensures no duplicate requests:

\`\`\`prisma
model Connection {
  id          String   @id @default(cuid())
  requesterId String
  receiverId  String
  status      String   @default("PENDING")
  @@unique([requesterId, receiverId])
}
\`\`\`

With proper composite indexes on \`[requesterId, receiverId]\`, mutual connection calculations stay under 5ms.`,
      views: 289,
    },
  });

  await prisma.blogPost.create({
    data: {
      authorId: devon.id,
      title: 'Crafting Accessible and Installable PWAs with Tailwind CSS',
      content: `## The Modern Web App Experience

Progressive Web Applications (PWAs) bridge the gap between web simplicity and native performance.

### Key Considerations:
1. **Offline fallback**: Pre-cache static assets with Workbox.
2. **Touch ergonomics**: Ensure clickable targets meet WCAG 44x44px requirements.
3. **Responsive layouts**: Utilize Tailwind's flex and grid utility classes.`,
      views: 95,
    },
  });

  // 7. Notifications
  await prisma.notification.create({
    data: {
      userId: alex.id,
      type: 'CONNECTION_REQUEST',
      message: 'Elena Rostova sent you a connection request',
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: alex.id,
      type: 'ENDORSEMENT',
      message: 'Sarah Chen endorsed your TypeScript skill',
      read: true,
    },
  });

  console.log('Database seeded successfully!');
  console.log('Sample test accounts created:');
  console.log('  1. alex@devconnect.io / password123 (username: alex_dev)');
  console.log('  2. sarah@devconnect.io / password123 (username: sarah_cloud)');
  console.log('  3. devon@devconnect.io / password123 (username: devon_codes)');
  console.log('  4. elena@devconnect.io / password123 (username: elena_ml)');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
