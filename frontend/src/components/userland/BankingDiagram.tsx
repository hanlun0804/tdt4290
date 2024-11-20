import { useState } from "react";
import bankingDiagram from "../../assets/BankingData.drawio.png";

export default function BankingDiagram() {
  const [showBankingDiagram, setShowBankingDiagram] = useState(false);
  return (
    <>
      {showBankingDiagram && (
        <img
          src={bankingDiagram}
          alt="banking diagram"
          className="absolute bottom-10 right-2 border border-slate-400 bg-slate-200 p-2"
        />
      )}
      <button
        onClick={() => setShowBankingDiagram(!showBankingDiagram)}
        className="absolute bottom-2 right-2 size-fit border border-slate-400 px-8"
      >
        {`${showBankingDiagram ? "Hide" : "Show"} Banking Diagram`}
      </button>
    </>
  );
}
