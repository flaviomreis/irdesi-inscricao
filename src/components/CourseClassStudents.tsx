"use client";

import { CourseClassStudentsDAO } from "@/dao/CourseClassStudentsDAO";
import { useEffect, useState } from "react";
import CourseClassStudentsList from "./CourseClassStudentsList";
import CourseClassOperatingReport from "./CourseClassOperatingReport";

type Props = {
  courseClassId: string;
  courseClassMoodleId: string;
  dao: CourseClassStudentsDAO[];
  city: string;
  moodle_id: string;
  total: {
    sentTotal: number;
    confirmedTotal: number;
    activeTotal: number;
    completedTotal: number;
  };
};

export default function CourseClassStudents({
  courseClassId,
  courseClassMoodleId,
  dao,
  city,
  moodle_id,
  total,
}: Props) {
  const [operating, setOperating] = useState(false);

  const [sentChecked, setSentChecked] = useState(false);
  const [confirmedChecked, setConfirmedChecked] = useState(false);
  const [activeChecked, setActiveChecked] = useState(false);
  const [completedChecked, setCompletedChecked] = useState(false);
  const [items, setItems] = useState<CourseClassStudentsDAO[]>(applyFilter());
  const [checkAll, setCheckAll] = useState(false);

  function applyFilter() {
    const filter = dao.filter((item) => {
      if (item.status === "Sent" && sentChecked) {
        return true;
      }
      if (item.status === "Confirmed" && confirmedChecked) {
        return true;
      }
      if (item.status === "Active" && activeChecked) {
        return true;
      }
      if (item.status === "Completed" && completedChecked) {
        return true;
      }
    });
    return filter;
  }

  useEffect(() => {
    setItems(applyFilter());
  }, [
    sentChecked,
    confirmedChecked,
    activeChecked,
    completedChecked,
    checkAll,
  ]);

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

  function toogleCompletedChecked(): boolean {
    setCompletedChecked(!completedChecked);
    return !completedChecked;
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
      moodle_id={moodle_id}
      total={total}
      items={items}
      showOperatingReport={showOperatingReport}
      sentChecked={sentChecked}
      confirmedChecked={confirmedChecked}
      activeChecked={activeChecked}
      completedChecked={completedChecked}
      checkAll={checkAll}
      toogleSentChecked={toogleSentChecked}
      toogleConfirmedChecked={toogleConfirmedChecked}
      toogleActiveChecked={toogleActiveChecked}
      toogleCompletedChecked={toogleCompletedChecked}
      handleOnSelectChange={handleOnSelectChange}
      handleCheckAll={handleCheckAll}
    />
  ) : (
    <CourseClassOperatingReport courseClassId={courseClassId} items={items} />
  );
}
