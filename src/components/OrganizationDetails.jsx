import React, { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import LoadingIndicator from "./LoadingIndicator";

function OrganizationDetails({ orgName, isAdmin }) {
  const [uniqueCode, setUniqueCode] = useState("");
  const [members, setMembers] = useState([]);
  const [memberRequests, setMemberRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState("people");

  useEffect(() => {
    const fetchOrgDetails = async () => {
      setLoading(true);
      try {
        const orgMetaRef = doc(db, orgName, "meta");
        const orgMetaDoc = await getDoc(orgMetaRef);

        if (orgMetaDoc.exists()) {
          const data = orgMetaDoc.data();
          setUniqueCode(data.uniqueCode || "");
          setMembers(data.members || []);
          setMemberRequests(data.memberRequest || []);
        } else {
          setError("Organization not found");
        }
      } catch (err) {
        console.error("Error fetching organization details:", err);
        setError("Failed to fetch organization details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrgDetails();
  }, [orgName]);

  const handleAllowUser = async (user) => {
    try {
      const orgMetaRef = doc(db, orgName, "meta");
      await updateDoc(orgMetaRef, {
        members: arrayUnion({ uid: user.uid, username: user.username }),
        memberRequest: arrayRemove({ uid: user.uid, username: user.username }),
      });

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        organizationsJoined: arrayUnion(orgName),
      });

      setMembers((prevMembers) => [...prevMembers, user]);
      setMemberRequests((prevRequests) =>
        prevRequests.filter((request) => request.uid !== user.uid)
      );
    } catch (error) {
      console.error("Error allowing user to join:", error);
      alert("Failed to allow user. Please try again.");
    }
  };

  if (loading)
    return (
      <div className="mx-auto w-[5%] ml-[40%]">
        <LoadingIndicator />
      </div>
    );
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-md shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105 duration-300">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-md font-bold text-blue-600">Organization Code</h2>
        <span className="text-lg text-green-500 font-medium">{uniqueCode}</span>
      </div>

      <div className="flex justify-center space-x-4 mb-4">
        <button
          onClick={() => setSelectedTab("people")}
          className={`px-1 font-semibold rounded-md ${
            selectedTab === "people" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Members
        </button>
        {isAdmin && (
          <button
            onClick={() => setSelectedTab("requests")}
            className={`px-4 py-1 font-semibold rounded-md ${
              selectedTab === "requests"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            Join Requests
          </button>
        )}
      </div>

      <hr className="border-1 mb-4" />

      {selectedTab === "people" ? (
        <div>
          {members.length > 0 ? (
            <ul className="space-y-2">
              {members.map((member, index) => (
                <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md shadow-sm">
                  <span className="italic font-medium text-gray-800">{member.username}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No members found.</p>
          )}
        </div>
      ) : (
        <div>
          {memberRequests.length > 0 ? (
            <ul className="space-y-2">
              {memberRequests.map((request, index) => (
                <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md shadow-sm">
                  <span className="italic font-medium text-gray-800">{request.username}</span>
                  {isAdmin && (
                    <button
                      onClick={() => handleAllowUser(request)}
                      className="transition ease-in-out delay-150 bg-green-500 hover:bg-green-600 duration-300 py-1 px-3 rounded-lg text-white font-semibold ml-4"
                    >
                      Allow
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No pending requests.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default OrganizationDetails;
