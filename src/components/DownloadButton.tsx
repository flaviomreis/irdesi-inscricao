"use client";

import { CourseClassStudentsDAO } from "@/dao/CourseClassStudentsDAO";
import Link from "next/link";
import { useState } from "react";

type Props = {
  courseClassId: string;
  handleButton: (zip: boolean, groups: number) => void;
};

export default function DownloadButton({ courseClassId, handleButton }: Props) {
  const [zip, setZip] = useState(false);
  const [groups, setGroups] = useState(100);

  return (
    <div className="flex flex-col items-center md:flex-row">
      <button
        onClick={() => handleButton(zip, groups)}
        className="flex items-center justify-center w-full md:flex-1 bg-purple-800 text-sm rounded font-bold text-white h-10 hover:bg-purple-600"
      >
        Download
      </button>
      <label className="px-4">
        <input
          className="mr-2"
          type="checkbox"
          checked={zip}
          onChange={(e) => setZip(!zip)}
        />
        Zip
      </label>
      <label className="text-xs">
        a cada
        <input
          className="text-xs w-20 border-0 mt-2 md:mt-0 px-0 ml-2 py-1 text-right bg-gray-200"
          type="number"
          value={groups}
          onChange={(e) => setGroups(+e.target.value)}
          step="100"
        />
      </label>
    </div>
  );
}
