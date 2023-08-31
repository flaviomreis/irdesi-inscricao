"use client";

import { EnrollmentReportItem } from "@/app/enrollmentreport/[id]/page";
import dtFormatter from "@/utils/date-formatter";
import { ArrowDown, ArrowUp, Dot, RefreshCw } from "lucide-react";
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

export default function EnrollmentReportList({ items, courseClassId }: Props) {
  const [order, setOrder] = useState("name");
  const [orderedList, setOrderedList] = useState(items);
  const [ascSorting, setAscSorting] = useState(true);
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
    if (order === "confirmationDate") {
      copy.sort((a, b) => dateSort(a, b, "confirmationDate", ascSorting));
    }
    if (order === "lastAccessDate") {
      copy.sort((a, b) => dateSort(a, b, "lastAccessDate", ascSorting));
    }
    if (order === "progress") {
      copy.sort((a, b) => numberSort(a, b, "progress", ascSorting));
    }
    setOrderedList(copy);
  }, [order, ascSorting]);

  function handleColumnClick(field: string) {
    setOrder(field);
    setAscSorting((previous) => !previous);
  }

  async function handleRefreshClick(cpf: string) {
    console.log(`/api/enrollmentlastaccess/${cpf}?course_id=${courseClassId}`);

    const result = await fetch(
      `/api/enrollmentlastaccess/${cpf}?course_id=${courseClassId}`
    );
    if (result.status == 200) {
      const json = await result.json();
      const lastAccessDate =
        json.courseLastAccess == null
          ? zeroDate
          : new Date(Number(json.courseLastAccess) * 1000);
      const progress =
        json.courseLastAccess == null ? null : json.courseProgress;
      const newList = orderedList.map((item) => {
        if (item.cpf == cpf) {
          return {
            ...item,
            lastAccessDate,
            progress,
          };
        } else {
          return item;
        }
      });
      setOrderedList(newList);
    } else {
      console.log(result.status);
    }
  }

  function statusInPtBr(status: string) {
    return status == "Sent"
      ? "Enviada"
      : status == "Confirmed"
      ? "Confirmada"
      : status == "Active"
      ? "Ativa"
      : "Concluída";
  }

  function formatDate(date: Date | null) {
    if (date == null) {
      return (
        <span className="text-blue-700 text-xs">Ainda não atualizado</span>
      );
    } else if (date.valueOf() == zeroDate.valueOf()) {
      return (
        <span className="text-gray-700 text-xs">Ainda não acessou o curso</span>
      );
    }
    return dtFormatter.format(date);
  }

  function arrowIcon(column: string) {
    if (column == order) {
      return ascSorting ? (
        <ArrowDown className="inline w-3" />
      ) : (
        <ArrowUp className="inline w-3" />
      );
    } else {
      return <Dot className="inline w-3 opacity-0" />;
    }
  }

  return (
    <div className="py-2 px-4 flex flex-col items-center">
      <table className="text-left table-auto w-full">
        <thead className="border-b border-gray-400">
          <tr>
            <th
              onClick={() => handleColumnClick("cpf")}
              className="block md:table-cell"
            >
              CPF {arrowIcon("cpf")}
            </th>
            <th
              onClick={() => handleColumnClick("email")}
              className="block md:table-cell"
            >
              email {arrowIcon("email")}
            </th>
            <th
              onClick={() => handleColumnClick("employeeId")}
              className="block md:table-cell"
            >
              Matrícula {arrowIcon("employeeId")}
            </th>
            <th
              onClick={() => handleColumnClick("name")}
              className="block md:table-cell"
            >
              Nome {arrowIcon("name")}
            </th>
            <th
              onClick={() => handleColumnClick("lastName")}
              className="block md:table-cell"
            >
              Sobrenome {arrowIcon("lastName")}
            </th>
            <th
              onClick={() => handleColumnClick("status")}
              className="block md:table-cell"
            >
              Situação {arrowIcon("status")}
            </th>
            <th
              onClick={() => handleColumnClick("preenrollmentDate")}
              className="block md:table-cell"
            >
              Pré-inscrito em {arrowIcon("preenrollmentDate")}
            </th>
            <th
              onClick={() => handleColumnClick("confirmationDate")}
              className="block md:table-cell"
            >
              Matriculado em {arrowIcon("confirmationDate")}
            </th>
            <th
              onClick={() => handleColumnClick("lastAccessDate")}
              className="block md:table-cell"
            >
              Último acesso em {arrowIcon("lastAccessDate")}
            </th>
            <th
              onClick={() => handleColumnClick("progress")}
              className="block md:table-cell"
            >
              Progresso {arrowIcon("progress")}
            </th>
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
                  {statusInPtBr(item.lastStatus)}
                </td>
                <td className="block md:table-cell">
                  {dtFormatter.format(item.preenrollmentDate)}
                </td>
                <td className="block md:table-cell">
                  {dtFormatter.format(item.confirmationDate)}
                </td>
                <td className="block md:table-cell">
                  <RefreshCw
                    className="inline w-4"
                    onClick={() => handleRefreshClick(item.cpf)}
                  />{" "}
                  {formatDate(item.lastAccessDate)}
                </td>
                <td className="block md:table-cell text-right">
                  {item.progress && `${item.progress.toFixed(2)} %`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
