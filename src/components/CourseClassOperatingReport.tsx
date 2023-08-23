import { CourseClassStudentsDAO } from "@/app/dao/CourseClassStudentsDAO";

type Props = {
  items: CourseClassStudentsDAO[];
};

export default function CourseClassOperatingReport(props: Props) {
  return (
    <div className="flex-1 mt-2">
      <table className="min-w-full text-left">
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
    </div>
  );
}
