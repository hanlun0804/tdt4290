import { Router, Request, Response } from 'express'
import { sqlMap } from '../database/voicebotQueries'
import { getCustomerByPhone, getCustomerBySsn } from '../database/queries'

const voicebotRouter = Router()

voicebotRouter.get(
  '/customer/:customerId/:request',
  async (req: Request, res: Response) => {
    const { customerId, request } = req.params    
    let data = {}
    
    try {
      const sqlQuery = sqlMap[request]
      data = await sqlQuery(customerId)
    } catch (e) {
      console.log("error when", request)
      console.error(e)
    }
    res.json({ data })
  }
)
voicebotRouter.get(
  '/ssn/:ssn',
  async (req: Request, res: Response) => {
    const { ssn } = req.params    
    let customer = {}
    
    try {
      customer = await getCustomerBySsn(ssn)
    } catch (e) {
      console.error(e)
    }
    console.log("we got here", customer)
    res.json({ customer })
  }
)
voicebotRouter.get(
  '/phone/:phone',
  async (req: Request, res: Response) => {
    const { phone } = req.params    
    let customer = {}

    
    try {
      const customerList = await getCustomerByPhone(phone)
      if (customerList.length > 0) {
        customer = customerList[0]
      }
    } catch (e) {
      console.error(e)
    }
    res.json({ customer })
  }
)


export default voicebotRouter
