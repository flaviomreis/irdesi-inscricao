"use client";

import { CourseClassStudentsDAO } from "@/app/dao/CourseClassStudentsDAO";
import { useState } from "react";
import CourseClassStudentsList from "./CourseClassStudentsList";

type Props = {
  courseClassId: string;
  dao: CourseClassStudentsDAO[];
  city: string;
  total: {
    sentTotal: number;
    confirmedTotal: number;
  };
};

export default function CourseClassSubscribe({
  courseClassId,
  dao,
  city,
  total,
}: Props) {
  const [subscribing, setSubscribing] = useState(false);
  const [synchronizing, setSynchronizing] = useState(false);

  function handleSubscribeButton() {
    console.log("click on subscribe");
  }

  // async function handleSubscribeButton() {
  //   items.map(async (item) => {
  //     if (item.selected) {
  //       const result = await fetch(`/api/enrollincourseclass`, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           item,
  //           city,
  //         }),
  //       });
  //       const json = await result.json();
  //       item.error = json.error;
  //       console.log(json.error);
  //     }
  //   });
  // }

  return (
    !subscribing && (
      <CourseClassStudentsList
        courseClassId={courseClassId}
        dao={dao}
        total={total}
        handleSubscribe={handleSubscribeButton}
      />
    )
  );
}
