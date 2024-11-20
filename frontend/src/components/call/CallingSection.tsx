import { useEffect } from "react";
import { PiPhoneCallFill } from "react-icons/pi";
import LoadingContainer from "./LoadingContainer";

type Props = {
  setState: (state: string) => void
}

export default function CallingSection(props: Props) {
  const { setState } = props
  
  useEffect(() => {
    onLoad();
  }, []);

  const onLoad = async () => {
    var audio = new Audio("../../../public/call.mp3");
    audio.loop = true;
    audio.play();
    await new Promise((r) => setTimeout(r, 4000));
    audio.pause();
    setState("inCall");
  };
  return <LoadingContainer icon={<PiPhoneCallFill />} text={"Calling..."} />;
}
