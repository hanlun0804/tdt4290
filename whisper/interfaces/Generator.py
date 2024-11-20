from abc import ABC, abstractmethod

from whisper.strategies.classes import Question

class Generator(ABC):
  @abstractmethod
  def get_next_question(self) -> Question:
    pass
