import { Link } from "react-router-dom";
import userland from "../assets/userland.jpeg";
import cheque from "../assets/cheque.jpeg";
import baffel from "../assets/baffel.jpeg";

const links = [
  {
    path: "userland",
    name: "User Land",
    description: "Act as a customer. Create accounts, cards and make transactions",
    img: userland,
  },
  {
    path: "cheque-client",
    name: "Cheque Client",
    description: "Act as an operator. Search for customers and view their account status and transaction history",
    img: cheque,
  },
  {
    path: "baffel",
    name: "Baffel",
    description: "Act as an operator in a call center. View information about the customer calling in.",
    img: baffel,
  },
];

type LLink = (typeof links)[number];

export default function LandingPage() {
  return (
    <div className="h-screen bg-gradient-to-b from-rose-700 to-40% to-indigo-900 py-10 px-40 text-white">
      <p className="text-3xl">
        Welcome to Customer Driven project group 6 Banking System
      </p>

      <p className="mb-6 2xl:mt-20">Choose what you want to do:</p>
      <div className="flex gap-4 justify-between">
        {links.map((link) => (
          <LinkCard key={link.path} link={link} />
        ))}
      </div>
    </div>
  );
}

function LinkCard({ link }: { link: LLink }) {
  const { path, description, img, name } = link;
  return (
    <Link
      className="shadow-xl bg-slate-700 shadow-black hover:scale-110 transition-all duration-500 w-96"
      to={`/${path}`}
    >
        <img className="min-size-96" src={img} alt="link to app" />
        <p className="p-2 text-3xl text-center border-b border-slate-200">{name}</p>
        <p className="p-2">{description}</p>
    </Link>
  );
}
