import { useQuery, useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useEffect, useState } from 'react'
import BotInfoCard from '../../components/baffel/BotInfoCard'
import CustomerInfoCard from '../../components/baffel/CustomerInfoCard'
import { Timeline } from '../../components/baffel/Timeline'
import {
  SequenceItem,
  defaultBotInfo,
  VoicebotResponse,
} from '../../types/types'
import { requestFormatter } from '../../utils/async'
import { cn } from '../../utils/cn'
import { PendingComponent } from '../../components/baffel/PendingComponent'
import { useNavigate } from 'react-router-dom'
import { RecordButton } from '../../components/baffel/AudioRecorder'

type Message = {
  origin: 'frontend' | 'voicebot'
  content: string
}

export default function BaffelTextModePage() {
  const [customerId, setCustomerId] = useState(11)
  const [sequence, setSequence] = useState<SequenceItem[]>([])
  const [botInfo, setBotInfo] = useState(defaultBotInfo)
  const [responses, setResponses] = useState<VoicebotResponse[]>([])
  const [phoneNo, setPhoneNo] = useState('95426951')
  const [autoContinue, setAutoContinue] = useState(false)
  const [shouldInput, setShouldInput] = useState(false)
  const [input, setInput] = useState('')

  const [ws, setWs] = useState<WebSocket | null>(null)

  const navigate = useNavigate()

  const addToSequence = (text: string, bot: boolean) => {
    setSequence((old) => [...old, { text, bot }])
  }

  const { data: customer } = useQuery({
    enabled: customerId !== -1,
    queryKey: ['customerId', customerId],
    queryFn: requestFormatter('baffel', `customer/id/${customerId}`),
  })

  const {
    mutate: sendRequest,
    isPending,
    isError,
  } = useMutation({
    mutationFn: () =>
      axios
        .get('http://127.0.0.1:3000/baffel/95426951')
        .then((res) => res.data),
    onSuccess: (response: VoicebotResponse) => {
      setCustomerId(response.customer_id)
      addToSequence(response.question, true)
      addToSequence(response.answer, false)
      setBotInfo(response)
      setResponses((old) => [...old, response])

      if (responses.length > 5) {
        setAutoContinue(false)
      }

      if (response.is_verified) {
        navigate('summary', { state: responses })
      }

      if (autoContinue) {
        sendRequest()
      }
    },
  })

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:4000/frontend')

    ws.onopen = () => {
      console.log('WebSocket connected')
    }

    ws.onmessage = (e) => {
      setShouldInput(true)
      addToSequence(e.data, true)
    }

    ws.onclose = () => {
      console.log('WebSocket closed')
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    setWs(ws)
  }, [])

  const sendMessage = () => {
    if (!ws) return
    const message: Message = {
      origin: 'frontend',
      content: input,
    }

    addToSequence(input, false)
    const jsonMessage = JSON.stringify(message)
    ws.send(jsonMessage)
    setShouldInput(false)
    setInput('')
  }

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage()
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-200 pt-12">
      {!ws && <p>No websocket</p>}
      <div className="grow">
        <div className="flex grow justify-between px-10">
          <BotInfoCard info={botInfo} />
          <div className="flex h-fit w-1/2 flex-col items-center justify-center">
            <div className="relative flex justify-center"></div>
            <Timeline sequence={sequence} />
            {!shouldInput && isPending && <PendingComponent />}
            {!shouldInput && !isPending && (
              <RecordButton onClick={() => sendRequest()}>Start</RecordButton>
            )}
            {shouldInput && (
              <input
                onKeyDown={handleEnter}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="rounded-md border border-slate-400 bg-inherit text-center outline-none"
              />
            )}
          </div>
          <CustomerInfoCard customer={customer} />
        </div>
        <input
          value={phoneNo}
          onChange={(e) => setPhoneNo(e.target.value)}
          className="absolute right-10 top-2 w-24 border-b border-slate-400 bg-inherit text-right outline-none"
        />
        <div className="absolute bottom-2 left-2 flex items-center gap-2">
          <p className="whitespace-nowrap">Toggle auto-continue:</p>
          <button
            onClick={() => setAutoContinue(!autoContinue)}
            className={cn(
              'size-4 border border-blue-900',
              autoContinue && 'bg-blue-900',
            )}
          ></button>
        </div>
      </div>
    </div>
  )
}
