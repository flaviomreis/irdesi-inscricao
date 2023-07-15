import { prisma } from "@/db/connection";
import { Metadata } from "next";
import NextAuthProvider from "../providers/auth";
import UserAuthAction from "@/components/UserAuthAction";
import { useState } from "react";

export const metadata: Metadata = {
  title: "Irdesi - Administração",
  description: "Administração de Pré-Inscrições",
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

export default async function AdminPage() {
  const courses = await getCourses();
  const courseClasses = await getCourseClasses();

  return (
    <NextAuthProvider>
      <div className="container mx-auto p-4">
        <UserAuthAction />
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
      </div>
    </NextAuthProvider>
  );
}
