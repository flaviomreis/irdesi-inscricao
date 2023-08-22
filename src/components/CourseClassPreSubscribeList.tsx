"use client";

import { CourseClassStudentsDAO } from "@/app/dao/CourseClassStudentsDAO";
import { useState } from "react";
import { useRouter } from "next/navigation";
import DownloadButton from "./DownloadButton";

type Props = {
  courseClassId: string;
  city: string;
  total: {
    sentTotal: number;
    confirmedTotal: number;
  };
  items: CourseClassStudentsDAO[];
  subscribing: boolean;
  showSubscribeReport: () => void;
  sentChecked: boolean;
  confirmedChecked: boolean;
  activeChecked: boolean;
  finishedChecked: boolean;
  checkAll: boolean;
  toogleSentChecked: () => boolean;
  toogleConfirmedChecked: () => boolean;
  toogleActiveChecked: () => boolean;
  toogleFinishedChecked: () => boolean;
  handleOnSelectChange: (id: string) => void;
  handleCheckAll: () => void;
  courseClassMoodleId: string;
};

export default function CourseClassPreSubscribeList(props: Props) {
  const [synchronizing, setSynchronizing] = useState(false);
  const router = useRouter();

  function handleChecks(e: HTMLInputElement) {
    e.name == "sentCheck" && props.toogleSentChecked();
    e.name == "confirmedCheck" && props.toogleConfirmedChecked();
    e.name == "activeCheck" && props.toogleActiveChecked();
    e.name == "finishedCheck" && props.toogleFinishedChecked();
  }

  async function handleSyncButton() {
    setSynchronizing(true);
    const result = await fetch(
      `/api/enrollmentssync/${props.courseClassId}?moodle_id=${props.courseClassMoodleId}`
    );
    if (result.status !== 200) {
      const json = await result.json();
    }
    setSynchronizing(false);
    router.back();
  }

  async function handleSubscribeButton() {
    props.items.map(async (item) => {
      if (item.selected) {
        const result = await fetch(`/api/enrollincourseclass`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            item,
            city: props.city,
          }),
        });
        const json = await result.json();
        item.error = await json.error;
      }
    });
    console.log(props.items);
    props.showSubscribeReport();
  }

  async function handleDownloadButton(zip: boolean, groups: number) {
    const result = await fetch(
      `/api/download/${props.courseClassId}?checked=${zip}&groups=${groups}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/csv",
        },
        body: JSON.stringify({
          dao: props.items,
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
            checked={props.sentChecked}
            name="sentCheck"
            onChange={(e) => handleChecks(e.target)}
          />
          Enviada ({props.total.sentTotal})
        </label>
        <label>
          <input
            type="checkbox"
            className="w-4 h-4 m-1 rounded-full text-blue-500 focus:ring-blue-500 accent-blue-500 border border-blue-500"
            checked={props.confirmedChecked}
            name="confirmedCheck"
            onChange={(e) => handleChecks(e.target)}
          />
          Confirmada ({props.total.confirmedTotal})
        </label>
        <label>
          <input
            type="checkbox"
            className="w-4 h-4 m-1 rounded-full text-green-500 focus:ring-green-500 accent-green-500 border border-green-500"
            checked={props.activeChecked}
            name="activeCheck"
            onChange={(e) => handleChecks(e.target)}
          />
          Ativa (0)
        </label>
        <label>
          <input
            type="checkbox"
            className="w-4 h-4 m-1 rounded-full text-black focus:ring-black accent-black border border-black"
            checked={props.finishedChecked}
            name="finishedCheck"
            onChange={(e) => handleChecks(e.target)}
          />
          Concluída (0)
        </label>
        <div className="flex md:flex-1 w-full justify-between items-center">
          <button
            className="flex items-center justify-center w-full md:w-max md:px-2 bg-purple-800 text-sm rounded font-bold text-white h-10 hover:bg-purple-600"
            disabled={synchronizing}
            onClick={handleSyncButton}
          >
            {synchronizing ? "Sincronizando" : "Sincronizar"}
          </button>
          <button
            className="flex items-center justify-center w-full md:w-max md:px-2 bg-purple-800 text-sm rounded font-bold text-white h-10 hover:bg-purple-600"
            disabled={props.subscribing}
            onClick={handleSubscribeButton}
          >
            {props.subscribing ? "Inscrevendo" : "Inscrever"}
          </button>
        </div>
      </div>

      <DownloadButton
        courseClassId={props.courseClassId}
        handleButton={handleDownloadButton}
      />

      <div className="flex-1 mt-2">
        <table className="min-w-full text-left">
          <thead className="border-b border-gray-400">
            <tr className="flex flex-col md:flex-row">
              <th className="flex items-center gap-1 md:w-[15%]">
                <input
                  type="checkbox"
                  checked={props.checkAll}
                  onChange={props.handleCheckAll}
                />
                CPF
              </th>
              <th className="md:w-[25%]">email</th>
              <th className="md:w-[35%]">Nome</th>
              <th className="md:w-[25%]">Sobrenome</th>
            </tr>
          </thead>
          <tbody>
            {props.items.map((enrollment) => {
              return (
                <tr key={enrollment.id} className="flex flex-col md:flex-row">
                  <td className="flex items-center gap-2 md:w-[20%]">
                    <input
                      type="checkbox"
                      id={`checkbox-${enrollment.id}`}
                      checked={enrollment.selected}
                      onChange={() => props.handleOnSelectChange(enrollment.id)}
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
                      {enrollment.cpf}-{enrollment.error}
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
