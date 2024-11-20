import { Router, Request, Response } from 'express'

import {
  checkIfTableExist,
  selectAllFromTable,
  getSchemaForTable,
  insertIntoTable,
} from '../database/queries'

const userlandRouter = Router()

userlandRouter.get('/data/:tableName', async (req: Request, res: Response) => {
  const { tableName } = req.params
  const doesTableExists = await checkIfTableExist(tableName)
  
  if (!doesTableExists) {
    res.status(404).json({ error: `Table ${tableName} does not exist` })
    return
  }

  const data = await selectAllFromTable(tableName)
  res.json(data)
})

userlandRouter.get(
  '/schema/:tableName',
  async (req: Request, res: Response) => {
    const { tableName } = req.params
    const schema = await getSchemaForTable(tableName)
    res.json(schema)
  }
)

userlandRouter.post('/insert/:tableName', async (req, res) => {
  const { tableName } = req.params
  const data = req.body
  delete data.id

  const result = await insertIntoTable(tableName, data)

  res.json(result)
})

export default userlandRouter