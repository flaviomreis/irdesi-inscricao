"use client";

import { EnrollmentReportItem } from "@/app/enrollmentreport/[id]/page";
import dtFormatter from "@/utils/date-formatter";
import plural from "@/utils/plural";
import { ArrowDown, ArrowUp, Dot, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  orderedList: EnrollmentReportItem[];
  setOrderedList: (list: EnrollmentReportItem[]) => void;
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

export default function EnrollmentReportList({
  orderedList,
  setOrderedList,
  courseClassId,
}: Props) {
  const [order, setOrder] = useState("name");
  const [errorMessage, setErrorMessage] = useState("");
  const [ascSorting, setAscSorting] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [showOkButton, setShowOkButton] = useState(false);
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
    setIsRunning(true);
    setShowOkButton(false);
    setErrorMessage("Executando operação, por favor, aguarde!");
    const result = await fetch(
      `/api/enrollmentlastaccess/${cpf}?course_id=${courseClassId}`
    );

    const json = await result.json();

    const newList = [...orderedList];
    for (let i = 0; i < newList.length; i++) {
      const item = newList[i];
      if (item.cpf === cpf) {
        if (result.status === 200) {
          const lastAccessDate =
            json.courseLastAccess === null
              ? zeroDate
              : new Date(Number(json.courseLastAccess) * 1000);
          const progress =
            json.courseLastAccess === null ? null : json.courseProgress;
          item.lastAccessDate = lastAccessDate;
          item.progress = progress;
        }
        if (json.studentData) {
          const moodleData = json.studentData.moodle;
          item.email = moodleData.email;
          item.name = moodleData.name;
          item.lastName = moodleData.lastName;
        }
        if (json.enrollmentStatus) {
          item.lastStatus = json.enrollmentStatus;
        }
      }
    }

    if (result.status === 200) {
      setOrderedList(newList);
      setIsRunning(false);
    } else {
      setErrorMessage(json.error);
      setShowOkButton(true);
    }
  }

  function statusInPtBr(status: string) {
    return status === "Sent"
      ? "Enviada"
      : status === "Confirmed"
      ? "Confirmada"
      : status === "Active"
      ? "Ativa"
      : "Concluída";
  }

  function formatDate(date: Date | null, cpf: string) {
    if (date === null) {
      return (
        <span
          className="text-blue-700 text-xs cursor-pointer"
          onClick={() => handleRefreshClick(cpf)}
        >
          <RefreshCw className="inline w-4" />
          &nbsp; Ainda não atualizado
        </span>
      );
    } else if (date.valueOf() === zeroDate.valueOf()) {
      return (
        <span
          className="text-gray-700 text-xs cursor-pointer"
          onClick={() => handleRefreshClick(cpf)}
        >
          <RefreshCw className="inline w-4" />
          &nbsp; Ainda não acessou o curso
        </span>
      );
    }
    return dtFormatter.format(date);
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

  return (
    <div className="py-2 px-4 flex flex-col items-center">
      <p className="text-blue-600 text-lg">
        Relação de Alunos Matriculados (
        {plural("inscrição", orderedList.length)})
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
              Sobrenome {arrowIcon("lastName")}
            </th>
            <th
              onClick={() => handleColumnClick("status")}
              className="block md:table-cell cursor-pointer"
            >
              Situação {arrowIcon("status")}
            </th>
            <th
              onClick={() => handleColumnClick("preenrollmentDate")}
              className="block md:table-cell cursor-pointer"
            >
              Pré-inscrito em {arrowIcon("preenrollmentDate")}
            </th>
            <th
              onClick={() => handleColumnClick("confirmationDate")}
              className="block md:table-cell cursor-pointer"
            >
              Matriculado em {arrowIcon("confirmationDate")}
            </th>
            <th
              onClick={() => handleColumnClick("lastAccessDate")}
              className="block md:table-cell cursor-pointer"
            >
              Último acesso em {arrowIcon("lastAccessDate")}
            </th>
            <th
              onClick={() => handleColumnClick("progress")}
              className="block md:table-cell cursor-pointer"
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
                  {item.confirmationDate &&
                    dtFormatter.format(item.confirmationDate)}
                </td>
                <td className="block md:table-cell">
                  {" "}
                  {formatDate(item.lastAccessDate, item.cpf)}
                </td>
                <td className="block md:table-cell text-right">
                  {item.progress && `${item.progress.toFixed(2)} %`}
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
