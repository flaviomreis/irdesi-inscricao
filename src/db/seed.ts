import { prisma } from "./connection";

async function seed() {
  const course = await prisma.course.upsert({
    where: {
      id: "8f0e16a8-235e-11ee-a96f-d708eb376533",
    },
    update: {},
    create: {
      id: "8f0e16a8-235e-11ee-a96f-d708eb376533",
      short_name: "Práticas Inclusivas",
      moodle_id: "2",
      name: "Práticas Inclusivas para Atendimento a Alunos com TEA",
    },
  });
  console.log(course);

  const institutionJaguariRS = await prisma.institution.upsert({
    where: {
      id: "8fbce034-235e-11ee-9cd6-3ba40af7d550",
    },
    update: {},
    create: {
      id: "8fbce034-235e-11ee-9cd6-3ba40af7d550",
      short_name: "Jaguari-RS",
      name: "Prefeitura Municipal de Jaguari",
      uf: "RS",
    },
  });
  console.log(institutionJaguariRS);

  const institutionSorrisoMT = await prisma.institution.upsert({
    where: {
      id: "bd1ba2c0-259f-11ee-a915-2f7e7ea6d6d3",
    },
    update: {},
    create: {
      id: "bd1ba2c0-259f-11ee-a915-2f7e7ea6d6d3",
      short_name: "Sorriso-MT",
      name: "Prefeitura Municipal de Sorriso",
      uf: "MT",
    },
  });
  console.log(institutionSorrisoMT);

  const courseClassJaguariRS = await prisma.courseClass.upsert({
    where: {
      id: "9009d9a2-235e-11ee-b374-2f0d658edfcd",
    },
    update: {},
    create: {
      id: "9009d9a2-235e-11ee-b374-2f0d658edfcd",
      course_id: course.id,
      institution_id: institutionJaguariRS.id,
      description: "1a. Edição",
    },
  });
  console.log(courseClassJaguariRS);

  const courseClassSorrisoMT = await prisma.courseClass.upsert({
    where: {
      id: "4d80b4fe-25a0-11ee-8c33-076be743b906",
    },
    update: {},
    create: {
      id: "4d80b4fe-25a0-11ee-8c33-076be743b906",
      course_id: course.id,
      institution_id: institutionSorrisoMT.id,
      description: "1a. Edição",
      requireemployeeId: true,
    },
  });
  console.log(courseClassSorrisoMT);

  const administratorKaty = await prisma.administrator.upsert({
    where: {
      id: "bfaa94b6-235f-11ee-bd3f-479b9e116a23",
    },
    update: {},
    create: {
      id: "bfaa94b6-235f-11ee-bd3f-479b9e116a23",
      name: "Catarini Carlos dos Reis",
      email: "katy.photo@gmail.com",
    },
  });

  const administratorFlavio = await prisma.administrator.upsert({
    where: {
      id: "c08ca2b6-235f-11ee-91ec-070617b256a3",
    },
    update: {},
    create: {
      id: "c08ca2b6-235f-11ee-91ec-070617b256a3",
      name: "Flávio Menezes dos Reis",
      email: "f18s.f9s@gmail.com",
    },
  });
  console.log({ administratorKaty, administratorFlavio });
}

console.log("seeding...");
seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(() => {
    console.log("finished");
  });
