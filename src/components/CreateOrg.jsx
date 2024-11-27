import { useState } from "react";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Make sure to import the CSS
import { Link } from "react-router-dom";

function CreateOrg() {
  const { user } = useAuth();
  const [orgName, setOrgName] = useState("");
  const [uniqueCode, setUniqueCode] = useState(""); // Store the generated unique code

  const generateUniqueCode = () => {
    const code = Math.random().toString(36).substr(2, 8).toUpperCase();
    return code;
  };

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    try {
      const existingCollectionsRef = doc(
        db,
        "existingCollections",
        "existingCollectionsDoc"
      );
      const existingCollectionsDoc = await getDoc(existingCollectionsRef);

      if (existingCollectionsDoc.exists()) {
        const existingCollectionsArray =
          existingCollectionsDoc.data().existingCollectionsArray;

        // Check if orgName or uniqueCode already exists
        const orgExists = existingCollectionsArray.some(
          (org) => org.orgName === orgName
        );

        let newUniqueCode;
        let codeExists;
        do {
          newUniqueCode = generateUniqueCode();
          codeExists = existingCollectionsArray.some(
            (org) => org.uniqueCode === newUniqueCode
          );
        } while (codeExists);

        if (orgExists) {
          toast.error("Organization already exists.");
          return;
        }

        // Step 2: Create the organization and save data
        const orgRef = doc(db, orgName, "meta");
        await setDoc(orgRef, {
          admin: { uid: user.uid, username: user.username },
          members: [{ uid: user.uid, username: user.username }],
          memberRequest: [],
          uniqueCode: newUniqueCode,
        });

        // Step 3: Add the organization to the user's created organizations
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          organizationsCreated: arrayUnion(orgName),
        });

        // Step 4: Store both orgName and uniqueCode in existingCollectionsArray
        await updateDoc(existingCollectionsRef, {
          existingCollectionsArray: arrayUnion({
            orgName: orgName,
            uniqueCode: newUniqueCode,
          }),
        });

        setUniqueCode(newUniqueCode); // Save generated code for display
        toast.success("Organization created successfully!");
      }
    } catch (error) {
      console.error("Error creating organization:", error);
      toast.error("Error creating organization. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center">
      <form
        onSubmit={handleCreateOrg}
        className="mt-[130px] w-[40%] mx-[30%] flex justify-center shadow-2xl shadow-teal-500/50 w-[400px]"
      >
        <div className="mx-[20px] my-[70px] flex flex-col justify-center items-center">
          <label
            htmlFor="orgName"
            className="flex items-center w-[100%] rounded-xl"
          >
            <input
              id="orgName"
              type="text"
              name="orgName"
              placeholder="Organization Name"
              className="block bg-[#F5F5F5] h-[35px] w-[100%] rounded-xl pl-[10px]"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
          </label>

          <div className="flex flex-col items-center mt-[40px] w-[100%]">
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-2 mb-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-[100%]"
            >
              Create
            </button>

            {uniqueCode && (
              <div>
                <p className="text-green-600 mt-2 mb-2">
                  Organization Code: <strong>{uniqueCode}</strong>
                </p>
                <Link to="/dashboard" className="ml-[45px] text-blue-400">Go to dashboard</Link>
              </div>
            )}
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

export default CreateOrg;
