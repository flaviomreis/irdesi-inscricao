"use client";

import { CourseClassStudentsDAO } from "@/app/dao/CourseClassStudentsDAO";
import { useEffect, useState } from "react";

export default function CourseClassStudentsList({
  dao,
}: {
  dao: CourseClassStudentsDAO[];
}) {
  const [sentChecked, setSentChecked] = useState(true);
  const [confirmedChecked, setConfirmedChecked] = useState(true);
  const [activeChecked, setActiveChecked] = useState(false);
  const [finishedChecked, setFinishedChecked] = useState(false);
  const items: CourseClassStudentsDAO[] = applyFilter();

  function handleChecks(e: HTMLInputElement) {
    console.log(e.name);
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

  return (
    <div className="relative flex">
      <div className="bg-gray-300 text-blue-100 w-48">
        <div className="flex flex-col gap-2 border border-gray-400 text-gray-500">
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
              defaultChecked={false}
            />
            Ativa
          </label>
          <label>
            <input
              type="checkbox"
              className="w-4 h-4 m-1 rounded-full text-black focus:ring-black accent-black border border-black"
              defaultChecked={false}
            />
            Concluída
          </label>
        </div>
      </div>

      <div className="flex-1">
        <table className="min-w-full text-left">
          <thead>
            <tr>
              <th>CPF</th>
              <th>email</th>
              <th>Nome</th>
              <th>Sobrenome</th>
            </tr>
          </thead>
          <tbody>
            {items.map((enrollment) => {
              return (
                <tr key={enrollment.id}>
                  <td>
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
                  <td>{enrollment.email}</td>
                  <td>{enrollment.name}</td>
                  <td>{enrollment.lastName}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
