from whisper.strategies.classes import State, VoicebotResponse, QuestionType
from whisper.strategies.QuestionGenerator import Question
from whisper.PipelineFactory import PipelineFactory

class Manager:

    state = State.INIT

    def __init__(self, phone_no: str, mode: str = "default", language = 'en'):
        """ Args:
                phone_no : phone number of the customer calling.
                mode: type of manager, provided to the factory. Currently only test/default modes supported
                language: choose the language the bot should use.
        """

        factory = PipelineFactory(phone_no, mode)

        # Setup: input processing 
        self.answer_refiner = factory.answer_refiner                           
        self.confidence_calculator = factory.confidence_calculator                 
        self.question_asker = factory.question_asker

        # Setup: customer utilities
        self.question_generator = factory.question_generator  
        self.customer_identifier = factory.customer_identifier 

        self.language = language

    def get_next_question(self) -> VoicebotResponse:
        """ Ask the customer another question, and process the answer
            The type of question asked depends on what internal state the manager is in

            Returns: internal information about the processing 
        """
        # Steps 0->6 in the question generation pipeline

        # Step 0: Check if we are in a state that can ask questions
        if self.state == State.DONE_VERIFIED or self.state == State.DONE_UNVERIFIED:
            return self.make_voicebot_response(Question('Process complete', QuestionType.NAME, [], 99), "N/A", "N/A", 0.0)

        # Step 1: Prepare the question
        question, expected_answer = self.prepare_question()

        # Step 2: Ask the question to the customer, and extract the relevant information
        raw_answer = self.question_asker.ask(question)

        # step 3
        refined_answer = self.answer_refiner.refine(question, raw_answer, self.state)

        # Step 4: Find out how well the customer answered the question
        confidence = self.confidence_calculator.calculate(question, refined_answer, expected_answer)

        # Step 5: Update manager state based on results from above
        self.update_state(refined_answer, confidence)

        # Step 6: Generate a result
        return self.make_voicebot_response(question, raw_answer, refined_answer, confidence)
    
    def update_state(self, refined_answer: str, confidence: float):
        match self.state:
            case State.INIT:               
                if self.customer_identifier.check_ssn(refined_answer): 
                    self.state = State.IDENTIFIED
                    return
                
                if self.customer_identifier.does_ssn_exist(refined_answer): 
                    self.customer_identifier.set_customer_by_ssn(refined_answer)
                    self.state = State.NAME_CONFIRM
                    return
                
                print(f"failed to find customer with ssn: {refined_answer} in the database")
                print("This means that we are not leaving the INIT stage.")
                
            case State.NAME_CONFIRM:
                customer_confirms = refined_answer

                if customer_confirms: 
                    self.state = State.IDENTIFIED
                else:
                    self.state = State.INIT

            case State.IDENTIFIED: 
                self.confidence_calculator.update_score(confidence)
                if not self.confidence_calculator.continue_asking_questions():
                    self.state = State.DONE_VERIFIED if self.confidence_calculator.is_verified() else State.DONE_UNVERIFIED

            case other:
                print(f"Tried to change state while in state {other}")


    def prepare_question(self) -> tuple[Question, str]:
        """ The question we ask depend on what state we are in.
            Most of the time, a question generator will make it, but not always
            Returns: question + answer tuple
        """
        match self.state:
            case State.INIT:
                question = self.question_generator.get_id_question()
                expected_answer = self.customer_identifier.get_customer_ssn()
                return question, expected_answer
            
            case State.NAME_CONFIRM:
                first_name = self.customer_identifier.get_first_name() 
                question = Question(f"Is your name {first_name}?", QuestionType.NUMBER, [], 99)
                expected_answer = True # use this when asking question 
                return question, expected_answer
            
            case State.IDENTIFIED:
                return self.question_generator.get_next_question()

            case _:
                # verification process is done. We should not do anything here
                raise Exception("Manager tried to prepare question for a state that does not support this")

    def make_voicebot_response(self, question: Question, answer: str, refined_answer: str, confidence: str) -> VoicebotResponse:
        """ Return the correct voicebot response based on the question and how it was answered
            Other details will be figured out based on state
        """
        # setup state independent response values
        customer_id = self.customer_identifier.get_customer_id()
        question = question.text

        # setup state dependent response values
        is_identified = self.state in (State.DONE_VERIFIED, State.IDENTIFIED, State.DONE_UNVERIFIED)
        is_verified = self.state == State.DONE_VERIFIED
        done = self.state in (State.DONE_VERIFIED, State.DONE_UNVERIFIED)

        return VoicebotResponse(
            customer_id,
            confidence, 
            question,
            answer,
            refined_answer, 
            is_identified,
            is_verified,
            done
        )
    
    def is_current_customer(self, phone_no: str):
        return self.customer_identifier.get_customer_phone() == phone_no

def main():
    manager = Manager("44556695")

    process_done = False

    while not process_done:

        res = manager.get_next_question()
        process_done = res.done
        print(res)

if __name__ == '__main__':
    main()