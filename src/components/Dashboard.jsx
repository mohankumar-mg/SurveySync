import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import Card from "./Card";

function Dashboard() {
  const { user } = useAuth();
  return (
    <div>
      <h1 className="text-center text-lg text-green-400 font-semibold">
        <span className="text-pink-400">Welcome</span> {user?.username}!
      </h1>
      
      <div className="mx-[36%] mt-[60px]">
        <Link to="/join-org">
          <button className="transition ease-in-out delay-150 bg-[#D76C82] hover:-translate-y-1 hover:scale-110 hover:bg-[#006A67] duration-300 w-[180px] h-[40px] m-2 rounded-xl text-white font-semibold">
            Join Organization
          </button>
        </Link>
        
        <Link to="/create-org">
          <button className="transition ease-in-out delay-150 bg-[#257180] hover:-translate-y-1 hover:scale-110 hover:bg-[#FF4545] duration-300 w-[180px] h-[40px] m-2 rounded-xl text-white font-semibold">
            Create Organization
          </button>
        </Link>
      </div>

      <div className="mx-12 my-20">
        <h1 className="font-extrabold text-2xl mb-12">My Organizations</h1>
        {/* Map through organizationsCreated array */}
        {user?.organizationsCreated?.length > 0 ? (
          user.organizationsCreated.map((orgName, index) => (
            <Card key={index} title={orgName} />
          ))
        ) : (
          <p>No organizations created.</p>
        )}
      </div>

      <div className="mx-12 my-20">
        <h1 className="font-extrabold text-2xl mb-12">Joined Organizations</h1>
        {/* Map through organizationsJoined array */}
        {user?.organizationsJoined?.length > 0 ? (
          user.organizationsJoined.map((orgName, index) => (
            <Card key={index} title={orgName} />
          ))
        ) : (
          <p>No organizations joined.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
