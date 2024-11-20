import { useQuery } from "@tanstack/react-query";
import DataTable from "../../components/DataTable";
import { Customer } from "../../types/types";
import { Link } from "react-router-dom";
import { ChangeEvent } from "react";
import { useImmer } from "use-immer";
import axios from "axios";
import { backendEndpoint } from "../../utils/async";

const additionalColumns = [
  {
    header: "Link",
    render: (item: Customer) => (
      <Link
        to={`customers/${item.id}`}
        state={item}
        className="italic underline"
      >
        Go to customer {item.id}
      </Link>
    ),
  },
];

const emptyCustomer: Customer = {
  id: 0,
  firstName: "",
  lastName: "",
  phoneNo: "",
  socialSecurityNo: "",
};

const terms = ["firstName", "lastName", "phoneNo", "socialSecurityNo"] as const;
type Term = (typeof terms)[number];

// haha
const customerFilter = (
  customer: Customer,
  searchTerms: Customer,
  attribute: Term,
) =>
  customer[attribute]
    .toLowerCase()
    .includes(searchTerms[attribute].toLowerCase());

export default function CustomerQueryPage() {
  const [searchTerms, setSearchTerms] = useImmer(emptyCustomer);

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["Customer"],
    queryFn: () =>
      axios
        .get(`${backendEndpoint}/userland/data/Customer`)
        .then((res) => res.data),
  });

  const filteredCustomers =
    customers
      ?.filter((customer) => customerFilter(customer, searchTerms, "firstName"))
      .filter((customer) => customerFilter(customer, searchTerms, "lastName"))
      .filter((customer) =>
        customerFilter(customer, searchTerms, "socialSecurityNo"),
      ) ?? [];

  const updateSearchTerm = (
    attribute: Term,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setSearchTerms((draft) => {
      draft[attribute] = e.target.value;
    });
  };

  return (
    <div className="flex grow flex-col justify-between rounded-md bg-slate-200 p-20">
      <div className="grid grid-cols-2 rounded-md border border-slate-400 p-4">
        {terms.map((term) => (
          <input
            key={term}
            placeholder={term}
            className="w-80 border-b border-slate-400 bg-inherit p-2 text-center outline-none"
            value={searchTerms[term]}
            onChange={(e) => updateSearchTerm(term, e)}
          />
        ))}
      </div>
      <DataTable
        data={filteredCustomers}
        additionalColumns={additionalColumns}
      />
    </div>
  );
}
