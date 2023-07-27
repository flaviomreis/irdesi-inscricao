export type CourseClassStudentsDAO = {
  id: string;
  status: EnrollmentStatusType;
  cpf: string;
  email: string;
  name: string;
  lastName: string;
};

export type EnrollmentStatusType = "Sent" | "Confirmed" | "Active" | "Finished";
