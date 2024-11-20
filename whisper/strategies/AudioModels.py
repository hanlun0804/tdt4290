from whisper.RealTime_STT import AppOptions, AudioTranscriber
from whisper.strategies.classes import Question
from faster_whisper import WhisperModel
import nest_asyncio
import playsound
import asyncio
import pyttsx3

class AudioModels():
    def __init__(self, audio_device: int = 0, exit_silence_limit: int = 600, noise_threshold: int = 20, silence_limit: int = 4, timeoutlimit: int = 180,
                beam_size: int = 5, best_of: int = 5, model_type: str = "large-v3", device_core: str = 'cpu', compute_type: str = 'int8'):
        print("initi audiomodels")
        self.event_loop = asyncio.get_event_loop()
        self.transcriber = AudioTranscriber(event_loop=self.event_loop, 
            whisper_model=WhisperModel(model_type, device=device_core, compute_type=compute_type), 
                transcribe_settings={"beam_size": beam_size, "best_of": best_of, "word_timestamps": True}, 
                    app_options=AppOptions(audio_device=audio_device, silence_limit=silence_limit, exit_silence_limit=exit_silence_limit, noise_threshold=noise_threshold),
                        timeoutlimit=timeoutlimit)
    
    def re_init(self):
        self.event_loop = asyncio.get_event_loop()


    def listen_return_text(self) -> str:
        nest_asyncio.apply()
        async def run_transcription():
            print("listen and return")
            await self.transcriber.start_transcription()
            await self.transcriber.stop_transcription()
        
        # Now this can run even though the main loop is already running
        self.event_loop.run_until_complete(run_transcription())
        return self.transcriber.get_segment_log()
    
    def read_out_loud(self, question: Question):
        try:
            if(int(question.recording_id)!=99):
                playsound.playsound("./whisper/assets/"+str(question.recording_id)+".mp3")
            else:
                engine = pyttsx3.init()
                engine.say(text=question.text)
                engine.runAndWait()
        except Exception as error:
            print("audio fail", error)
            engine = pyttsx3.init()
            engine.say(text=question.text)
            engine.runAndWait()