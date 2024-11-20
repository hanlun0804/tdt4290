from whisper.strategies.classes import Question
from dataclasses import dataclass, asdict
import nest_asyncio
import websockets
import asyncio
import json


@dataclass
class Message:
  origin: str
  content: str

nest_asyncio.apply()

class QuestionAskerText:

  def __init__(self, language: str="en"):
    print("Websocket question asker started")
  
  async def _async_ask(self, message: Message) -> str:
    async with websockets.connect("ws://localhost:4000/voicebot") as websocket:
      message = json.dumps(asdict(message))
      await websocket.send(message) 
      response = await websocket.recv()
      print("voicebot websocket got response", response)
      return response
      

  def ask(self, question: Question) -> str:
    print("voicebot is about to send", question.text)
    message = Message('voicebot', question.text)
    raw_answer = asyncio.run(self._async_ask(message))
    print("voicebot should echo", raw_answer)
    return raw_answer
    