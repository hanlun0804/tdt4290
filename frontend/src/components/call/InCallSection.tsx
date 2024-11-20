import { useEffect } from "react";
import { FaCheck } from "react-icons/fa6";

export default function InCallSection() {
  useEffect(() => {
    onLoad();
  }, []);

  const onLoad = async () => {
    var audio = new Audio("../../../public/transition.mp3");
    audio.play();
  };

  return (
    <div style={{ width: 500 }}>
      <h1 className="mb-2 text-5xl">In Call</h1>
      <h1 className="mb-8 text-3xl text-slate-400">Information collected</h1>
      <div className="mb-2 flex flex-row text-emerald-50">
        <FaCheck className="mr-2" size={30} color="#fff" />
        <h2>Name</h2>
      </div>
      <div className="mb-2 flex flex-row text-emerald-500">
        <FaCheck className="mr-2" size={30} color="#fff" />
        <h2>Identification number</h2>
      </div>
      <div className="mb-2 flex flex-row text-emerald-500">
        <FaCheck className="mr-2" size={30} color="#fff" />
        <h2>Verified last purchase</h2>
      </div>
    </div>
  );
}

/*
        <CircularProgressbarWithChildren value={0} maxValue={3} styles={buildStyles({
            // Rotation of path and trail, in number of turns (0-1)
            rotation: 0,
            // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
            strokeLinecap: 'round',

            // Text size
            textSize: '16px',

            // How long animation takes to go from one percentage to another, in seconds
            pathTransitionDuration: 0.5,

            // Can specify path transition in more detail, or remove it entirely
            // pathTransition: 'none',

            // Colors
            pathColor: "white",
            textColor: 'white',
            trailColor: 'black',
            backgroundColor: 'transparent',
        })}>
            <div className="text-lg">0/3</div>
        </CircularProgressbarWithChildren>
        */
