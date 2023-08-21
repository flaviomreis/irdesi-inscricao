"use client";

import { CourseClassStudentsDAO } from "@/app/dao/CourseClassStudentsDAO";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DownloadButton from "./DownloadButton";

type Props = {
  courseClassId: string;
  dao: CourseClassStudentsDAO[];
  total: {
    sentTotal: number;
    confirmedTotal: number;
  };
  handleSubscribe: () => void;
};

export default function CourseClassStudentsList({
  courseClassId,
  dao,
  total,
  handleSubscribe,
}: Props) {
  const [sentChecked, setSentChecked] = useState(false);
  const [confirmedChecked, setConfirmedChecked] = useState(false);
  const [activeChecked, setActiveChecked] = useState(false);
  const [finishedChecked, setFinishedChecked] = useState(false);
  const [checkAll, setCheckAll] = useState(false);
  const router = useRouter();
  const [items, setItems] = useState<CourseClassStudentsDAO[]>(applyFilter());

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

  async function handleSyncButton() {
    const result = await fetch(`/api/enrollmentssync/${courseClassId}`);
    if (result.status !== 200) {
      const json = await result.json();
    }
    router.back();
  }

  function handleCheckAll() {
    setCheckAll(!checkAll);
    setItems(
      items.map((item) => {
        item.selected = !checkAll;
        return item;
      })
    );
  }

  async function handleButton(zip: boolean, groups: number) {
    const result = await fetch(
      `/api/download/${courseClassId}?checked=${zip}&groups=${groups}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/csv",
        },
        body: JSON.stringify({
          dao: items,
        }),
      }
    );

    let filename = zip ? "download.zip" : "download.csv";
    const header = result.headers.get("content-disposition");
    if (header != null) {
      filename = header.replace("attachment; filename=", "");
    }

    const href = window.URL.createObjectURL(await result.blob());
    const link = document.createElement("a");
    link.href = href;
    link.setAttribute("download", filename); //or any other extension
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          Enviada ({total.sentTotal})
        </label>
        <label>
          <input
            type="checkbox"
            className="w-4 h-4 m-1 rounded-full text-blue-500 focus:ring-blue-500 accent-blue-500 border border-blue-500"
            checked={confirmedChecked}
            name="confirmedCheck"
            onChange={(e) => handleChecks(e.target)}
          />
          Confirmada ({total.confirmedTotal})
        </label>
        <label>
          <input
            type="checkbox"
            className="w-4 h-4 m-1 rounded-full text-green-500 focus:ring-green-500 accent-green-500 border border-green-500"
            checked={activeChecked}
            name="activeCheck"
            onChange={(e) => handleChecks(e.target)}
          />
          Ativa (0)
        </label>
        <label>
          <input
            type="checkbox"
            className="w-4 h-4 m-1 rounded-full text-black focus:ring-black accent-black border border-black"
            checked={finishedChecked}
            name="finishedCheck"
            onChange={(e) => handleChecks(e.target)}
          />
          Concluída (0)
        </label>
        <div className="flex md:flex-1 w-full justify-between items-center">
          <button
            className="flex items-center justify-center w-full md:w-max md:px-2 bg-purple-800 text-sm rounded font-bold text-white h-10 hover:bg-purple-600"
            onClick={handleSyncButton}
          >
            Sincronizar
          </button>
          <button
            className="flex items-center justify-center w-full md:w-max md:px-2 bg-purple-800 text-sm rounded font-bold text-white h-10 hover:bg-purple-600"
            onClick={handleSubscribe}
          >
            Inscrever
          </button>
        </div>
      </div>

      <DownloadButton
        courseClassId={courseClassId}
        handleButton={handleButton}
      />

      <div className="flex-1 mt-2">
        <table className="min-w-full text-left">
          <thead className="border-b border-gray-400">
            <tr className="flex flex-col md:flex-row">
              <th className="flex items-center gap-1 md:w-[20%]">
                <input
                  type="checkbox"
                  checked={checkAll}
                  onChange={handleCheckAll}
                />
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
                      {!enrollment.error ? "" : ` [${enrollment.error}]`}
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
