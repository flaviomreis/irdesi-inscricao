import { prisma } from "@/db/connection";
import { Metadata } from "next";
import NextAuthProvider from "../providers/auth";
import UserAuth from "@/components/UserAuth";
import { useState } from "react";

export const metadata: Metadata = {
  title: "Irdesi - Administração",
  description: "Administração de Pré-Inscrições",
};

async function getAdministrators() {
  const administrators = await prisma.administrator.findMany({});
  return administrators;
}

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
  const administrators = await getAdministrators();
  const courses = await getCourses();
  const courseClasses = await getCourseClasses();

  return (
    <NextAuthProvider>
      <UserAuth />
      <h2>Administradores</h2>
      {administrators.map((item) => {
        return (
          <p key={item.id}>
            {item.name}
            {" : "}
            {item.email}
          </p>
        );
      })}
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
    </NextAuthProvider>
  );
}
