"use client";

import { EnrollmentReportItem } from "@/app/enrollmentreport/[id]/page";
import dtFormatter from "@/utils/date-formatter";
import { ArrowDown } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  items: EnrollmentReportItem[];
};

// function cpfSort(a: EnrollmentReportItem, b: EnrollmentReportItem) {
//   return a.cpf.localeCompare(b.cpf);
// }

// function emailSort(a: EnrollmentReportItem, b: EnrollmentReportItem) {
//   return a.email.localeCompare(b.email);
// }

function stringSort(
  a: EnrollmentReportItem,
  b: EnrollmentReportItem,
  field: keyof EnrollmentReportItem
) {
  return (a[field] as string).localeCompare(b[field] as string);
}

function dateSort(
  a: EnrollmentReportItem,
  b: EnrollmentReportItem,
  field: keyof EnrollmentReportItem
) {
  return Number(a[field] as Date) - Number(b[field] as Date);
}

export default function EnrollmentReportList({ items }: Props) {
  const [order, setOrder] = useState("cpf");
  const [orderedList, setOrderedList] = useState(items);

  useEffect(() => {
    const copy = [...items];
    console.log(order);
    if (order === "cpf") {
      copy.sort((a, b) => stringSort(a, b, "cpf"));
    }
    if (order === "email") {
      copy.sort((a, b) => stringSort(a, b, "email"));
    }
    if (order === "name") {
      copy.sort((a, b) => stringSort(a, b, "name"));
    }
    if (order === "lastName") {
      copy.sort((a, b) => stringSort(a, b, "lastName"));
    }
    if (order === "preenrollmentDate") {
      copy.sort((a, b) => dateSort(a, b, "preenrollmentDate"));
    }
    if (order === "confirmationDate") {
      copy.sort((a, b) => dateSort(a, b, "confirmationDate"));
    }

    setOrderedList(copy);
  }, [order]);

  function handleColumnClick(field: string) {
    setOrder(field);
  }

  return (
    <div className="p-4">
      <table className="text-left table-auto w-full">
        <thead className="border-b border-gray-400">
          <tr>
            <th
              onClick={() => handleColumnClick("cpf")}
              className="block md:table-cell"
            >
              CPF {order == "cpf" && <ArrowDown size={12} className="inline" />}
            </th>
            <th
              onClick={() => handleColumnClick("email")}
              className="block md:table-cell"
            >
              email{" "}
              {order == "email" && <ArrowDown size={12} className="inline" />}
            </th>
            <th
              onClick={() => handleColumnClick("employeeId")}
              className="block md:table-cell"
            >
              Matrícula{" "}
              {order == "employeeId" && (
                <ArrowDown size={12} className="inline" />
              )}
            </th>
            <th
              onClick={() => handleColumnClick("name")}
              className="block md:table-cell"
            >
              Nome{" "}
              {order == "name" && <ArrowDown size={12} className="inline" />}
            </th>
            <th
              onClick={() => handleColumnClick("lastName")}
              className="block md:table-cell"
            >
              Sobrenome{" "}
              {order == "lastName" && (
                <ArrowDown size={12} className="inline" />
              )}
            </th>
            <th
              onClick={() => handleColumnClick("preenrollmentDate")}
              className="block md:table-cell"
            >
              Pré-inscrito em{" "}
              {order == "preenrollmentDate" && (
                <ArrowDown size={12} className="inline" />
              )}
            </th>
            <th
              onClick={() => handleColumnClick("confirmationDate")}
              className="block md:table-cell"
            >
              Matriculado em{" "}
              {order == "confirmationDate" && (
                <ArrowDown size={12} className="inline" />
              )}
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
                  {dtFormatter.format(item.preenrollmentDate)}
                </td>
                <td className="block md:table-cell">
                  {dtFormatter.format(item.confirmationDate)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
