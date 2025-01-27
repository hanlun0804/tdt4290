import { useEffect, useState } from "react";

let recognition: SpeechRecognition | null = null;
if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.lang = "en-US";
}

const useSpeechRecognition = (handleStop?: (text: string) => void) => {
    const [text, setText] = useState("")
    const [isListening, setIsListening] = useState(false)

    useEffect(() => {
        if (!recognition) return
        recognition.onresult = (e) => {
            const text = e.results[0][0].transcript
            if (handleStop) handleStop(text)
            setText(e.results[0][0].transcript)
            recognition.stop()
            setIsListening(false)
        }
    }, [])

    const startListening = () => {
        setText("")
        setIsListening(true)
        recognition?.start()
    }

    const stopListening = () => {
        setIsListening(false)
        recognition?.stop()
    }
    return {
        text, 
        isListening, 
        startListening,
        stopListening,
        hasRecognitionSupport: !!recognition
    }    
};

export default useSpeechRecognition;
