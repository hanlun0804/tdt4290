from abc import ABC, abstractmethod

from whisper.strategies.classes import Question

class Confidence(ABC):
  @abstractmethod
  def calculate(self, question: Question, answer, expected_answer) -> float:
    pass

  @abstractmethod
  def update_score(self, score): 
    pass

  @abstractmethod
  def continue_asking_questions(self) -> bool: 
    pass

  @abstractmethod
  def is_verified(self) -> bool: 
    pass
