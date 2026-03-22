import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEV_RECRUITER_USERNAME = 'recruiter';
/** Only for local development; change after first login in real deployments. */
const DEV_RECRUITER_PASSWORD = 'ChangeMe!Dev1';

async function seedInterviewCatalog() {
  const types = await Promise.all([
    prisma.interviewType.upsert({
      where: { name: 'Technical' },
      update: {},
      create: {
        name: 'Technical',
        description: 'Technical skills and system design assessment',
      },
    }),
    prisma.interviewType.upsert({
      where: { name: 'HR' },
      update: {},
      create: {
        name: 'HR',
        description: 'Human resources and culture fit',
      },
    }),
    prisma.interviewType.upsert({
      where: { name: 'Behavioral' },
      update: {},
      create: {
        name: 'Behavioral',
        description: 'Behavioral and situational interview',
      },
    }),
  ]);

  const typeByName = Object.fromEntries(types.map((t) => [t.name, t])) as Record<
    string,
    (typeof types)[0]
  >;

  let flow = await prisma.interviewFlow.findFirst({
    where: { description: 'Default LTI hiring process' },
  });
  if (!flow) {
    flow = await prisma.interviewFlow.create({
      data: { description: 'Default LTI hiring process' },
    });
  }

  const steps: { orderIndex: number; name: string; typeName: string }[] = [
    { orderIndex: 1, name: 'Phone screen', typeName: 'HR' },
    { orderIndex: 2, name: 'Technical interview', typeName: 'Technical' },
    { orderIndex: 3, name: 'Final interview', typeName: 'Behavioral' },
  ];

  for (const s of steps) {
    const interviewType = typeByName[s.typeName];
    await prisma.interviewStep.upsert({
      where: {
        interviewFlowId_orderIndex: {
          interviewFlowId: flow.id,
          orderIndex: s.orderIndex,
        },
      },
      update: {
        name: s.name,
        interviewTypeId: interviewType.id,
      },
      create: {
        name: s.name,
        orderIndex: s.orderIndex,
        interviewFlowId: flow.id,
        interviewTypeId: interviewType.id,
      },
    });
  }
}

async function seedCompanyAndEmployee() {
  const company = await prisma.company.upsert({
    where: { name: 'LTI Demo Company' },
    update: {},
    create: { name: 'LTI Demo Company' },
  });

  await prisma.employee.upsert({
    where: { email: 'interviewer@lti-demo.local' },
    update: {},
    create: {
      name: 'Demo Interviewer',
      email: 'interviewer@lti-demo.local',
      role: 'Hiring Manager',
      isActive: true,
      companyId: company.id,
    },
  });

  return company;
}

async function seedDevRecruiterUser() {
  const passwordHash = await bcrypt.hash(DEV_RECRUITER_PASSWORD, 12);
  await prisma.user.upsert({
    where: { username: DEV_RECRUITER_USERNAME },
    update: { passwordHash },
    create: {
      username: DEV_RECRUITER_USERNAME,
      passwordHash,
    },
  });
}

async function main() {
  await seedInterviewCatalog();
  await seedCompanyAndEmployee();
  await seedDevRecruiterUser();
}

main()
  .then(() => {
    console.log('Seed completed (catalog + demo company + dev recruiter user).');
  })
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
