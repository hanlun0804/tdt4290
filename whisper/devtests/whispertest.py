from faster_whisper import WhisperModel
import sounddevice as sd 
from scipy.io.wavfile import write


model_size = "large-v3"

# Run on GPU with FP16
#model = WhisperModel(model_size, device="cuda", compute_type="float16")
# or run on GPU with INT8
# model = WhisperModel(model_size, device="cuda", compute_type="int8_float16")
# or run on CPU with INT8
model = WhisperModel(model_size, device="cpu", compute_type="int8")

fs = 44100
duration = 10
print("Recorder her ifra")
myrecording = sd.rec(int(duration * fs), samplerate=fs, channels=2)
sd.wait()  # Wait until recording is finished
print("stop")
write('output.wav', fs, myrecording)  # Save as WAV file 

segments, info = model.transcribe("output.wav", beam_size=5)

print("Detected language '%s' with probability %f" % (info.language, info.language_probability))

for segment in segments:
    print("[%.2fs -> %.2fs] %s" % (segment.start, segment.end, segment.text))

#TODO: continous transcribing of an audio stream -> stops when user stops speaking -> parital matching to db results -> give prosentage hit rate and verification 
