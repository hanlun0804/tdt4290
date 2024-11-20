from whisper.strategies.AnswerRefiner import AnswerRefiner
from whisper.strategies.ConfidenceCalculator import ConfidenceCalculator
from whisper.strategies.CustomerIdentifier import CustomerIdentifier
from whisper.strategies.QuestionGenerator import QuestionGenerator
from whisper.strategies.ResourceRequester import ResourceRequester


class PipelineFactory:

  def __init__(self, phone_no: str, mode: str):
    
    # Setup: input processing 
    self.answer_refiner = AnswerRefiner()                           
    self.confidence_calculator = ConfidenceCalculator()                 

    # Setup: customer utilities
    resource_requester = ResourceRequester()    
    self.question_generator = QuestionGenerator(resource_requester)  
    self.customer_identifier = CustomerIdentifier(resource_requester, phone_no) 

    match mode:
      case "command-line":
        from whisper.strategies.QuestionAskerCommandLine import QuestionAskerCommandLine
        self.question_asker = QuestionAskerCommandLine()
      case "text":
        from whisper.strategies.QuestionAskerText import QuestionAskerText
        self.question_asker = QuestionAskerText()
      case _:
        from whisper.strategies.QuestionAsker import QuestionAsker  # lazy import : not needed in testing.
        self.question_asker = QuestionAsker()


