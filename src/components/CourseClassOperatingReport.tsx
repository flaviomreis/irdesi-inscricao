import { CourseClassStudentsDAO } from "@/dao/CourseClassStudentsDAO";

type Props = {
  items: CourseClassStudentsDAO[];
  courseClassId: string;
};

export default function CourseClassOperatingReport(props: Props) {
  return (
    <div className="flex-1 mt-2 min-w-full">
      <p>teste</p>
      <table className="min-w-full text-left mb-4">
        <thead className="border-b border-gray-400">
          <tr className="flex flex-col md:flex-row">
            <th className="md:w-[15%]">CPF</th>
            <th className="md:w-[25%]">email</th>
            <th className="md:w-[60%]">Resultado</th>
          </tr>
        </thead>
        <tbody>
          {props.items.map((enrollment) => {
            return (
              enrollment.selected && (
                <tr
                  key={enrollment.id}
                  className="flex flex-col md:flex-row even:bg-white odd:bg-gray-200"
                >
                  <td className="md:w-[15%]">{enrollment.cpf}</td>
                  <td className="md:w-[25%]">{enrollment.email}</td>
                  <td className="md:w-[60%]">{enrollment.error}</td>
                </tr>
              )
            );
          })}
        </tbody>
      </table>
      <a
        href={`/admin/courseclass/${props.courseClassId}`}
        className="flex items-center justify-center px-4 md:w-40 bg-purple-800 text-sm rounded font-bold text-white h-10 hover:bg-purple-600"
      >
        Voltar
      </a>
    </div>
  );
}
