

# Start API server

0. `Navigate to /whisper/`

**Setup virtual environment**

1. `python3 -m venv venv`
2. 
   - LINUX:`source venv/bin/activate`
   - Windows: `source venv/Scripts/activate` 
3. `pip install -r requirements.txt`
4. Download ollama [here](https://ollama.com/) 
5. `ollama pull llama3.1` // llama3.1:70b/405b is better but to big for laptops

**Start app**

4. Go back to the parent directory
5. `uvicorn whisper.api:app --reload`


## How the program works

Asking how the program works is pretty much the same as asking how the Manager works. The program has a single point of entry (some would call this a facade pattern), through one function defined in the Manager class. Of course, it needs to be wrapped in some communication protocol. This project uses FastApi, with a single endpoint for accessing the manager.

### What is the Manager trying to do?

The manager is responsible for asking the right question to the customer. The questions are intended to either: 
1. Identify the customer
2. Verify the identity of the customer

Step 2. is obviously not possible before step 1. We cannot verify an identity that is unkown.

#### How to identify the customer?

We get a little help to start us of, because the customer must call in with some number. A lot of the time, a customer will use their own phone. This allows us to make an initial guess of who the customer is. We fetch the social security number for the customer with this number, and store it for the next step. 

We are still not sure if we have the correct identity. A customer might use someone elses phone. Therefore, Question 0 will always be `What is your social security number?`. If Answer 0 from the customer matches the number we fetched in the previous step, we now assume that we have identified the customer. 

If Answer 0 is not the social security number we expect, we fetch new customer data using this ssn. Ask the customer if we got the right one this time. 

#### How do we verify the identity?

It is conceptually very simple. Now that we know the identity of the customer, we can ask some questions that only the customer would know the answer to. 
The manager fetches some information about this customer. Based on the information, the manager can generate a question, along with the answer. It now sends the question to the customer, and waits for a response. Comparing the customer response to the expected answer, we can determine if the customer is who they say. 

We should of course ask more than one verification question, just to be sure. But these details are left to the people working in the field. 

### How does the Manager do all of this?

This is the main challenge of this implementation. Customer answers might vary widely, and it might be hard to determine how well they answered the question. Generating a new question in itself is not easy either, because you have to make fair questions. Questions that you can reasonably expect the customer to know the answer to. 

#### Strategy pattern

To separate out all this logic, we follow the strategy pattern. For each hard problem, we create a class that is responsible for solving this one problem, and nothing else. The Manager does nothing, except "managing" these workers. Making sure that they get the right inputs, and execute at the right time. So far we have these workers:

- Question Generator: Responsible for looking at customer data, and make a fair question + answer.
- Resource Requester: Get customer data for the other workers, based on the id of the customer. 
- Confidence Calculator: Compare the customer answer and the expected answer, and calculate how close the customer was.
- QuestionAsker: Ask the question, and transcribe the answer.
- AnswerRefiner: Take the whole customer answer, and extract the relevant information
- CustomerIdentifier: handles logic related to identifying the customer

### State machine

The manager implements a state machine, which is how we determine what actions are allowed at any time. The state machine is designed to be modifiable, so it should be easy to extend with new functionality. For this you need to edit a couple of functions:

- update_state: define how to enter your state, and how to exit it. This is done in the switch case.
- prepare_question: in your state, define what type of question can be asked. It is possible to update QuestionGenerator too.
- make_voicebot_response: if your state generates a custom response, define it here.



