"use client";

import { CourseClassStudentsDAO } from "@/app/dao/CourseClassStudentsDAO";
import { useEffect, useMemo, useState } from "react";
import FilterIcon from "./FilterIcon";
import Link from "next/link";

type Props = {
  courseClassId: string;
  dao: CourseClassStudentsDAO[];
};

export default function CourseClassStudentsList({ courseClassId, dao }: Props) {
  const [sentChecked, setSentChecked] = useState(true);
  const [confirmedChecked, setConfirmedChecked] = useState(false);
  const [activeChecked, setActiveChecked] = useState(false);
  const [finishedChecked, setFinishedChecked] = useState(false);
  const [items, setItems] = useState<CourseClassStudentsDAO[]>(dao);

  useMemo(() => {
    console.log("filtrando-incrível é server e client side ao mesmo tempo");
    setItems(applyFilter());
  }, []);

  function handleChecks(e: HTMLInputElement) {
    e.name == "sentCheck" && setSentChecked(!sentChecked);
    e.name == "confirmedCheck" && setConfirmedChecked(!confirmedChecked);
    e.name == "activeCheck" && setActiveChecked(!activeChecked);
    e.name == "finishedCheck" && setFinishedChecked(!finishedChecked);
  }

  useEffect(() => {
    setItems(applyFilter());
  }, [sentChecked, confirmedChecked, activeChecked, finishedChecked]);

  function applyFilter() {
    const filter = dao.filter((item) => {
      if (item.status == "Sent" && sentChecked) {
        return true;
      }
      if (item.status == "Confirmed" && confirmedChecked) {
        return true;
      }
    });
    return filter;
  }

  function handleOnSelectChange(id: string) {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          item.selected = !item.selected;
        }
        return item;
      })
    );
  }

  return (
    <div>
      <div className="flex items-start flex-col md:items-center md:flex-row bg-gray-200 gap-2 p-4 rounded-lg border border-gray-400 mb-4">
        Status da pré-inscrição
        <label>
          <input
            type="checkbox"
            className="w-4 h-4 m-1 rounded-full text-yellow-400 focus:ring-yellow-400 accent-yellow-400 border border-yellow-400"
            checked={sentChecked}
            name="sentCheck"
            onChange={(e) => handleChecks(e.target)}
          />
          Enviada
        </label>
        <label>
          <input
            type="checkbox"
            className="w-4 h-4 m-1 rounded-full text-blue-500 focus:ring-blue-500 accent-blue-500 border border-blue-500"
            checked={confirmedChecked}
            name="confirmedCheck"
            onChange={(e) => handleChecks(e.target)}
          />
          Confirmada
        </label>
        <label>
          <input
            type="checkbox"
            className="w-4 h-4 m-1 rounded-full text-green-500 focus:ring-green-500 accent-green-500 border border-green-500"
            checked={activeChecked}
            name="activeCheck"
            onChange={(e) => handleChecks(e.target)}
          />
          Ativa
        </label>
        <label>
          <input
            type="checkbox"
            className="w-4 h-4 m-1 rounded-full text-black focus:ring-black accent-black border border-black"
            checked={finishedChecked}
            name="finishedCheck"
            onChange={(e) => handleChecks(e.target)}
          />
          Concluída
        </label>
        <a
          href={`/admin/enrollmentssync/${courseClassId}`}
          className="flex items-center justify-center w-full md:w-max md:px-2 bg-purple-800 text-sm rounded font-bold text-white h-10 hover:bg-purple-600"
        >
          Sincronizar
        </a>
      </div>

      <div className="flex-1">
        <table className="min-w-full text-left">
          <thead className="border-b border-gray-400">
            <tr className="flex flex-col md:flex-row">
              <th className="flex items-center gap-1 md:w-[20%]">
                <input type="checkbox" />
                CPF
              </th>
              <th className="md:w-[30%]">email</th>
              <th className="md:w-[30%]">Nome</th>
              <th className="md:w-[20%]">Sobrenome</th>
            </tr>
          </thead>
          <tbody>
            {items.map((enrollment) => {
              return (
                <tr key={enrollment.id} className="flex flex-col md:flex-row">
                  <td className="flex items-center gap-2 md:w-[20%]">
                    <input
                      type="checkbox"
                      id={`checkbox-${enrollment.id}`}
                      checked={enrollment.selected}
                      onChange={() => handleOnSelectChange(enrollment.id)}
                    />
                    {enrollment.status == "Sent" && (
                      <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                    )}
                    {enrollment.status == "Confirmed" && (
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    )}
                    {enrollment.status == "Active" && (
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    )}
                    {enrollment.status == "Finished" && (
                      <div className="h-2 w-2 rounded-full bg-black"></div>
                    )}
                    <a href={`/admin/enrollment/${enrollment.id}`}>
                      {enrollment.cpf}
                    </a>
                  </td>
                  <td className="md:w-[30%]">{enrollment.email}</td>
                  <td className="md:w-[30%]">{enrollment.name}</td>
                  <td className="md:w-[20%]">{enrollment.lastName}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
