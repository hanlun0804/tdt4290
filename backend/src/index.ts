import chequeClientRouter from './endpoints/cheque-client'
import userlandRouter from './endpoints/userland'
import voicebotRouter from './endpoints/voicebot'
import baffelRouter from './endpoints/baffel'
import express from 'express'
import WebSocket from 'ws'
import cors from 'cors'

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

app.use('/userland', userlandRouter)
app.use('/cheque-client', chequeClientRouter)
app.use('/baffel', baffelRouter)
app.use('/voicebot', voicebotRouter)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

const wss = new WebSocket.Server({ port: 4000 })

type Message = {
  origin: 'frontend' | 'voicebot'
  content: string
}

const sockets: Record<string, WebSocket | null> = {
  frontend: null,
  voicebot: null,
}

wss.on('connection', (ws, req) => {
  const origin = req.url?.slice(1)
  if (!origin) {
    throw Error('websocket server got a connection with malformed parameter')
  }

  sockets[origin] = ws

  console.log("connected a websocket")

  ws.on('message', msg => {
    const message = JSON.parse(msg.toString()) as Message

    const socket =
      message.origin === 'frontend' ? sockets['voicebot'] : sockets['frontend']

    if (!socket) {
      throw Error("tried to get a socket for forwarding, but could not do it.")
    }

    socket.send(message.content)
  })

  ws.on('error', error => {
    console.error('WebSocket error:', error)
  })

  ws.on('close', () => {
    console.log('closing the websocket now')
  })
})
