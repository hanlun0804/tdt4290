import os 
import queue
import pyaudio
import asyncio
import datetime
import functools
import onnxruntime
import numpy as np
import nest_asyncio
import soundfile as sf
import sounddevice as sd
from typing import NamedTuple
from faster_whisper import WhisperModel
from concurrent.futures import ThreadPoolExecutor



current_dir = os.path.dirname(os.path.abspath(__file__)) #HMMMM
script_dir = os.path.dirname(os.path.abspath(__file__))
python_root_dir = os.path.dirname(script_dir)
app_root_dir = os.path.dirname(python_root_dir)

def callback(in_data):
    return in_data, pyaudio.paContinue

def write_audio(dir_name: str, file_name: str, data):
    file_path = os.path.join(app_root_dir, dir_name, file_name + ".wav")

    # If a file with the same name already exists, remove it to forcefully write
    if os.path.exists(file_path):
        os.remove(file_path)

    sf.write(file_path, data, 16000)


# get a list of valid input devices
def get_valid_input_devices():
    valid_devices = []
    devices = sd.query_devices()
    hostapis = sd.query_hostapis()

    for device in devices:
        if device["max_input_channels"] > 0:
            device["host_api_name"] = hostapis[device["hostapi"]]["name"]
            valid_devices.append(device)
    return valid_devices


# create an audio stream
def create_audio_stream(selected_device, callback):
    RATE = 16000
    CHUNK = 512
    CHANNELS = 1
    DTYPE = "float32"

    stream = sd.InputStream(
        device=selected_device,
        channels=CHANNELS,
        samplerate=RATE,
        callback=callback,
        dtype=DTYPE,
        blocksize=CHUNK,
    )

    return stream

class Vad:
    def __init__(self, threshold: float = 0.1):
        model_path = os.path.join(current_dir, "assets", "silero_vad.onnx")

        options = onnxruntime.SessionOptions()
        options.log_severity_level = 4

        self.inference_session = onnxruntime.InferenceSession(model_path, sess_options=options)
        self.SAMPLING_RATE = 16000
        self.threshold = threshold
        self.h = np.zeros((2, 1, 64), dtype=np.float32)
        self.c = np.zeros((2, 1, 64), dtype=np.float32)

    def is_speech(self, audio_data: np.ndarray) -> bool:
        input_data = {
            "input": audio_data.reshape(1, -1),
            "sr": np.array([self.SAMPLING_RATE], dtype=np.int64),
            "h": self.h,
            "c": self.c,
        }
        out, h, c = self.inference_session.run(None, input_data)
        self.h, self.c = h, c
        return out > self.threshold


class AppOptions(NamedTuple):
    audio_device: int
    silence_limit: int = 4
    exit_silence_limit: int = 4
    noise_threshold: int = 20
    non_speech_threshold: float = 0.1
    include_non_speech: bool = False
    create_audio_file: bool = False



