from abc import ABC, abstractmethod

from whisper.strategies.classes import Question

class Asker(ABC):
  @abstractmethod
  def ask(self, question: Question) -> float:
    pass
