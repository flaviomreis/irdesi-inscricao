"use client";

import { EnrollmentReportItem } from "@/app/enrollmentreport/[id]/page";
import { useState } from "react";
import PreEnrollmentReportList from "./PreEnrollmentReportList";
import EnrollmentReportList from "./EnrollmentReportList";

type Props = {
  preEnrollmentReportItems: EnrollmentReportItem[];
  enrollmentReportItems: EnrollmentReportItem[];
  courseClassId: string;
  canEnrollStudent: boolean;
  amountOfStudents: number;
};

export default function ShowEnrollmentReports({
  preEnrollmentReportItems,
  enrollmentReportItems,
  courseClassId,
  canEnrollStudent,
  amountOfStudents,
}: Props) {
  const [orderedPreEnrollmentList, setOrderedPreEnrollmentList] = useState(
    preEnrollmentReportItems
  );
  const [orderedEnrollmentList, setOrderedEnrollmentList] = useState(
    enrollmentReportItems
  );

  return (
    <>
      {canEnrollStudent && (
        <PreEnrollmentReportList
          enrollmentReportItems={orderedEnrollmentList}
          setEnrollmentReportItems={setOrderedEnrollmentList}
          preEnrollmentReportItems={orderedPreEnrollmentList}
          setPreEnrollmentReportItems={setOrderedPreEnrollmentList}
          courseClassId={courseClassId}
          amountOfStudents={amountOfStudents}
        />
      )}

      <EnrollmentReportList
        orderedList={orderedEnrollmentList}
        setOrderedList={setOrderedEnrollmentList}
        courseClassId={courseClassId}
      />
    </>
  );
}