class AudioTranscriber:
    def __init__(self, event_loop: asyncio.AbstractEventLoop, whisper_model: WhisperModel, transcribe_settings: dict, app_options: AppOptions, timeoutlimit: int=240):
        self.event_loop = event_loop
        self.whisper_model: WhisperModel = whisper_model
        self.transcribe_settings = transcribe_settings
        self.app_options = app_options
        self.vad = Vad(app_options.non_speech_threshold)
        self.silence_counter = 0
        self.total_silence_counter = 0
        self.audio_data_list = []
        self.all_audio_data_list = []
        self.audio_queue = queue.Queue()
        self.transcribing = False
        self.stream = None
        self._running = asyncio.Event()
        self._transcribe_task = None
        self.segment_log = ""
        self.time = None
        self.timeoutlimit = timeoutlimit

    async def transcribe_audio(self):
        # Ignore parameters that affect performance
        print("transcribe_audio")
        transcribe_settings = self.transcribe_settings.copy()
        transcribe_settings["without_timestamps"] = True
        transcribe_settings["word_timestamps"] = False
        nest_asyncio.apply()

        with ThreadPoolExecutor() as executor:
            while self.transcribing:
                try:
                    try:
                        # Get audio data from queue with a timeout
                        audio_data = await self.event_loop.run_in_executor(executor, functools.partial(self.audio_queue.get, timeout=3.0))
                        # Create a partial function for the model's transcribe method
                        func = functools.partial(self.whisper_model.transcribe,audio=audio_data,**transcribe_settings)
                        # Run the transcribe method in a thread
                        segments, info = await self.event_loop.run_in_executor(executor, func)
                        print("Detected language '%s' with probability %f" % (info.language, info.language_probability))
            
                        for segment in segments:
                            self.segment_log += str(segment.text)
                            print(segment.text)
                        
                    except queue.Empty:
                        # Skip to the next iteration if a timeout occurs
                        continue
                except Exception as e:
                    print(str(e))

    def get_segment_log(self):
        return str(self.segment_log)
    
    def process_audio(self, audio_data: np.ndarray, frames: int, time, status):
        is_speech = self.vad.is_speech(audio_data)
        
        #print("counter:", self.silence_counter, self.total_silence_counter, is_speech, (datetime.datetime.now()-self.time).seconds)
        if is_speech:
            self.silence_counter = 0
            self.total_silence_counter = 0
            self.audio_data_list.append(audio_data.flatten())
        else:
            self.silence_counter += 1
            self.total_silence_counter += 1
            if self.app_options.include_non_speech:
                self.audio_data_list.append(audio_data.flatten())
        
        if not is_speech and self.silence_counter > self.app_options.silence_limit:
            #print("SKAL STOPPE", len(self.audio_data_list), self.app_options.noise_threshold)
            self.silence_counter = 0
            #self.event_loop.stop()
            if self.app_options.create_audio_file:
                self.all_audio_data_list.extend(self.audio_data_list)

            if len(self.audio_data_list) > self.app_options.noise_threshold:
                concatenate_audio_data = np.concatenate(self.audio_data_list)
                self.audio_data_list.clear()
                self.audio_queue.put(concatenate_audio_data)
            else:
                # noise clear
                self.audio_data_list.clear()

        if (not is_speech and self.total_silence_counter > self.app_options.exit_silence_limit) or (datetime.datetime.now()-self.time).seconds >= self.timeoutlimit:
            #print("exiter den med min funksjon?")
            self._running.clear()


    def batch_transcribe_audio(self, audio_data: np.ndarray):
        segment_list = []
        segments, info = self.whisper_model.transcribe(audio=audio_data, **self.transcribe_settings)

        print("From audio batch: Detected language '%s' with probability %f" % (info.language, info.language_probability))
        for segment in segments:
            word_list = []
            if self.transcribe_settings["word_timestamps"] == True:
                for word in segment.words:
                    word_list.append({
                            "start": word.start,
                            "end": word.end,
                            "text": word.word,
                        })
            segment_list.append({
                    "start": segment.start,
                    "end": segment.end,
                    "text": segment.text,
                    "words": word_list,
                })
        print(segment_list)

    async def start_transcription(self):
        try:
            nest_asyncio.apply()
            self.time = datetime.datetime.now()
            self.segment_log = ""
            self.transcribing = True
            self.stream = create_audio_stream(self.app_options.audio_device, self.process_audio)
            self.stream.start()
            self._running.set()
            self._transcribe_task = asyncio.run_coroutine_threadsafe(self.transcribe_audio(), self.event_loop)
            print("Transcription started.")
            #time.sleep(4)
            while self._running.is_set():
                #print("sjekk")
                await asyncio.sleep(1)
            
            print("able to quit", self.segment_log)
            #return self.segment_log
        except Exception as e:
            print("Feilet til å starte")
            print(e)

    async def stop_transcription(self):
        try:
            self.transcribing = False
            self.silence_counter = 0
            self.total_silence_counter = 0
            self.audio_data_list = []
            
            if self._transcribe_task is not None:
                self.event_loop.call_soon_threadsafe(self._transcribe_task.cancel)
                self._transcribe_task = None

            if self.app_options.create_audio_file and len(self.all_audio_data_list) > 0:
                audio_data = np.concatenate(self.all_audio_data_list)
                self.all_audio_data_list.clear()
                write_audio("web", "voice", audio_data)
                self.batch_transcribe_audio(audio_data)

            self.all_audio_data_list = []

            if self.stream is not None:
                self._running.clear()
                self.stream.stop()
                self.stream.close()
                self.stream = None
                #self.event_loop.stop()
                #self.event_loop.close()
                print("Transcription stopped.")
            else:
                print("No active stream to stop.")
            #return self.segment_log
        except Exception as e:
            print("Feilet til å slutte")
            print(e)




if __name__ == '__main__':
    try:
        # Define app options
        app_options = AppOptions(audio_device=0, silence_limit=2, exit_silence_limit=1500, noise_threshold=20)
        # Whisper model configuration
        model_path = "large-v3"#"small"  # You can adjust this to "base", "small", etc. depending on the model you want
        whisper_model = WhisperModel(model_path, device="cpu", compute_type="int8")
        # Transcribe settings, you can tweak these as needed
        transcribe_settings = {"beam_size": 5, "best_of": 5, "word_timestamps": True}
        # Set up asyncio event loop
        event_loop = asyncio.get_event_loop()
        # Initialize the transcriber object
        transcriber = AudioTranscriber(event_loop=event_loop, whisper_model=whisper_model, transcribe_settings=transcribe_settings, app_options=app_options)
        # Define an async function to run the transcription
        async def run_transcription():
            # Start transcribing
            await transcriber.start_transcription()
            # Stop transcription after seconds of silence
            await transcriber.stop_transcription()
        # Run the transcription process
        event_loop.run_until_complete(run_transcription())
    except Exception as e:
        print(f"Error: {str(e)}")
