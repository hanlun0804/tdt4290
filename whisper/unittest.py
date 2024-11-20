from whisper.strategies.ConfidenceCalculator import ConfidenceCalculator
from whisper.strategies.classes import Question, QuestionType
from whisper.strategies.AnswerRefiner import AnswerRefiner
from faster_whisper import WhisperModel
from whisper.Manager import Manager
from unittest.mock import patch
import unittest

class Unittest(unittest.TestCase):
    model = WhisperModel("medium", device="cpu", compute_type="int8")

    @classmethod
    def setUpClass(cls):
        cls.manager = Manager("95426951", "command-line")

    def test_manager_init(self):
        self.assertIsNotNone(self.manager, "Failed to make a manager (check that backend is running)")

    def test_manager_get_next_question(self):
      with patch('builtins.input', return_value="123"):
          result = self.manager.get_next_question()
          self.assertIsNotNone(result, "Manager failed to get the next question")

    def test_wisper_eng(self):
        """wispertest_eng"""
        
        segments, info = self.model.transcribe("audio.wav", beam_size=5)
        total = ""
        for segment in segments:
            total += segment.text
        #print(total)
        self.assertEqual(total, " The stale smell of old beer lingers. It takes heat to bring out the odor. A cold dip restores health and zest. A salt pickle tastes fine with ham. Tacos al pastor are my favorite. A zestful food is the hot cross bun.")
    
    def test_wisper_no(self):
        """wispertest_no"""
        
        segments, info = self.model.transcribe("output.wav", beam_size=5)
        total = ""
        for segment in segments:
            total += segment.text
        #print(total)
        self.assertEqual(total, " Ja, og da ønsker jeg nemlig å høre fra dere om vi skal dra dit.")
    
    def test_confidenc_date_fullmatch(self):
        """confidenctest_date_fullmatch"""
        self.assertEqual(ConfidenceCalculator().calculate(question=Question("", QuestionType.DATE, [], 99), answer="15-10-2024", expected_answer="15-10-2024"), 1.0)

    def test_confidenc_date_paritalmatch(self):
        """confidenctest_date_paritalmatch"""
        self.assertEqual(ConfidenceCalculator().calculate(question=Question("", QuestionType.DATE, [], 99), answer="10-09-2024", expected_answer="01-09-2024"), 0.88)

    def test_confidenc_date_nomatch(self):
        """confidenctest_date_nomatch"""
        self.assertEqual(ConfidenceCalculator().calculate(question=Question("", QuestionType.DATE, [], 99), answer="01-11-2020", expected_answer="01-01-2024"), 0.0)

    def test_confidenc_name_fullmatch(self):
        """confidenctest_name_fullmatch"""
        self.assertEqual(ConfidenceCalculator().calculate(question=Question("", QuestionType.NAME, [], 99), answer="A", expected_answer="A"), 1.0)

    def test_confidenc_name_paritalmatch(self):
        """confidenctest_name_paritalmatch"""
        self.assertEqual(ConfidenceCalculator().calculate(question=Question("", QuestionType.NAME, [], 99), answer="AB", expected_answer="AC"), 0.5)

    def test_confidenc_name_nomatch(self):
        """confidenctest_name_nomatch"""
        self.assertEqual(ConfidenceCalculator().calculate(question=Question("", QuestionType.NAME, [], 99), answer="A", expected_answer="B"), 0.0)

    def test_confidenc_number_fullmatch(self):
        """confidenctest_number_fullmatch"""
        self.assertEqual(ConfidenceCalculator().calculate(question=Question("", QuestionType.NUMBER, [], 99), answer="100", expected_answer="100"), 1.0)

    def test_confidenc_number_paritalmatch(self):
        """confidenctest_number_paritalmatch"""
        self.assertEqual(ConfidenceCalculator().calculate(question=Question("", QuestionType.NUMBER, [], 99), answer="80", expected_answer="100"), 0.8)

    def test_confidenc_number_nomatch(self):
        """confidenctest_number_nomatch"""
        self.assertEqual(ConfidenceCalculator().calculate(question=Question("", QuestionType.NUMBER, [], 99), answer="0", expected_answer="100"), 0.0)

    def test_ollama_en(self):
        """ollamatest_en"""
        self.assertEqual(AnswerRefiner().process_ollama(question=Question("Where do you live?", QuestionType.NAME, [], 99), answer="uh... i live in london", language='en'), 'London')
    
    def test_ollama_on(self):
        """ollamatest_on"""
        self.assertEqual(AnswerRefiner().process_ollama(question=Question("Hvor bor du?", QuestionType.NAME, [], 99), answer="ja, jeg bor jo i Oslo", language='no'), 'Oslo')    

if __name__ == "__main__":
    unittest.main()