from whisper.strategies.classes import Question

class QuestionAskerCommandLine:
  def __init__(self, language: str='en'):
    print("Text question asker started")

  # This is a very silly example of course
  def ask(self, question: Question) -> str:

    # This is a simulation of sending text to the customer
    print(question.text)

    # This is a simulation of waiting for the customer response
    raw_answer = input()

    # Continue to the next step in the pipeline
    return raw_answer
