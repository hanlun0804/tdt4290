import { Router, Request, Response } from 'express'
import {
  getCustomerByPhone,
  getAccountById,
  getTransactionsByAccountId,
  getTransactionsByCustomerSSN,
} from '../database/queries'

const chequeClientRouter = Router()

chequeClientRouter.get('/customer/phone/:phoneNo', async (req: Request, res: Response) => {
  const { phoneNo } = req.params
  const customers = await getCustomerByPhone(phoneNo)
  res.json(customers)
})

chequeClientRouter.get('/accounts/:userId', async (req: Request, res: Response) => {
  const userId = req.params.userId
  const accounts = await getAccountById(userId)
  res.json(accounts)
})

chequeClientRouter.get('/transactions/:accountId', async (req: Request, res: Response) => {
  const { accountId } = req.params
  const transactions = await getTransactionsByAccountId(accountId)
  res.json(transactions)
})

chequeClientRouter.get(
  '/transactions/customer/:socialSecurityNo',
  async (req: Request, res: Response) => {
    const { socialSecurityNo } = req.params
    const transactions = await getTransactionsByCustomerSSN(socialSecurityNo)
    res.json(transactions)
  }
)

export default chequeClientRouter