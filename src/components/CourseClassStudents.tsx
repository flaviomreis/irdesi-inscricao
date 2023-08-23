"use client";

import { CourseClassStudentsDAO } from "@/app/dao/CourseClassStudentsDAO";
import { useEffect, useState } from "react";
import CourseClassStudentsList from "./CourseClassStudentsList";
import CourseClassOperatingReport from "./CourseClassOperatingReport";

type Props = {
  courseClassId: string;
  courseClassMoodleId: string;
  dao: CourseClassStudentsDAO[];
  city: string;
  total: {
    sentTotal: number;
    confirmedTotal: number;
  };
};

export default function CourseClassStudents({
  courseClassId,
  courseClassMoodleId,
  dao,
  city,
  total,
}: Props) {
  const [operating, setOperating] = useState(false);

  const [sentChecked, setSentChecked] = useState(false);
  const [confirmedChecked, setConfirmedChecked] = useState(false);
  const [activeChecked, setActiveChecked] = useState(false);
  const [finishedChecked, setFinishedChecked] = useState(false);
  const [items, setItems] = useState<CourseClassStudentsDAO[]>(applyFilter());
  const [checkAll, setCheckAll] = useState(false);

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

  useEffect(() => {
    setItems(applyFilter());
  }, [sentChecked, confirmedChecked, activeChecked, finishedChecked, checkAll]);

  function showOperatingReport() {
    setOperating(true);
    setItems(items.filter((item) => item.selected));
  }

  function toogleSentChecked(): boolean {
    setSentChecked(!sentChecked);
    return !sentChecked;
  }

  function toogleConfirmedChecked(): boolean {
    setConfirmedChecked(!confirmedChecked);
    return !confirmedChecked;
  }

  function toogleActiveChecked(): boolean {
    setActiveChecked(!activeChecked);
    return !activeChecked;
  }

  function toogleFinishedChecked(): boolean {
    setFinishedChecked(!finishedChecked);
    return !finishedChecked;
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

  function handleCheckAll() {
    setCheckAll(!checkAll);
    dao.map((item) => {
      item.selected = !checkAll;
      return item;
    });
  }

  return !operating ? (
    <CourseClassStudentsList
      courseClassId={courseClassId}
      courseClassMoodleId={courseClassMoodleId}
      city={city}
      total={total}
      items={items}
      showOperatingReport={showOperatingReport}
      sentChecked={sentChecked}
      confirmedChecked={confirmedChecked}
      activeChecked={activeChecked}
      finishedChecked={finishedChecked}
      checkAll={checkAll}
      toogleSentChecked={toogleSentChecked}
      toogleConfirmedChecked={toogleConfirmedChecked}
      toogleActiveChecked={toogleActiveChecked}
      toogleFinishedChecked={toogleFinishedChecked}
      handleOnSelectChange={handleOnSelectChange}
      handleCheckAll={handleCheckAll}
    />
  ) : (
    <CourseClassOperatingReport courseClassId={courseClassId} items={items} />
  );
}
