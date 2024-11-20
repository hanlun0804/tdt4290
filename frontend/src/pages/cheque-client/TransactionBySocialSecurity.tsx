import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import DataTable from "../../components/DataTable";
import { requestFormatter } from "../../utils/async";

export default function TransactionBySocialSecurity() {
  const [ssn, setSsn] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);

  const { mutate } = useMutation({
    mutationFn: requestFormatter('cheque-client', `transactions/customer/${ssn}`),
    onSuccess: (res) => {
      setTransactions(res.data);
    },
  });

  return (
    <div className="flex grow flex-col justify-between rounded-md bg-slate-200 p-20">
      <div className="grid grid-cols-2 rounded-md border border-slate-400 p-4">
          <input
            className="w-80 border-b border-slate-400 bg-inherit p-2 text-center outline-none"
            value={ssn}
            onChange={(e) => setSsn(e.target.value)}
          />
          <button onClick={() => mutate()} className="border border-slate-400 px-8">Search</button>
      </div>
      <DataTable
        data={transactions}
      />
    </div>
  );
}
