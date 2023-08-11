export type CourseClassStudentsDAO = {
  id: string;
  status: EnrollmentStatusType;
  cpf: string;
  email: string;
  name: string;
  lastName: string;
  selected: boolean;
};

export type EnrollmentStatusType = "Sent" | "Confirmed" | "Active" | "Finished";
