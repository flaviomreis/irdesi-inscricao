import { prisma } from "@/db/connection";

type Check = {
  id: string,
  cpf: string,
  name: string,
  email: string,
  status: string
}

async function getCourseClass(id: string) {
  const result = await prisma.courseClass.findUnique({
    where: {
      id,
    },
    include: {
      enrollment: {
        include: {
          student: true,
          enrollment_status: {
            include: {
              enrollment_status_type: true,
            },
          },
        },
        take: 10,
        orderBy: [
          {
            student: {
              name: "asc",
            },
          },
        ],
      },
      institution: true,
      course: true,
    },
  });
  return result;
}

async function getMoodleCourseEnrollments(id: string) {
  const token = process.env.MOODLE_GET_TOKEN;
  const result = await fetch(
    `https://irdesieducacao.com.br/ava/webservice/rest/server.php?wstoken=ac0a52bd7fa80b4f802853f477fb73ff&moodlewsrestformat=json&wsfunction=core_enrol_get_enrolled_users&courseid=2`
  );

  const json = JSON.parse(await result.json());
  const courseClass = await getCourseClass(id);

  if (courseClass) {
    const enrollments = courseClass.enrollment;
    const checking = enrollments.map((enrollment) => {
      const index = json.findIndex(item: string => item.username == enrollment.student.cpf);
      if (json.find())
    });
  }
  return json;
}

export default function EnrollmentsSyncPage({
  params,
}: {
  params: { id: string };
}) {
  const courses = getMoodleCourseEnrollments("2");

  return (
    <div>
      <div>Enrollments Sync</div>
      <a href={`/admin/courseclass/${params.id}`}>Voltar</a>
    </div>
  );
}
