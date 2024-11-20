from whisper.strategies.classes import Info, Question, QuestionType
from whisper.strategies.ResourceRequester import ResourceRequester
from whisper.interfaces.Generator import Generator
from datetime import timedelta, datetime, date
import random

'''
    Et Question inneholder 3 attributter
        text: Spørsmålet som skal stilles
        type: Typen spørsmål (DATE, NUMBER, NAME, PERSON_ID)
        info: Et tuple med informasjon som spørsmålet er avhengig av, og hvordan man kan hente ut svaret på dette
            Om API-kallet kun returnerer et tall, skal sistnevnte settes til "num"
            Om API-kallet returnerer en liste, skal sistnevnte settes til "len"
            Ellers skal sistnevnte settes til navnet på det som skal hentes ut, slik det er i API-kallet
'''
questions_no = [
    # Should contain the questions in Norwegian
    # A question object has the question, the type of answer expected, the information it depends on and a keyword fetch spesific answer
    # Due to NDA, we cannot provide the actual questions
]

'''
    A Question contains 3 attributes
        text: The question to be asked
        type: The type of question (DATE, NUMBER, NAME, PERSON_ID)
        info: A tuple with information the question is dependent on, and how to retrieve the answer to this
            If the API call only returns a number, the latter should be set to "num"
            If the API call returns a list, the latter should be set to "len"
            Otherwise, the latter should be set to the name of what should be retrieved, as it is in the API call
'''
questions_en = [
    # Should contain the questions in English
    # A question object has the question, the type of answer expected, the information it depends on and a keyword fetch spesific answer
    # Due to NDA, we cannot provide the actual questions
]

class QuestionGenerator(Generator):

    questions_with_answer = []

    def __init__(self, rr: ResourceRequester, language="en"):
        self.language = language
        self.rr = rr

    def get_next_question(self): 
        """
        Retrieves the next question from the question generator.
        
        Raises exception if data requests are blocked.

        Returns: question, answer
        """

        # Return if questions have been prepared already
        if 0 < len(self.questions_with_answer):
            return self.questions_with_answer.pop()

        # Prepare questions before providing the first one
        if not self.rr.can_request():
            raise Exception("The Question generator attempted to fetch info, but the requester is unable to ")

        info = self.fetch_info()
        questions = self.get_questions(info)    
        questions_with_answer = self.zip_question_answer(questions)
        return questions_with_answer.pop()
    
    def get_id_question(self):
        if(self.language == 'en'):
            return Question("What is your personal ID number?", QuestionType.PERSON_ID, [], 24)
        else: 
            return Question("Hva er ditt personnummer?", QuestionType.PERSON_ID, [], 23)

    def randomize_info_order(self):
        return random.sample(list(Info), len(Info))

    def fetch_info(self):
        """
            Retrieves 4 pieces of information, fitting to the user's information

            Returns:
                A dictionary of 4 pieces of information
        """
        random_info = self.randomize_info_order()

        info = {}

        for ri in random_info:
            resource = self.rr.get_resources(ri)
            data = resource["data"]

            if not data: continue

            if ri == Info.LAST_TRANSACTION:
                last_transaction_date = datetime.strptime(data["date"], "%Y-%m-%d").date()
                if last_transaction_date < date.today() - timedelta(days=7):
                    continue
            
            info[ri] = data
            if len(info) == 4:
                break

        return info

    def get_questions(language, fetched_info: dict):
        """
            Retrieves 4 questions based on available information

            Parameters:
                language: The language the questions should be fetched in
                fetched_info: The available information

            Returns: 
                A list of 4 questions and their info
        """
        question_list = []
        selected_questions = set()
        question_pool = questions_no if language == "no" else questions_en
        question_pool = random.sample(list(question_pool), len(question_pool))

        if len(fetched_info) == 4:
            for key in fetched_info.keys():
                for question in question_pool:
                    if question.text in selected_questions: 
                        continue
                    for iq in question.info: 
                        if len(iq) != 0 and key == iq[0]: 
                            question_list.append([question, key])
                            selected_questions.add(question.text) 
                            break
                    if len(question_list) == 4:
                        break 
        return question_list

    def retrieve_answer(self, question, info):
        '''
            Retrieves the answer to a question from the resources.

            Parameters:
                question: The question to retrieve the answer to.
                info: The information to retrieve the answer from.
                
            Returns:
                The answer to the question.
        '''
        resource = self.rr.get_resources(info)
        data = resource["data"]

        correct_data = None

        for i in question.info:
            if i[0] == info:
                correct_data = i
                break

        if correct_data[1] == "num" or correct_data[1] == "text":
            return data
        elif correct_data[1] == "len":
            return len(data)
        else:
            if isinstance(data, list):
                return data[0][correct_data[1]]
            return data[correct_data[1]]
        
    def zip_question_answer(self, questions):        
        for q in questions:
            question: Info = q[0]
            answer = self.retrieve_answer(question, q[1])
            self.questions_with_answer.append((question, answer))

        return self.questions_with_answer