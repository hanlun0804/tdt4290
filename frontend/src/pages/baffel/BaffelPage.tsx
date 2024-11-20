import { useQuery, useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useState } from 'react'
import BotInfoCard from '../../components/baffel/BotInfoCard'
import CustomerInfoCard from '../../components/baffel/CustomerInfoCard'
import { Timeline } from '../../components/baffel/Timeline'
import {
  SequenceItem,
  defaultBotInfo,
  VoicebotResponse,
} from '../../types/types'
import { backendEndpoint, requestFormatter } from '../../utils/async'
import { cn } from '../../utils/cn'
import { PendingComponent } from '../../components/baffel/PendingComponent'
import { useNavigate } from 'react-router-dom'
import { RecordButton } from '../../components/baffel/AudioRecorder'

export default function BaffelAudioModePage() {
  const [customerId, setCustomerId] = useState(11)
  const [sequence, setSequence] = useState<SequenceItem[]>([])
  const [botInfo, setBotInfo] = useState(defaultBotInfo)
  const [responses, setResponses] = useState<VoicebotResponse[]>([])
  const [phoneNo, setPhoneNo] = useState('95426951')
  const [autoContinue, setAutoContinue] = useState(false)

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
      axios.get(`${backendEndpoint}/baffel/${phoneNo}`).then((res) => res.data),
    onSuccess: (response: VoicebotResponse) => {
      setCustomerId(response.customer_id)
      addToSequence(response.question, true)
      addToSequence(response.answer, false)
      setBotInfo(response)

      const newResponses = [...responses, response]

      setResponses(newResponses)

      if (responses.length > 5) {
        setAutoContinue(false)
      }

      if (response.done) {
        setAutoContinue(false)
        navigate('summary', { state: { responses: newResponses } })
      }

      if (autoContinue && !response.done) {
        sendRequest()
      }
    },
  })

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-200 pt-12">
      <div className="grow">
        <div className="flex grow justify-between px-10">
          <BotInfoCard info={botInfo} />
          <div className="flex h-fit w-1/2 flex-col items-center justify-center">
            <div className="relative flex justify-center"></div>
            <Timeline sequence={sequence} />
            {!isPending && (
              <RecordButton onClick={() => sendRequest()}>Call</RecordButton>
            )}
            {isPending && <PendingComponent />}
            {isError && (
              <p className="font-bold text-red-500">
                Voicebot error, please make sure that the server and voicebot is running
              </p>
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
