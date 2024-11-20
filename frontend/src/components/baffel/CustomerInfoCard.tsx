import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Customer } from '../../types/types'
import { backendEndpoint } from '../../utils/async'
import CustomerIcon from '../cheque-client/UserIcon'

const emptyCustomer: Customer = {
  id: -1,
  firstName: '?',
  lastName: '?',
  phoneNo: '?',
  socialSecurityNo: '?',
}

export default function CustomerInfoCard({
  customer,
}: {
  customer: Customer | null
}) {
  const { firstName, lastName, id, phoneNo, socialSecurityNo } = !customer
    ? emptyCustomer
    : customer

  return (
    <div className="w-96 min-h-96 rounded-md border-2 border-black bg-blue-800 text-white shadow-xl">
      <div className="flex items-center gap-2 border-b border-black p-2">
        <CustomerIcon />
        <div>{firstName}</div>
        <div>{lastName}</div>
      </div>
      <table>
        <tbody>
          <tr>
            <th>Customer Id:</th>
            <td>{id}</td>
          </tr>
          <tr>
            <th>Phone number:</th>
            <td>{phoneNo}</td>
          </tr>
          <tr>
            <th>Social Security number:</th>
            <td>{socialSecurityNo}</td>
          </tr>

          {id !== -1 && requests.map((req) => (
            <Row request={req} key={req} id={id} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

const requests = [
  'last_transaction',
  'num_of_accounts',
  'num_of_cards',
  'num_of_debit_cards',
  'num_of_credit_cards',
  'type_of_accounts',
  'customer_relation',
  'address',
  'monthly_payments',
  'num_of_loans',
  'all_info_about_one_loan',
  'type_of_accounts_with_balance',
]

type RowProps = {
  id: number
  request: string
}

function Row(props: RowProps) {
  const { id, request } = props
  const { data, isSuccess } = useQuery({
    queryKey: ['customerinfo', id, request],
    queryFn: () =>
      axios
        .get(`${backendEndpoint}/voicebot/customer/${id}/${request}`)
        .then((res) => res.data),
      staleTime: 1000000000
  })

  if (!isSuccess)
    return (
      <tr>
        <td></td>
      </tr>
    )

  return (
    <tr>
      <th>{request.replace(/_/g, ' ')}</th>
      <td>{dataRenderer(data)}</td>
    </tr>
  )
}

const dataRenderer = (obj: any) => {
  const data = obj['data']

  if (typeof data === 'string') return data
  if (typeof data === 'number') return data
  return data.length ?? 'not sure'
}
