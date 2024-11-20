import axios from "axios";

export const backendEndpoint = "http://localhost:3000";

export const tableNames = [
  "Account",
  "AccountOwnership",
  "AccountTransaction",
  "Bank",
  "Card",
  "Customer",
  "Loan",
  "CustomerRelation"
] as const
export type TableName = typeof tableNames[number]

export const sendAudio = async (audioBlob: Blob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.wav');

  return await axios.post(`${backendEndpoint}/voicebot/audio`, formData, {
      headers: {
          'Content-Type': 'multipart/form-data',
      },
  });
};

type Origin = "userland" | "cheque-client" | "baffel"
/**
 * 
 * @param origin which part of the application the request is sent from 
 * @param path additional string to hit the right endpoint
 * @param data optional. Any object (or other data) that you want to post to the backend. 
 * If undefined, a get request will be sent instead.
 * @returns an async function for fetching data. This is to be used in tanstack query,
 * for example like this:
 * ```ts
 *  const { data } = useQuery({
 *    queryKey: ["getSomeData"],
 *    queryFn: requestFormatter("userland", "data/Customer")
 * })
 * ``` 
 */
export const requestFormatter = (origin: Origin, path: string, data?: any) => {
  const url = `${backendEndpoint}/${origin}/${path}`
  if (!data) {
    return async () => axios.get(url).then(res => res.data)
  } else {
    return async () => axios.post(url, data).then(res => res.data)
  }
}

