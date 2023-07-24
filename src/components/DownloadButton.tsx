"use client";

import { useRouter } from "next/navigation";

type Props = {
  courseClassId: string;
};

export default function DownloadButton({ courseClassId }: Props) {
  const router = useRouter();

  async function handleClick() {
    const checked = (document.getElementById("checked") as HTMLInputElement)
      .checked;
    console.log(checked);
    router.push(`/api/download/${courseClassId}?checked=${checked}`);
  }

  return (
    <div className="flex items-center">
      <button
        onClick={handleClick}
        className="flex items-center justify-center flex-1 bg-purple-800 text-sm rounded font-bold text-white h-10 hover:bg-purple-600"
      >
        Download
      </button>
      <label className="px-4">
        <input className="mr-2" type="checkbox" id="checked" />
        Zip
      </label>
    </div>
  );
}
