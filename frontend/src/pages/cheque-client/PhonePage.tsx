import DataTable from "../../components/DataTable";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Customer } from "../../types/types";
import { Link } from "react-router-dom";
import { requestFormatter } from "../../utils/async";

// Page to query by phone

const additionalColumns = [
  {
    header: "Link",
    render: (row: Customer) => (
      <Link
        state={row}
        to={`/cheque-client/customers/${row.id}`}
        className="text-sm italic underline"
      >{`Go to user ${row.id}`}</Link>
    ),
  },
];

export default function PhonePage() {
  const [phone, setPhone] = useState("");

  const { data: customers, refetch } = useQuery({
    queryKey: ["phone", phone],
    queryFn: requestFormatter("cheque-client", `customer/phone/${phone}`),
    enabled: phone.length > 3,
  });

  useEffect(() => {
    if (phone.length > 3) {
      const handler = setTimeout(() => {
        console.log("refetching");
        refetch();
      }, 500);

      return () => clearTimeout(handler);
    }
  }, [phone, refetch]);

  console.log("customers", customers);

  return (
    <div className="flex grow flex-col">
      <div className="flex items-center gap-8 rounded-t-md bg-slate-300 p-1 text-blue-800"></div>
      <div className="flex grow flex-col gap-4 rounded-b-md bg-slate-200 p-20">
        <div className="flex rounded-md border border-slate-400 p-4">
          <input
            placeholder="search by phone number"
            className="bg-inherit outline-none"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <DataTable data={customers} additionalColumns={additionalColumns} />
      </div>
    </div>
  );
}
