from whisper.strategies.ResourceRequester import ResourceRequester
from whisper.interfaces.Identifier import Identifier

class CustomerIdentifier(Identifier):

  customer_cache = None     # cache the customer (in does_ssn_exist), because it is likely to be set soon after

  def __init__(self, resource_requester: ResourceRequester, phone_no):
    customer = resource_requester.get_customer_by_phone(phone_no)
    if not customer: raise Exception("Failed to init customer identifier because the initial phone number gave no results")

    resource_requester.set_customer_id(customer["id"])

    self.customer = customer
    self.rr = resource_requester 
  
  def does_ssn_exist(self, ssn: str):
    customer = self.rr.get_customer_by_ssn(ssn)
    self.customer_cache = customer

    return customer != None
  
  def set_customer_by_ssn(self, ssn: str):
    if self.check_ssn(ssn, self.customer_cache): 
      # return early if we already fetched the customer
      self.customer = self.customer_cache
      self.customer_cache = None
      return

    self.customer = self.rr.get_customer_by_ssn(ssn)
    if not self.customer: raise Exception("Tried to set an ssn that does not exist")
  
  def check_ssn(self, ssn: str, customer=None) -> bool: 
    customer = customer if customer else self.customer
    return customer and "socialSecurityNo" in customer and customer["socialSecurityNo"] == ssn

  def get_first_name(self):
    if not self.customer: raise Exception("Cusomer was none in customer identifier")
    return self.customer["firstName"]

  def get_customer_id(self):
    if not self.customer: raise Exception("Cusomer was none in customer identifier")
    return self.customer["id"]

  def get_customer_ssn(self):
    if not self.customer: raise Exception("Cusomer was none in customer identifier")
    return self.customer["socialSecurityNo"]

  def get_customer_phone(self):
    if not self.customer: raise Exception("Cusomer was none in customer identifier")
    return self.customer["phoneNo"]


def main():
  rr = ResourceRequester()
  ider = CustomerIdentifier(rr, "44556695")
  ider.does_ssn_exist("123")
  ider.set_customer_by_ssn("123")
  print(ider.check_ssn("123"))
  print(ider.get_customer_id())
  print(ider.get_first_name())
  print(ider.get_customer_ssn())
   
if __name__ == '__main__':
  main()


  