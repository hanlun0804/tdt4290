from whisper.strategies.AudioModels import AudioModels
from whisper.strategies.classes import Question
from whisper.interfaces.Asker import Asker

class QuestionAsker(Asker):
    def __init__(self, language: str = 'en'):
        self.audio_model = AudioModels(model_type="medium", exit_silence_limit=600, timeoutlimit=60)
        self.language = language

    def ask(self, question: Question) -> str:
        """Ask the customer a question
           Returns: refined_anser, raw_answer 
        """
        self.audio_model.read_out_loud(question)
        raw_answer = self.audio_model.listen_return_text()
        return raw_answer   
