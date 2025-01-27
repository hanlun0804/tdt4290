import pyaudio
import time
import numpy as np

p = pyaudio.PyAudio()

CHANNELS = 2
RATE = 44100

def callback(in_data):
    return in_data, pyaudio.paContinue

stream = p.open(format=pyaudio.paFloat32, channels=CHANNELS, rate=RATE, output=True, input=True, stream_callback=callback)

stream.start_stream()

while stream.is_active():
    time.sleep(20)
    stream.stop_stream()
    print("Stream is stopped")

stream.close()

p.terminate()