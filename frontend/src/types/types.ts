export type Customer = {
  id: number;
  firstName: string;
  lastName: string;
  phoneNo: string,
  socialSecurityNo: string;
};

export type SequenceItem = {
  bot: boolean
  text: string
}

export type VoicebotResponse = {
  customer_id: number
  confidence: number
  question: string
  answer: string
  relevant_information: string
  is_identified: boolean
  is_verified: boolean
  done: boolean
}

export const defaultBotInfo: VoicebotResponse = {
  customer_id: -1,
  confidence: 0,
  question: 'N/A',
  answer: 'N/A',
  relevant_information: 'N/A',
  is_identified: false,
  is_verified: false,
  done: false
}