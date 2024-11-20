import { Fragment } from 'react/jsx-runtime'
import bot from '../../assets/bot.svg'
import { VoicebotResponse } from '../../types/types'

type Props = {
  info: VoicebotResponse
}

const headers = [
  'customer_id',
  'confidence',
  'question',
  'answer',
  'relevant_information',
  'is_identified',
  'is_verified',
  'done',
] as const

export default function BotInfoCard(props: Props) {
  const { info } = props

  return (
    <div className="w-96 min-h-96 rounded-md border-2 border-black bg-green-800 text-white shadow-xl">
      <div className="flex gap-2 border-b border-black p-2">
        <img src={bot} className="size-6" alt="botlogo" />
        <p>Bot</p>
      </div>
      <div className="grid grid-cols-[auto_auto] gap-2 p-2">
        {headers.map((header) => (
          <Fragment key={header}>
            <div className="text-right text-slate-400">
              {header.replace('_', ' ')}:
            </div>
            <div>{info[header]?.toString()}</div>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
