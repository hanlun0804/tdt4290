import { ReactNode } from "react";

type Props = {
  text: string;
  icon: ReactNode;
};

export default function LoadingContainer(props: Props) {
  const { text, icon } = props;
  return (
    <>
      <div className="flex h-52 w-52 flex-col items-center justify-center rounded-full bg-white text-black">
        <div className="mb-2 text-7xl">{icon}</div>
        <div>{text}</div>
      </div>
      <div className="absolute left-0 top-0 flex h-screen w-screen justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          <circle
            fill="none"
            strokeOpacity="1"
            stroke="#fff"
            strokeWidth=".5"
            cx="100"
            cy="100"
            r="0"
          >
            <animate
              attributeName="r"
              calcMode="spline"
              dur="2"
              values="1;80"
              keyTimes="0;1"
              keySplines="0 .2 .5 1"
              repeatCount="indefinite"
            ></animate>
            <animate
              attributeName="stroke-width"
              calcMode="spline"
              dur="2"
              values="0;25"
              keyTimes="0;1"
              keySplines="0 .2 .5 1"
              repeatCount="indefinite"
            ></animate>
            <animate
              attributeName="stroke-opacity"
              calcMode="spline"
              dur="2"
              values="1;0"
              keyTimes="0;1"
              keySplines="0 .2 .5 1"
              repeatCount="indefinite"
            ></animate>
          </circle>
        </svg>
      </div>
    </>
  );
}
