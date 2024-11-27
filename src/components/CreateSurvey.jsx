import React, { useState } from "react";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useGlobalContext } from "../GlobalContext";
import { useAuth } from "../AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function CreateSurvey() {
  const { orgSelected } = useGlobalContext();
  const orgName = orgSelected || localStorage.getItem("orgSelected");
  const { user } = useAuth();
  const [surveyName, setSurveyName] = useState("");
  const [description, setDescription] = useState("");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([""]);

  const handleAddSurvey = async () => {
    if (!surveyName || !description || !question || options.length === 0) {
      toast.error("All fields must be filled out.");
      return;
    }

    try {
      const metaRef = doc(db, orgName, "meta");
      const metaDoc = await getDoc(metaRef);

      if (metaDoc.exists()) {
        const existingSurveyNames = metaDoc.data().existingSurveyNames || [];

        if (existingSurveyNames.includes(surveyName)) {
          toast.error("Survey name already exists. Please choose a different name.");
          return;
        }

        await updateDoc(metaRef, {
          existingSurveyNames: arrayUnion(surveyName),
        });
      } else {
        await setDoc(metaRef, { existingSurveyNames: [surveyName] });
      }

      const surveyRef = doc(db, orgName, surveyName);
      await setDoc(surveyRef, {
        surveyName,
        description,
        question,
        options,
        comments: [],
      });

      toast.success("Survey created successfully!");
    } catch (error) {
      console.error("Error creating survey:", error);
      toast.error("Failed to create survey. Please try again.");
    }
  };

  const handleAddOption = () => setOptions([...options, ""]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-2xl rounded-lg hover:shadow-xl transition-transform duration-200 transform hover:scale-105">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Create New Survey</h2>

      <input
        type="text"
        placeholder="Survey Name"
        value={surveyName}
        onChange={(e) => setSurveyName(e.target.value)}
        className="mb-4 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mb-4 p-3 w-full h-24 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <input
        type="text"
        placeholder="Question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="mb-4 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <div className="mb-4">
        {options.map((option, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="text"
              placeholder={`Option ${index + 1}`}
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              className="p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        ))}
        <button
          onClick={handleAddOption}
          className="mt-3 py-2 px-4 w-full bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-200"
        >
          + Add Another Option
        </button>
      </div>

      <button
        onClick={handleAddSurvey}
        className="py-3 px-6 w-full bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-colors duration-200 font-semibold"
      >
        Submit Survey
      </button>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
      />
    </div>
  );
}

export default CreateSurvey;
