from abc import ABC, abstractmethod


class Identifier(ABC):
  @abstractmethod
  def does_ssn_exist(self, ssn: str) -> bool:
    pass

  @abstractmethod
  def set_customer_by_ssn(self, ssn: str):
    pass