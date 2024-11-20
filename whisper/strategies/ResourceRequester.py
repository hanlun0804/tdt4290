import requests

from whisper.strategies.classes import Info

""" 
POLICY (meaning: "What we are trying to achieve")
    Requesting a resource from the database can be a complex and include a lot of logic.
    This logic should therefore be abstracted away from the other classes.

MECHANISM (meaning: "How we are implementing the policy")
    The resources you are able to request, depend on the current customer. Therefore, take 
    current customer as input, and format a request based on their id. 
    The class should then return a function that can be called by other parts of the program.

    It will also need to know about the base endpoint that we are sending requests to.
"""
class ResourceRequester:    

    customer_id = -1
    endpoints = {}

    def __init__(self, base_endpoint="http://localhost:3000"):
        self.base_endpoint = base_endpoint

    def set_customer_id(self, customer_id):
        self.customer_id = customer_id
        self.endpoints = {info: f"{self.base_endpoint}/voicebot/customer/{customer_id}/{info.name.lower()}" for info in Info}

    def can_request(self):
        return self.customer_id != -1

    def get_resources(self, info: Info):
        if not self.can_request: raise Exception("Resource requester tried to make a request, but does not have a customer id yet")
        endpoint = self.endpoints[info]
        res = requests.get(endpoint)
        return res.json()
    
    def get_customer_by_ssn(self, ssn):
        """ Return a customer if it can be retrieved from a database. None otherwise.
            Raise exception if database is down
        """ 
        res = requests.get(
            f"{self.base_endpoint}/voicebot/ssn/{ssn}"
        )

        if not res.ok: raise Exception(f"Resource requester failed to send request. Endpoint: {self.base_endpoint}/voicebot/{ssn}")

        data = res.json()
        if not data:
            return None
        
        return data["customer"]
    
    def get_customer_by_phone(self, phone):
        res = requests.get(
            f"{self.base_endpoint}/voicebot/phone/{phone}"
        )

        if not res.ok: raise Exception(f"Resource requester failed to get customer by phone. Endpoint: {self.base_endpoint}/voicebot/{phone}")

        data = res.json()
        if not data or not data["customer"]:
            return -1

        return data["customer"]

def main():

    rr = ResourceRequester()
    rr.set_customer_id(11)

    for info in Info:
        print("---------------------------------")
        if rr.can_request():
            print("getting resources for", info.name.lower())
            resources = rr.get_resources(info)
            print(resources["data"])

if __name__ == '__main__':
    main()