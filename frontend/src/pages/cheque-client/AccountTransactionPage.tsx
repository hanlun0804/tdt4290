import { useLocation, useParams } from "react-router-dom";
import DataTable from "../../components/DataTable";
import { useQuery } from "@tanstack/react-query";
import { Customer } from "../../types/types";
import { requestFormatter } from "../../utils/async";
import CustomerIcon from "../../components/cheque-client/UserIcon";

// Shows all accounts owned by a customer

export default function AccountTransactionsPage() {
  const { accountId } = useParams();
  if (!accountId) throw Error("could not find account id in params");
  const location = useLocation();
  const state = location.state as Customer;
  const { firstName, lastName, socialSecurityNo } = state;

  const { data: transactions } = useQuery({
    queryKey: [accountId, "transactions"],
    queryFn: requestFormatter('cheque-client', `transactions/customer/${socialSecurityNo}`),
  });
  
  console.log(transactions)

  return (
    <div className="flex grow flex-col">
      <div className="flex items-center gap-8 rounded-t-md bg-slate-300 p-1 text-blue-800">
        <CustomerIcon />
        <p>{`${firstName} ${lastName}`}</p>
        <p>{socialSecurityNo}</p>
        <p>Skoleringen 11, 7030 TRONDHEIM, NORGE</p>
        <p className="grow px-2 text-end">Silicon Valley Bank</p>
      </div>
      <div className="flex grow flex-col gap-4 rounded-b-md bg-slate-200 p-20">
        <div className="flex rounded-md border border-slate-400 p-4">
          Put some filters here or something
        </div>
        <DataTable data={transactions} />
      </div>
    </div>
  );
}