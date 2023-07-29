"use client";

import { CourseClassStudentsDAO } from "@/app/dao/CourseClassStudentsDAO";
import { useEffect, useState } from "react";
import FilterIcon from "./FilterIcon";

export default function CourseClassStudentsList({
  dao,
}: {
  dao: CourseClassStudentsDAO[];
}) {
  const [sentChecked, setSentChecked] = useState(true);
  const [confirmedChecked, setConfirmedChecked] = useState(false);
  const [activeChecked, setActiveChecked] = useState(false);
  const [finishedChecked, setFinishedChecked] = useState(false);
  const items: CourseClassStudentsDAO[] = applyFilter();
  const [isVisibleFilterPanel, setIsVisibleFilterPanel] = useState(false);

  function handleChecks(e: HTMLInputElement) {
    e.name == "sentCheck" && setSentChecked(!sentChecked);
    e.name == "confirmedCheck" && setConfirmedChecked(!confirmedChecked);
    e.name == "activeCheck" && setActiveChecked(!activeChecked);
    e.name == "finishedCheck" && setFinishedChecked(!finishedChecked);
    applyFilter();
  }

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

  function toogleFilterPanel() {
    setIsVisibleFilterPanel(!isVisibleFilterPanel);
  }

  return (
    <div className="relative flex">
      <div
        className={
          isVisibleFilterPanel
            ? "bg-gray-300 w-48 absolute rounded-lg border border-gray-400 text-gray-500 -top-4 -left-4"
            : "w-48 absolute hidden"
        }
      >
        <div className="flex flex-col gap-2 p-4 shadow-lg shadow-gray-400">
          <FilterIcon toogleVisibility={toogleFilterPanel} />
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
        </div>
      </div>

      <div className="flex-1">
        <table className="min-w-full text-left">
          <thead className="border-b border-gray-400">
            <tr className="flex flex-col md:flex-row">
              <th className="flex items-center gap-1 md:w-[20%]">
                <FilterIcon toogleVisibility={toogleFilterPanel} />
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
                  <td className="md:w-[20%]">
                    <div className="flex items-center gap-2">
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
                    </div>
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
