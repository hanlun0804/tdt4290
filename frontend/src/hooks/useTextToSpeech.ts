let voice: SpeechSynthesisVoice | null = null

const loadVoice = () => {
  const voices = window.speechSynthesis.getVoices()
  voice = voices.find((v) => v.name === 'Google UK English Female') || null
}

loadVoice()
window.speechSynthesis.onvoiceschanged = loadVoice

export const useTextToSpeech = () => {
  const speak = (text: string) => {
    if ('speechSynthesis' in window && voice) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.voice = voice
      window.speechSynthesis.speak(utterance)
    } else {
      throw Error('failed to speak text')
    }
  }

  return { speak }
}
