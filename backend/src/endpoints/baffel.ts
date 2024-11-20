import axios, { responseEncoding } from 'axios'
import { Router, Request, Response } from 'express'
import {
  getCustomerById,
  getTransactionsByCustomerSSN,
} from '../database/queries'

const baffelRouter = Router()
export const voicebot_endpoint = 'http://127.0.0.1:8000'

type VoicebotResponse = {
  customer_id: number
  confidence: number
  prev_question: string
  answer: string
  relevant_information: string
  accepted: boolean
  next_question: string
  is_identified: boolean
  is_verified: boolean
  done: boolean
}

const placeHolderVoiceBotResponse: VoicebotResponse = {
  customer_id: -1,
  confidence: 0,
  prev_question: '(Placeholder)',
  answer: 'N/A',
  relevant_information: 'N/A',
  accepted: false,
  next_question: 'Failed to contact voicebot for next text question',
  is_identified: false,
  is_verified: false,
  done: false
}

baffelRouter.get(
  '/:phoneNo',
  async (req: Request, res: Response) => {
    const { phoneNo } = req.params

    let response = { ...placeHolderVoiceBotResponse }
    try {
      response = await axios
        .get(`${voicebot_endpoint}/${phoneNo}`)
        .then(res => res.data)
    } catch (e: any) {
      console.log(e)
      response.relevant_information = e.code
    }
    res.json(response)
  }
)

baffelRouter.post(
  '/text-mode/next-question',
  async (req: Request, res: Response) => {
    let response = { ...placeHolderVoiceBotResponse }
    try {
      response = await axios
        .post(`${voicebot_endpoint}/text-mode/next-question`, {
          answer: req.body.text,
        })
        .then(res => res.data)
    } catch (e) {
      console.error('e for error')
    }
    console.log('tried to send text mode with question')
    res.json(response)
  }
)

baffelRouter.get('/customer/id/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  const customer = await getCustomerById(id)
  res.json(customer)
})
export default baffelRouter