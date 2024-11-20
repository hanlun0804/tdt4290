import { ChangeEvent, useEffect, useState } from 'react'
import {
  backendEndpoint,
  requestFormatter,
  TableName,
  tableNames,
} from '../../utils/async'
import { cn } from '../../utils/cn'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import DataTable from '../../components/DataTable'
import BankingDiagram from '../../components/userland/BankingDiagram'
import axios from 'axios'

// now for the actual data creation ...
// THIS PAGE IS A MESS - don't judge too harshly

export default function CreateDataPage() {
  const [selectedTable, setSelectedTable] = useState<TableName>(tableNames[0])
  const [selections, setSelections] = useState<Record<string, string>>({})

  const { data, isSuccess } = useQuery({
    queryKey: [selectedTable],
    queryFn: requestFormatter('userland', `data/${selectedTable}`),
    staleTime: 1000 * 60 * 60,
  })

  // could probably add a useMemo here
  const additionalColumns = [
    {
      header: 'Select',
      render: (row: any) => {
        const key = selectedTable.toLowerCase()
        const selectedId = `${key}_id`
        const isSelected = selections[selectedId] === row.id

        const selectRow = () => {
          if (isSelected) {
            const newSelections = { ...selections }
            delete newSelections[selectedId]
            setSelections(newSelections)
            return
          }
          setSelections((old) => ({
            ...old,
            [selectedId]: row.id,
          }))
        }

        return (
          <button onClick={selectRow} className="flex w-full justify-center">
            <p
              className={cn(
                'size-4 border border-black italic underline',
                isSelected && 'bg-ol-400',
              )}
            ></p>
          </button>
        )
      },
    },
  ]

  if (!isSuccess) return <p>Loading {selectedTable}</p>

  return (
    <div className="relative flex min-h-screen flex-col gap-10 bg-slate-200 p-20">
      <BankingDiagram />
      <p>Tables in the database: </p>
      <div className="flex items-center gap-4">
        {tableNames.map((table) => (
          <button
            onClick={() => setSelectedTable(table)}
            className={cn(
              'border-b-2 border-slate-400 px-2 text-center w-full justify-between first-letter:uppercase',
              selectedTable === table && 'border-ol-400',
            )}
            key={table}
          >
            {table}
          </button>
        ))}
      </div>
      <DataTable data={data} additionalColumns={additionalColumns} />
      <SelectedIds selections={selections} />
      <CreateDataTable
        selections={selections}
        tableName={selectedTable}
        data={data}
      />
    </div>
  )
}

function SelectedIds({ selections }: { selections: Record<string, string> }) {
  return (
    <div className="border-y border-slate-400 py-2">
      {Object.entries(selections).map(([key, value]) => (
        <div key={key} className="flex gap-2">
          <p>{key}</p>
          <p>{value}</p>
        </div>
      ))}
    </div>
  )
}

// oh boy, this is going to be ugly...........
// PLEASE let me know if you are aware of better ways to do this

type TableHeader = {
  name: string
  type: string
}

type CreateTableProps<T> = {
  data: T[]
  tableName: TableName
  selections: Record<string, string>
}

// This one is a little bit broken, but I don't know why 

function CreateDataTable<T extends object>(props: CreateTableProps<T>) {
  const { data, tableName, selections } = props
  const [newEntry, setNewEntry] = useState<Record<string, string>>({})

  // if the data is empty, we cannot get the schema from the object...
  const { data: schema, isSuccess: isSchemaQueried } = useQuery<TableHeader[]>({
    queryKey: ['schema', tableName],
    queryFn: () =>
      axios
        .get(`${backendEndpoint}/userland/schema/${tableName}`)
        .then((res) => res.data),
    enabled: data.length === 0,
    staleTime: 1000 * 60 * 60,
  })

  const headers = isSchemaQueried
    ? schema.map((column) => column.name)
    : data.length > 0
      ? Object.keys(data[0])
      : []

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewEntry((old) => ({
      ...old,
      [e.target.name]: e.target.value,
    }))
  }

  useEffect(() => {
    const prefilledEntry: Record<string, string> = {}
    headers.forEach((header) => {
      prefilledEntry[header] = selections[header] ?? ''
    })
    setNewEntry(prefilledEntry)
  }, [headers.length])

  const queryClient = useQueryClient()
  const { mutate } = useMutation({
    mutationFn: requestFormatter('userland', `insert/${tableName}`, newEntry),
    onSuccess: () => {
      const prefilledEntry: Record<string, string> = {}
      headers.forEach((header) => {
        prefilledEntry[header] = selections[header] ?? ''
      })
      setNewEntry(prefilledEntry)
      queryClient.invalidateQueries({ queryKey: [tableName] })
    },
  })

  return (
    <div className="flex flex-col gap-2">
      <p>Create new entry</p>
      <table className="w-full">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} className="border border-slate-400 bg-slate-300">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {headers.map((h) => (
              <td key={h} className="border border-slate-400">
                <input
                  autoComplete="off"
                  name={h}
                  value={newEntry[h] ?? ''}
                  onChange={handleChange}
                  className="w-full bg-inherit text-center outline-none"
                  placeholder={h}
                />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <button
        onClick={() => mutate()}
        className="size-fit border border-slate-400 px-8"
      >
        Post
      </button>
      <p className="text-sm italic">
        Note: anything in the "id" field will be ignored.{' '}
      </p>
    </div>
  )
}
