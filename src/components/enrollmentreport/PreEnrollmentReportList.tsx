"use client";

import { EnrollmentReportItem } from "@/app/enrollmentreport/[id]/page";
import dtFormatter from "@/utils/date-formatter";
import plural from "@/utils/plural";
import { ArrowDown, ArrowUp, Dot, UserCheck, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  enrollmentReportItems: EnrollmentReportItem[];
  setEnrollmentReportItems: (list: EnrollmentReportItem[]) => void;
  preEnrollmentReportItems: EnrollmentReportItem[];
  setPreEnrollmentReportItems: (list: EnrollmentReportItem[]) => void;
  courseClassId: string;
  amountOfStudents: number;
};

function stringSort(
  a: EnrollmentReportItem,
  b: EnrollmentReportItem,
  field: keyof EnrollmentReportItem,
  ascSorting: boolean
) {
  if (ascSorting) {
    return (a[field] as string).localeCompare(b[field] as string);
  } else {
    return (b[field] as string).localeCompare(a[field] as string);
  }
}

function dateSort(
  a: EnrollmentReportItem,
  b: EnrollmentReportItem,
  field: keyof EnrollmentReportItem,
  ascSorting: boolean
) {
  if (ascSorting) {
    return Number(a[field] as Date) - Number(b[field] as Date);
  } else {
    return Number(b[field] as Date) - Number(a[field] as Date);
  }
}

export default function PreEnrollmentReportList({
  enrollmentReportItems,
  setEnrollmentReportItems,
  preEnrollmentReportItems,
  setPreEnrollmentReportItems,
  courseClassId,
  amountOfStudents,
}: Props) {
  const [order, setOrder] = useState("name");
  const [ascSorting, setAscSorting] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [showOkButton, setShowOkButton] = useState(false);
  const zeroDate = new Date(0);

  useEffect(() => {
    const copy = [...preEnrollmentReportItems];
    if (order === "cpf") {
      copy.sort((a, b) => stringSort(a, b, "cpf", ascSorting));
    }
    if (order === "email") {
      copy.sort((a, b) => stringSort(a, b, "email", ascSorting));
    }
    if (order === "name") {
      copy.sort((a, b) => stringSort(a, b, "name", ascSorting));
    }
    if (order === "lastName") {
      copy.sort((a, b) => stringSort(a, b, "lastName", ascSorting));
    }
    if (order === "status") {
      copy.sort((a, b) => stringSort(a, b, "lastStatus", ascSorting));
    }
    if (order === "preenrollmentDate") {
      copy.sort((a, b) => dateSort(a, b, "preenrollmentDate", ascSorting));
    }
    setPreEnrollmentReportItems(copy);
  }, [order, ascSorting]);

  function handleColumnClick(field: string) {
    setOrder(field);
    setAscSorting((previous) => !previous);
  }

  function arrowIcon(column: string) {
    if (column === order) {
      return ascSorting ? (
        <ArrowDown className="inline w-3" />
      ) : (
        <ArrowUp className="inline w-3" />
      );
    } else {
      return <Dot className="inline w-3 opacity-0" />;
    }
  }

  async function handleEnrollClick(student_id: string) {
    setIsRunning(true);

    if (amountOfStudents <= enrollmentReportItems.length) {
      setShowOkButton(true);
      setErrorMessage(
        "Alcançado limite de alunos para a turma. Não foi possível matricular."
      );
      return;
    }
    setShowOkButton(false);
    setErrorMessage("Executando operação, por favor, aguarde!");
    const result = await fetch(
      `/api/enrollastudent/${student_id}?course_id=${courseClassId}`
    );

    const json = await result.json();

    if (result.status === 200) {
      const newList = preEnrollmentReportItems.filter((item) => {
        if (item.student_id !== student_id) {
          return item;
        }
      });

      const newItem = preEnrollmentReportItems.find(
        (item) => item.student_id === student_id
      );
      if (newItem) {
        newItem.confirmationDate = new Date();
        newItem.lastAccessDate = zeroDate;
        const newList = [newItem, ...enrollmentReportItems];
        setEnrollmentReportItems(newList);
      }

      setPreEnrollmentReportItems(newList);
    }
    setErrorMessage(json.error);
    setShowOkButton(true);
  }

  return (
    <div className="py-2 px-4 flex flex-col items-center mb-4">
      <p className="text-yellow-600 text-lg">
        Relação de Alunos não Matriculados (
        {plural("inscrição", preEnrollmentReportItems.length)})
      </p>

      <table className="text-left table-auto w-full">
        <thead className="border-b border-gray-400">
          <tr>
            <th
              onClick={() => handleColumnClick("cpf")}
              className="block md:table-cell cursor-pointer"
            >
              CPF {arrowIcon("cpf")}
            </th>
            <th
              onClick={() => handleColumnClick("email")}
              className="block md:table-cell cursor-pointer"
            >
              email {arrowIcon("email")}
            </th>
            <th
              onClick={() => handleColumnClick("employeeId")}
              className="block md:table-cell cursor-pointer"
            >
              Matrícula {arrowIcon("employeeId")}
            </th>
            <th
              onClick={() => handleColumnClick("name")}
              className="block md:table-cell cursor-pointer"
            >
              Nome {arrowIcon("name")}
            </th>
            <th
              onClick={() => handleColumnClick("lastName")}
              className="block md:table-cell cursor-pointer"
            >
              Inscrito Sobrenome {arrowIcon("lastName")}
            </th>
            <th
              onClick={() => handleColumnClick("preenrollmentDate")}
              className="block md:table-cell cursor-pointer"
            >
              Pré-inscrito em {arrowIcon("preenrollmentDate")}
            </th>
            <th className="block md:table-cell cursor-pointer">Ação</th>
          </tr>
        </thead>
        <tbody>
          {preEnrollmentReportItems.map((item) => {
            return (
              <tr key={item.cpf} className="even:bg-white odd:bg-gray-200">
                <td className="block md:table-cell">{item.cpf}</td>
                <td className="block md:table-cell">{item.email}</td>
                <td className="block md:table-cell">{item.employeeId}</td>
                <td className="block md:table-cell">{item.name}</td>
                <td className="block md:table-cell">{item.lastName}</td>
                <td className="block md:table-cell">
                  {dtFormatter.format(item.preenrollmentDate)}
                </td>
                <td
                  className="block md:table-cell"
                  onClick={() => handleEnrollClick(item.student_id)}
                >
                  <span className="text-blue-600 hover:underline cursor-pointer w-100">
                    <UserPlus className="inline w-3" /> Matricular
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {isRunning && (
        <div className="flex justify-center fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm">
          <div className="flex flex-col h-fit w-[320px] bg-white rounded-md  gap-4 border border-gray-400 shadow-lg">
            <p className="bg-blue-600 text-center rounded-md p-1 text-white font-semibold">
              Informação
            </p>
            <div className="flex flex-col px-8 gap-4">
              <p className="text-center break-normal">{errorMessage}</p>
              <div
                className={`flex gap-2 mb-2 justify-center ${
                  showOkButton ? "visible" : "invisible"
                }`}
              >
                <button
                  onClick={() => setIsRunning(false)}
                  className="text-center w-32 p-2 rounded-md bg-purple-800 hover:bg-purple-600 text-white disabled:bg-gray-500"
                >
                  Ciente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
