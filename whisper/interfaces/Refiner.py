from abc import ABC, abstractmethod

from whisper.strategies.classes import Question, State

class Refiner(ABC):
  @abstractmethod
  def refine(self, question: Question, answer: str, state: State, language: str) -> str:
    pass