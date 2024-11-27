import React from "react";
import { useGlobalContext } from "../GlobalContext";
import { useNavigate } from "react-router-dom";

function Card({ title }) {
  const { setOrgSelected } = useGlobalContext();
  const navigate = useNavigate();

  const handleVisitClick = () => {
    setOrgSelected(title);
    navigate("/org-dashboard");
  };

  return (
    <div className="shadow-lg inline-flex flex-col justify-center items-center p-4 space-y-2 m-4">
      <h1 className="text-center font-bold mb-4 text-lg font-sans">{title}</h1>
      <button
        onClick={handleVisitClick}
        className="transition ease-in-out delay-150 bg-[#FF9C73] hover:-translate-y-1 hover:scale-110 hover:bg-[#FF4545] duration-300 w-[180px] h-[40px] m-2 rounded-xl text-white font-semibold"
      >
        Visit
      </button>
    </div>
  );
}

export default Card;
