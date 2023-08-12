import { prisma } from "@/db/connection";
import { Enrollment } from "@prisma/client";

type SyncReportItem = {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  lastEnrollmentStatusType: string;
  nextEnrollmentStatusType: string;
};

async function updateEnrollmentStatusIfNecessary(
  enrollment: Enrollment,
  enrollmentStatusType: string
) {
  if (enrollmentStatusType == "Sent") {
    await prisma.enrollment.update({
      where: {
        id: enrollment.id,
      },
      data: {
        enrollment_status: {
          create: [
            {
              enrollment_status_type: "Confirmed",
            },
          ],
        },
      },
    });

    return "Confirmed";
  }

  return enrollmentStatusType;
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
            take: 1,
            orderBy: {
              created_at: "desc",
            },
          },
        },
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

type ResultType = {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
};

async function getMoodleCourseEnrollments(id: string) {
  const token = process.env.MOODLE_GET_TOKEN;
  const result = await fetch(
    `https://irdesieducacao.com.br/ava/webservice/rest/server.php?wstoken=${token}&moodlewsrestformat=json&wsfunction=core_enrol_get_enrolled_users&courseid=2`
  );

  const json = (await result.json()) as ResultType[];
  const courseClass = await getCourseClass(id);
  // console.log(json.length);
  // json.map((item) => {
  //   console.log(item.username);
  // });

  const syncReport: SyncReportItem[] = [];

  if (courseClass) {
    const enrollments = courseClass.enrollment;
    enrollments.map(async (enrollment) => {
      const index = json.findIndex(
        (item) => item.username == enrollment.student.cpf
      );
      const lastEnrollmentStatusType =
        enrollment.enrollment_status[0].enrollment_status_type;
      let nextEnrollmentStatusType = lastEnrollmentStatusType;

      if (index >= 0) {
        nextEnrollmentStatusType = await updateEnrollmentStatusIfNecessary(
          enrollment,
          lastEnrollmentStatusType
        );
      }

      syncReport.push({
        ...json[index],
        lastEnrollmentStatusType,
        nextEnrollmentStatusType,
      });
    });

    console.log(syncReport);
  }
  return syncReport;
}

export default async function EnrollmentsSyncPage({
  params,
}: {
  params: { id: string };
}) {
  const syncReport: SyncReportItem[] = await getMoodleCourseEnrollments(
    params.id
  );

  return (
    <div>
      <div>Enrollments Sync</div>
      <table className="min-w-full text-left">
        <thead className="border-b border-gray-400">
          <tr className="flex flex-col md:flex-row">
            <th className="md:w-[16%]">CPF</th>
            <th className="md:w-[25%]">email</th>
            <th className="md:w-[25%]">Nome</th>
            <th className="md:w-[20%]">Sobrenome</th>
            <th className="md:w-[7%]">Status A</th>
            <th className="md:w-[7%]">Status B</th>
          </tr>
        </thead>
        <tbody>
          {syncReport.map((item) => (
            <tr key={item.id} className="flex flex-col md:flex-row">
              <td className="md:w-[16%]">{item.email}</td>
              <td className="md:w-[25%]">{item.email}</td>
              <td className="md:w-[25%]">{item.firstname}</td>
              <td className="md:w-[20%]">{item.lastname}</td>
              <td className="md:w-[7%]">{item.lastEnrollmentStatusType}</td>
              <td className="md:w-[7%]">{item.nextEnrollmentStatusType}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <a href={`/admin/courseclass/${params.id}`}>Voltar</a>
    </div>
  );
}
