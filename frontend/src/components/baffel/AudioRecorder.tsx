import { useState, useRef, useEffect } from 'react'
import { cn } from '../../utils/cn'
import { useMutation } from '@tanstack/react-query'
import { sendAudio } from '../../utils/async'

export function AudioRecorder() {
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioBlobRef = useRef<Blob | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)

      mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/wav',
        })
        audioBlobRef.current = audioBlob
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)
        audioChunksRef.current = []

        mutate(audioBlob)
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing media devices.', error)
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  const { mutate } = useMutation({
    mutationFn: sendAudio,
    onSuccess: () => {
      console.log('Audio sent successfully')
    },
    onError: (error: any) => {
      console.error('Error sending audio:', error)
    },
  })

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stream
        ?.getTracks()
        .forEach((track) => track.stop())
    }
  }, [])

  const buttonFn = isRecording ? stopRecording : startRecording
  const buttonText = isRecording ? 'Stop Recording' : 'Start Recording'

  return (
    <div className="relative w-fit border border-slate-400 p-4">
      <RecordButton
        className={cn(isRecording && 'animate-pulse')}
        onClick={buttonFn}
      >
        <p>{buttonText}</p>
      </RecordButton>

      {audioURL && (
        <div className="m-10 flex flex-col items-center gap-10 border border-slate-400 p-10">
          <audio controls src={audioURL}></audio>
          <button
            onClick={() => audioBlobRef.current && mutate(audioBlobRef.current)}
            className="w-fit rounded-md border border-black bg-green-700 px-4 py-2 text-white"
          >
            Send audio to voicebot!
          </button>
        </div>
      )}
    </div>
  )
}

export function RecordButton(props: React.HTMLAttributes<HTMLButtonElement>) {
  const { children, className, ...buttonProps } = props
  return (
    <button className="relative flex w-fit items-center gap-2" {...buttonProps}>
      <div
        className={cn(
          'size-6 rounded-full border-2 border-red-500 p-0.5',
          className,
        )}
      >
        <div className="size-full rounded-full bg-red-500"></div>
      </div>
      <p className="absolute left-full ml-2 whitespace-nowrap">{children}</p>
    </button>
  )
}
