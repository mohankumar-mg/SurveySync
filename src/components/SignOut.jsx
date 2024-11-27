import React from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

function SignOut() {
  const { signOut } = useAuth();

  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="transition ease-in-out delay-150 bg-blue-500 hover:-translate-y-1 hover:scale-110 hover:bg-indigo-500 duration-300 w-[80px] h-[35px] mx-2 rounded-xl text-white mt-4"
    >
      Log Out
    </button>
  );
}

export default SignOut;
