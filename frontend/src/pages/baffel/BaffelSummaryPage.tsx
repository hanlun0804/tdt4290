import { useLocation } from 'react-router-dom'
import { VoicebotResponse } from '../../types/types'


export default function BaffelSummaryPage() {
  const { state } = useLocation()
  const responses: VoicebotResponse[] | undefined = state.responses

  return (
    <>
      <h1 className="mx-auto text-6xl font-semibold">Customer verification</h1>
      <div className="mt-20 flex grow flex-col items-center gap-6 text-xl">
        {responses?.map((data, index) => (
          <div
            key={index}
            className="min-w-[480px] rounded-md border-2 border-black bg-purple-300 p-4"
          >
            <p>Question: {data.question}</p>
            <p>Answer: {data.answer}</p>
            <p>Confidence: {data.confidence * 100}%</p>
          </div>
        ))}
      </div>
    </>
  )
}
