import { useState } from "react";
import CallingSection from "../../components/call/CallingSection";
import InCallSection from "../../components/call/InCallSection";
import CallButton from "../../components/call/CallButton";

export default function DemoPage() {
  const [state, setState] = useState("");

  return (
    <div className="animated-gradient item-center flex h-screen w-screen items-center justify-center bg-slate-700 text-3xl font-light text-white">
      {!state && <CallButton setState={setState} />}
      {state === "calling" && <CallingSection setState={setState} />}
      {state === "inCall" && <InCallSection />}
    </div>
  );
}
