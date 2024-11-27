import React, { useState, useEffect } from "react";
import { useGlobalContext } from "../GlobalContext";
import { useAuth } from "../AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import OrganizationDetails from "./OrganizationDetails";
import Card2 from "./Card2";
import LoadingIndicator from "./LoadingIndicator";
import { deleteOrganization } from "../deleteOrganization";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Make sure to import the CSS

function OrgDashboard() {
  const { orgSelected } = useGlobalContext();
  const { user } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const createdOrgs =
    user?.organizationsCreated?.length > 0 ? user.organizationsCreated : null;
  const selectedOrg = orgSelected || localStorage.getItem("orgSelected");
  const isAdmin =
    createdOrgs != null ? createdOrgs.includes(selectedOrg) : false;

  useEffect(() => {
    const fetchSurveys = async () => {
      setLoading(true);
      try {
        const orgRef = collection(db, selectedOrg);
        const orgDocs = await getDocs(orgRef);
        const surveyDocs = orgDocs.docs
          .filter((doc) => doc.id !== "meta")
          .map((doc) => ({ id: doc.id, ...doc.data() }));
        setSurveys(surveyDocs);
      } catch (error) {
        console.error("Error fetching surveys:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedOrg) {
      fetchSurveys();
    }
  }, [selectedOrg]);

  const handleDelete = async () => {
    try {
      await deleteOrganization(selectedOrg, user); // Call the delete function
      // Optionally redirect the user after deletion
      toast.success("Organization deleted successfully");
      setTimeout(() =>{
        navigate("/dashboard");
      }, 1500);

    } catch (error) {
      console.error("Error deleting organization:", error);
      toast.success("Error deleting organization");
    }
  };

  return (
    <div className="flex h-[90vh] w-full">
      {/* Left side: Surveys */}
      <div className="w-[100%] p-4 flex flex-col items-center">
        <p className="text-center font-semibold text-lg mb-4">
          Welcome to <span className="text-green-400">{selectedOrg}!</span>
          <span className="text-pink-400"> {user?.username}</span> (
          {isAdmin ? "admin" : "member"})
        </p>
        {isAdmin && (
          <div>
            <Link to="/create-survey" className="mb-[50px]">
              <button className="transition ease-in-out delay-150 bg-[#D76C82] hover:-translate-y-1 hover:scale-105 hover:bg-[#B03052] duration-300 w-[180px] h-[40px] m-2 rounded-md text-white font-semibold">
                Create Survey
              </button>
            </Link>

            {/* Delete Organization Button */}
            <button
              onClick={handleDelete}
              className="transition ease-in-out delay-150 bg-red-500 hover:-translate-y-1 hover:scale-105 hover:bg-red-700 duration-300 w-[180px] h-[40px] m-2 rounded-md text-white font-semibold"
            >
              Delete Organization
            </button>
          </div>
        )}
        <div className="flex w-[100%]">
          <div className="w-[80%]">
            {loading ? (
              <div className="flex justify-center w-full mt-[40px]">
                <LoadingIndicator />
              </div>
            ) : surveys.length > 0 ? (
              <div className="flex flex-wrap justify-start gap-4 w-full mt-[80px]">
                {surveys.map((survey) => (
                  <Card2 key={survey.id} title={survey.surveyName} />
                ))}
              </div>
            ) : (
              <p className="text-center mt-[140px]">No surveys available.</p>
            )}
          </div>

          {/* Right side: Organization Details */}
          <div className="w-[20%] px-2 py-4">
            <OrganizationDetails orgName={selectedOrg} isAdmin={isAdmin} />
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
      />
    </div>
  );
}

export default OrgDashboard;
