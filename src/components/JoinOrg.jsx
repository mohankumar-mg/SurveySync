import React, { useState } from "react";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Make sure to import the CSS

function JoinOrg() {
  const { user } = useAuth();
  const [orgName, setOrgName] = useState("");
  const [uniqueCode, setUniqueCode] = useState("");

  const handleJoinOrg = async (e) => {
    e.preventDefault();
    try {
      // Step 1: Check if orgName exists and verify uniqueCode
      const existingCollectionsRef = doc(db, "existingCollections", "existingCollectionsDoc");
      const existingCollectionsDoc = await getDoc(existingCollectionsRef);

      if (existingCollectionsDoc.exists()) {
        const existingCollectionsArray = existingCollectionsDoc.data().existingCollectionsArray;
        
        const orgDetails = existingCollectionsArray.find(
          (org) => org.orgName === orgName && org.uniqueCode === uniqueCode
        );

        if (!orgDetails) {
          toast.error("Invalid organization name or code. Please try again.");
          return;
        }
      }

      // Step 2: Add current user to the organization's memberRequest array
      const orgMetaRef = doc(db, orgName, "meta");
      await updateDoc(orgMetaRef, {
        memberRequest: arrayUnion({ uid: user.uid, username: user.username }),
      });
      toast.success("Join request sent successfully!");
    } catch (error) {
      console.error("Error joining organization:", error);
      toast.error("Error sending join request. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center">
      <form onSubmit={handleJoinOrg} className="mt-[130px] w-[40%] mx-[30%] flex justify-center shadow-2xl shadow-teal-500/50 w-[400px]">
        <div className="mx-[20px] my-[70px] flex flex-col justify-center items-center">
          <label htmlFor="orgName" className="w-[100%] rounded-xl">
            <input
              id="orgName"
              type="text"
              placeholder="Organization Name"
              className="block bg-[#F5F5F5] h-[35px] w-[100%] rounded-xl pl-[10px]"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
          </label>

          <label htmlFor="uniqueCode" className="w-[100%] rounded-xl mt-4">
            <input
              id="uniqueCode"
              type="text"
              placeholder="Organization Code"
              className="block bg-[#F5F5F5] h-[35px] w-[100%] rounded-xl pl-[10px]"
              value={uniqueCode}
              onChange={(e) => setUniqueCode(e.target.value)}
            />
          </label>

          <div className="flex flex-col items-center mt-[40px] w-[100%]">
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-2 mb-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 w-[100%]"
            >
              Join
            </button>
            
          </div>
        </div>
      </form>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
      />
    </div>
  );
}

export default JoinOrg;
