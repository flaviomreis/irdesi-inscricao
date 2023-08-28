"use client";

import { baseUrl } from "@/utils/baseurl";

type Props = {
  id: string;
  title: string;
  endpoint: string;
};

export default function CopyToClipboardButton(props: Props) {
  function copyToClipboard() {
    navigator.clipboard.writeText(`${baseUrl}/${props.endpoint}/${props.id}`);
  }

  return (
    <button
      className="text-slate-600 border border-slate-600 rounded-md py-1 px-2 hover:text-slate-900 hover:border-slate-900"
      onClick={() => copyToClipboard()}
    >
      {props.title}
    </button>
  );
}
