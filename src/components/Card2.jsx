import React, { useState, useEffect } from "react";
import { useGlobalContext } from "../GlobalContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

function Card2({ title }) {
  const { orgSelected } = useGlobalContext();
  const { user } = useAuth();
  const [isCompleted, setIsCompleted] = useState(false); // State to track completion status
  const { setSurveySelected } = useGlobalContext();
  const navigate = useNavigate();

  useEffect(() => {
    const checkIfCompleted = async () => {
      const surveyRef = doc(db, orgSelected, title); // `title` represents survey name
      const surveyDoc = await getDoc(surveyRef);
      const surveyData = surveyDoc.data();

      if (surveyData && surveyData.responses) {
        // Check each option in responses for the user's uid
        const hasResponded = Object.keys(surveyData.responses).some((option) =>
          surveyData.responses[option].some((response) => response.uid === user.uid)
        );
        setIsCompleted(hasResponded); // Update state based on whether user has responded
      }
    };

    checkIfCompleted();
  }, [orgSelected, title, user.uid]); // Dependencies to re-run when relevant data changes

  const handleVisitClick = () => {
    setSurveySelected(title);
    navigate("/survey-dashboard");
  };

  return (
    <div className="shadow-lg inline-flex flex-col justify-center items-center p-4 space-y-2 m-4 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105 duration-300">
      <h1 className="text-center font-bold mb-4 text-lg font-sans">{title}</h1>
      {isCompleted ? (
        <h3 className="text-red-400 text-md">Responded</h3>
      ) : (
        <h3 className="text-green-400 text-md font-bold">Yet to respond...</h3>
      )}
      <button
        onClick={handleVisitClick}
        className="transition ease-in-out delay-150 bg-[#FF9C73] hover:-translate-y-1 hover:scale-105 hover:bg-[#FF4545] duration-300 w-[180px] h-[40px] m-2 rounded-xl text-white font-semibold"
      >
        Visit
      </button>
    </div>
  );
}

export default Card2;
