"use client";

import { EnrollmentReportItem } from "@/app/enrollmentreport/[id]/page";
import dtFormatter from "@/utils/date-formatter";
import {
  ArrowDown,
  ArrowUp,
  Dot,
  RefreshCw,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  items: EnrollmentReportItem[];
  courseClassId: string;
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

function numberSort(
  a: EnrollmentReportItem,
  b: EnrollmentReportItem,
  field: keyof EnrollmentReportItem,
  ascSorting: boolean
) {
  if (ascSorting) {
    return Number(a[field]) - Number(b[field]);
  } else {
    return Number(b[field]) - Number(a[field]);
  }
}

export default function PreEnrollmentReportList({
  items,
  courseClassId,
}: Props) {
  const [order, setOrder] = useState("name");
  const [orderedList, setOrderedList] = useState(items);
  const [ascSorting, setAscSorting] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const zeroDate = new Date(0);

  useEffect(() => {
    const copy = [...orderedList];
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
    setOrderedList(copy);
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
    const result = await fetch(
      `/api/enrollastudent/${student_id}?course_id=${courseClassId}`
    );

    const json = await result.json();

    if (result.status === 200) {
      const newList = orderedList.map((item) => {
        if (item.student_id === student_id) {
          const confirmationDate = new Date();
          return {
            ...item,
            confirmationDate,
          };
        } else {
          return item;
        }
      });

      setOrderedList(newList);
    } else {
      setErrorMessage(json.error);
    }
  }

  return (
    <div className="py-2 px-4 flex flex-col items-center">
      <div className="text-red-500">{errorMessage}&nbsp;</div>
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
              Sobrenome {arrowIcon("lastName")}
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
          {orderedList.map((item) => {
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
                  {item.confirmationDate !== null ? (
                    <span className="text-gray-700">
                      <UserCheck className="inline w-3" /> Inscrito
                    </span>
                  ) : (
                    <span className="text-blue-600 hover:underline cursor-pointer w-100">
                      <UserPlus className="inline w-3" /> Inscrever
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
