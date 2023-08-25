export type CourseClassStudentsDAO = {
  id: string;
  status: EnrollmentStatusType;
  cpf: string;
  email: string;
  name: string;
  lastName: string;
  created_at: string;
  selected: boolean;
  error: string | null;
};

export type EnrollmentStatusType = "Sent" | "Confirmed" | "Active" | "Finished";
