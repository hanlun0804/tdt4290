import { ReactNode } from "react";
import { cn } from "../utils/cn";

type DataTableProps<T> = {
  className?: string;
  data: T[];
  additionalColumns?: {
    header: string;
    render: (item: T) => ReactNode;
  }[];
};

export default function DataTable<T extends object>(props: DataTableProps<T>) {
  const { data, additionalColumns, className } = props;

  const headers: string[] =
    !!data && data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <table className={cn("h-fit w-full", className)}>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th
              key={i}
              className="border border-slate-400 bg-slate-300 first-letter:uppercase"
            >
              {h}
            </th>
          ))}
          {additionalColumns?.map((h) => (
            <th
              key={h.header}
              className="border border-slate-400 bg-slate-300 first-letter:uppercase"
            >
              {h.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data?.map((item, rowIndex) => (
          <tr key={rowIndex}>
            {Object.values(item).map((value, colIndex) => (
              <td
                className="border border-slate-400 text-center first-letter:uppercase"
                key={colIndex}
              >
                {value as string}
              </td>
            ))}
            {additionalColumns?.map((col) => (
              <td
                key={col.header}
                className="border border-slate-400 text-center first-letter:uppercase"
              >
                {col.render(item)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
