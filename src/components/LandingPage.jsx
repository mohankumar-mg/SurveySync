import React from "react";
import { Link } from "react-router-dom";
import TitleImg from "/TitleImg.svg";
import { useAuth } from "../AuthContext";

function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-start mt-[8%]  bg-white">
      <div className="text-center p-6">
        <img
          src={TitleImg}
          alt="logo"
          className="w-[150px] h-[150px] ml-[40%]"
        />
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-red-600 mb-4">
          Welcome to SurveySync
        </h1>

        <p className="text-xl italic font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 mb-16 max-w-3xl mx-auto">
          "Empowering you to collect insights and drive action, one survey at a
          time"
        </p>

        {!user && (
          <div className="flex space-x-4 ml-[20%]">
            <Link to="sign-up">
              <button className="transition-all ease-in-out duration-300 bg-blue-600 hover:bg-indigo-600 hover:-translate-y-1 hover:scale-110 text-white w-48 h-12 rounded-full shadow-lg transform">
                Sign Up
              </button>
            </Link>
            <Link to="sign-in">
              <button className="transition-all ease-in-out duration-300 bg-transparent hover:bg-blue-600 hover:text-white hover:-translate-y-1 hover:scale-110 border-2 border-blue-600 text-blue-600 w-48 h-12 rounded-full shadow-lg transform">
                Sign In
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default LandingPage;
