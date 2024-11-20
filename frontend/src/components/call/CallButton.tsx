import { FaPhoneAlt } from "react-icons/fa";

type Props = {
  setState: (state: string) => void;
};

export default function CallButton(props: Props) {
  const { setState } = props;

  const onClick = () => {
    setState("calling");
  };
  return (
    <button
      onClick={onClick}
      className="flex h-40 w-40 transform flex-col items-center justify-center rounded-full border bg-transparent text-2xl text-white transition-all duration-300 hover:scale-110 hover:cursor-pointer hover:bg-white hover:text-black"
    >
      <FaPhoneAlt size={50} className="mb-2" />
      Call
    </button>
  );
}
