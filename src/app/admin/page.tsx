import { prisma } from "@/db/connection";
import { Metadata } from "next";
import NextAuthProvider from "../providers/auth";
import UserAuthBar from "@/components/UserAuthBar";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export const metadata: Metadata = {
  title: "Irdesi - Administração de Pré-Inscrições",
};

async function getCourses() {
  const courses = await prisma.course.findMany({});
  return courses;
}

async function getCourseClasses() {
  const courseClasses = await prisma.courseClass.findMany({
    include: {
      course: true,
      institution: true,
    },
  });
  return courseClasses;
}

async function isAdministrator(
  email: string | undefined | null
): Promise<boolean> {
  if (!email) return false;
  const administrator = await prisma.administrator.findUnique({
    where: {
      email,
    },
  });
  if (!administrator) return false;
  return true;
}

export default async function AdminPage() {
  const courses = await getCourses();
  const courseClasses = await getCourseClasses();
  const session = await getServerSession(authOptions);

  return (
    <NextAuthProvider>
      <div className="container mx-auto p-4">
        <UserAuthBar />
        {(await isAdministrator(session?.user?.email)) ? (
          <>
            <h2>Cursos</h2>
            {courses.map((item) => {
              return (
                <p key={item.id}>
                  {item.name}
                  {" : "}
                  {item.short_name}
                </p>
              );
            })}

            <h2>Turmas</h2>
            {courseClasses.map((item) => {
              return (
                <p key={item.id}>
                  {item.course.name}
                  {" : "}
                  {item.course.short_name}
                  {" / "}
                  {item.institution.name}
                  {" : "}
                  {item.institution.short_name}
                </p>
              );
            })}
          </>
        ) : (
          "Área restrita para administradores de pré-inscrição."
        )}
      </div>
    </NextAuthProvider>
  );
}
