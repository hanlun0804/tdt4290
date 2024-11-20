import { Fragment } from "react";
import { SequenceItem } from '../../types/types'

export function Timeline({ sequence }: { sequence: SequenceItem[] }) {

  return (
    <div className="flex items-start justify-center">
      <div className="grid w-full max-w-4xl grid-cols-[1fr_auto_1fr]">
        {sequence.map((message, index) => (
          <Fragment key={index}>
            {/* Bot Message */}
            <div
              className={`col-span-1 max-w-80 text-right ${message.bot ? "" : "invisible"} mr-4 pb-4`}
            >
              <p>{message.bot && message.text}</p>
            </div>
            {/* Timeline */}
            <div className="col-span-[auto] relative flex justify-center">
              <div className="absolute bottom-0 top-0 w-[2px] bg-slate-700"></div>
              <div className="relative z-10 h-4 w-4 rounded-full border-2 border-slate-700 bg-slate-700"></div>
            </div>
            {/* Customer Message */}
            <div
              className={`col-span-1 max-w-80 text-left ${message.bot ? "invisible" : ""} ml-4 pb-4`}
            >
              <p>{!message.bot && message.text}</p>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
