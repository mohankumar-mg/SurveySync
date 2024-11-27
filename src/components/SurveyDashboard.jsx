import React, { useState, useEffect, useRef } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  deleteDoc,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../AuthContext";
import { useGlobalContext } from "../GlobalContext";
import LoadingIndicator from "./LoadingIndicator";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { jsPDF } from "jspdf";
import "jspdf-autotable"; // Import the autoTable plugin
import html2canvas from "html2canvas";
import ExcelJS from "exceljs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Make sure to import the CSS
import DownloadBtn from "../assets/DownloadBtn.svg";

ChartJS.register(ArcElement, Tooltip, Legend);

function SurveyDashboard() {
  const { orgSelected, surveySelected } = useGlobalContext();
  const orgName = orgSelected;
  const surveyName = surveySelected;
  const { user } = useAuth();
  const [survey, setSurvey] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [hasResponded, setHasResponded] = useState(false);
  const [respondedUsers, setRespondedUsers] = useState([]);
  const [nonRespondedUsers, setNonRespondedUsers] = useState([]);

  const createdOrgs =
    user?.organizationsCreated?.length > 0 ? user.organizationsCreated : null;
  const selectedOrg = orgSelected || localStorage.getItem("orgSelected");
  const isAdmin =
    createdOrgs != null ? createdOrgs.includes(selectedOrg) : false;

  const [chartData, setChartData] = useState({
    labels: [], // Empty array for options (survey choices)
    datasets: [
      {
        data: [], // Empty array for the count of responses for each option
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#FF9F40",
        ], // Colors for each option (you can add more if needed)
      },
    ],
  });

  const chartRef = useRef(); // Ref to capture the Pie chart

  // Function to download the chart as a PDF
  const downloadPDF = () => {
    // Use html2canvas to capture the pie chart as an image
    html2canvas(chartRef.current).then((canvas) => {
      // Create a new jsPDF instance
      const pdf = new jsPDF();

      // Add the captured chart image to the PDF
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 10, 30, 180, 180); // Position and size of the image on the PDF

      // Save the PDF
      pdf.save("survey_results.pdf");
    });
  };

  //handling delete survey requests
  const handleSurveyDelete = async () => {
    try {
      const metaRef = doc(db, orgName, "meta");
      const metaDoc = await getDoc(metaRef);
      const surveyRef = doc(db, orgName, surveyName);

      if (metaDoc.exists()) {
        await updateDoc(metaRef, {
          existingSurveyNames: arrayRemove(surveyName),
        });
      }

      await deleteDoc(surveyRef);
      console.log("Survey deleted successfully!");
      toast.success("Survey deleted successfully!");
    } catch (error) {
      console.log("Error in deleting survey!" + error);
      toast.error("Error in deleting survey!");
    }
  };

  // Function to fetch survey responses and users
  const fetchSurveyResponses = async () => {
    try {
      const orgRef = doc(db, orgName, "meta");
      const orgDoc = await getDoc(orgRef);
      const surveyRef = doc(db, orgName, surveyName);
      const surveyDoc = await getDoc(surveyRef);

      if (orgDoc.exists() && surveyDoc.exists()) {
        const orgData = orgDoc.data();
        const surveyData = surveyDoc.data();

        const allUsers = orgData.members.map((member) => member.username);
        const respondedUsers = [];
        const nonRespondedUsers = [];

        // Process responses
        Object.keys(surveyData.responses || {}).forEach((option) => {
          surveyData.responses[option].forEach((response) => {
            if (response.uid) {
              respondedUsers.push({
                username: response.username,
                option: option,
              });
            }
          });
        });

        // Identify non-responded users
        allUsers.forEach((username) => {
          if (!respondedUsers.some((user) => user.username === username)) {
            nonRespondedUsers.push(username);
          }
        });

        setRespondedUsers(respondedUsers);
        setNonRespondedUsers(nonRespondedUsers);
      }
    } catch (error) {
      console.error("Error fetching responses:", error);
      toast.error("Error fetching responses:", error);
    }
  };

  // Excel Export Logic
  const exportRespondedToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Responded Users");

    // Add header row
    worksheet.columns = [
      { header: "Username", key: "username", width: 30 },
      { header: "Chosen Option", key: "option", width: 20 },
    ];

    // Add rows
    respondedUsers.forEach((user) => {
      worksheet.addRow(user);
    });

    // Create file and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "responded_users.xlsx";
    link.click();
  };

  const exportNonRespondedToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Non-Responded Users");

    // Add header row
    worksheet.columns = [{ header: "Username", key: "username", width: 30 }];

    // Add rows
    nonRespondedUsers.forEach((username) => {
      worksheet.addRow({ username });
    });

    // Create file and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "non_responded_users.xlsx";
    link.click();
  };

  const exportRespondedToPDF = () => {
    const doc = new jsPDF();
    doc.text("Responded Users", 10, 10);
    doc.autoTable({
      head: [["Username", "Chosen Option"]],
      body: respondedUsers.map((user) => [user.username, user.option]),
    });
    doc.save("responded_users.pdf");
  };

  // PDF Export Logic for Non-Responded Users
  const exportNonRespondedToPDF = () => {
    const doc = new jsPDF();
    doc.text("Non-Responded Users", 10, 10);
    doc.autoTable({
      head: [["Username"]],
      body: nonRespondedUsers.map((username) => [username]),
    });
    doc.save("non_responded_users.pdf");
  };

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const surveyRef = doc(db, orgName, surveyName);
        const surveyDoc = await getDoc(surveyRef);

        if (surveyDoc.exists()) {
          const surveyData = surveyDoc.data();
          setSurvey(surveyData);
          setComments(surveyData.comments || []);

          // Calculate response counts for pie chart
          const responseCounts = surveyData.responses
            ? Object.keys(surveyData.responses).map((option) => {
                const responseArray = surveyData.responses[option];
                const count = responseArray.length;
                return { option, count };
              })
            : [];

          // Prepare chart data
          const chartData = {
            labels: responseCounts.map((item) => item.option),
            datasets: [
              {
                data: responseCounts.map((item) => item.count),
                backgroundColor: [
                  "#FF6384",
                  "#36A2EB",
                  "#FFCE56",
                  "#4BC0C0",
                  "#FF9F40",
                ],
              },
            ],
          };

          setChartData(chartData); // Set chart data state

          const userResponse = Object.values(surveyData.responses || {}).some(
            (responseArray) =>
              responseArray.some((response) => response.uid === user.uid)
          );
          setHasResponded(userResponse);

          // Fetch responses and users
          fetchSurveyResponses();
        } else {
          toast.error("Survey not found.");
        }
      } catch (error) {
        console.error("Error fetching survey:", error);
        toast.error("Failed to load survey. Please try again.");
      }
    };

    fetchSurvey();
  }, [orgName, surveyName, user.uid]);

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  const handleSubmitResponse = async () => {
    if (!selectedOption) {
      toast.info("Please select an option.");
      return;
    }

    try {
      const surveyRef = doc(db, orgName, surveyName);

      await updateDoc(surveyRef, {
        [`responses.${selectedOption}`]: arrayUnion({
          uid: user.uid,
          username: user.username,
        }),
      });

      toast.success("Response submitted successfully!");
      setHasResponded(true);
      setTimeout(() => {
        window.location.reload();
      }, 2000); // Delay of 500ms
    } catch (error) {
      console.error("Error submitting response:", error);
      toast.error("Failed to submit response. Please try again.");
    }
  };

  const handlePostComment = async () => {
    if (!comment) return;

    try {
      const surveyRef = doc(db, orgName, surveyName);

      const newComment = {
        uid: user.uid,
        username: user.username,
        text: comment,
        timestamp: new Date(),
      };

      await updateDoc(surveyRef, {
        comments: arrayUnion(newComment),
      });

      setComments((prevComments) => [...prevComments, newComment]);
      setComment("");
    } catch (error) {
      toast.error("Error posting comment:", error);
      console.error("Error posting comment:", error);
    }
  };

  if (!survey)
    return (
      <div className="ml-[49.5%]">
        <LoadingIndicator />
      </div>
    );

  return (
    <div className="flex flex-col items-center w-[90%] h-full mx-auto p-4 bg-white rounded-md shadow-lg overflow-visible">
      <h1 className="text-2xl font-semibold mb-2 text-center text-green-400 rounded-md">
        {survey.surveyName}
      </h1>

      <p className="text-lg mb-4 text-center">{survey.description}</p>

      <div className="flex flex-row w-full h-[90vh]">
        {/* Survey Question & Options */}
        <div className="flex-1 p-6 ">
          <p className="text-xl font-medium mb-2">{survey.question}</p>
          {!hasResponded ? (
            <div>
              <div className="mb-4">
                {survey.options.map((option, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="radio"
                      id={option}
                      name="option"
                      value={option}
                      onChange={() => handleOptionChange(option)}
                    />
                    <label htmlFor={option} className="ml-2">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
              <button
                onClick={handleSubmitResponse}
                className="p-2 bg-blue-500 text-white rounded-md"
              >
                Submit Response
              </button>
            </div>
          ) : (
            <p className="text-green-500">Thank you for responding!</p>
          )}
        </div>

        {/* Comment Box */}
        <div className="w-[30%] bg-gray-100 p-4 rounded-md shadow-md flex flex-col h-[80%]">
          <h2 className="text-lg font-semibold mb-2">Comments</h2>

          {/* Scrollable Comment List */}
          <div className="flex-1 overflow-y-auto mb-2">
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <div key={index} className="mb-2">
                  <p className="font-semibold">{comment.username}</p>
                  <p>{comment.text}</p>
                </div>
              ))
            ) : (
              <p>No comments yet.</p>
            )}
          </div>

          {/* Comment Input and Button */}
          <div className="mt-2 flex flex-col">
            <textarea
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2 border rounded-md mb-2"
              rows="3"
            />
            <button
              onClick={handlePostComment}
              className="p-2 bg-green-500 text-white rounded-md w-full"
            >
              Post Comment
            </button>
          </div>
        </div>
      </div>
      {isAdmin && (
        <button
          onClick={handleSurveyDelete}
          className="p-2 bg-red-500 text-white rounded-md"
        >
          Delete Survey
        </button>
      )}

      {/* Pie Chart */}
      {isAdmin &&
        (survey ? (
          <div className="flex-[0.75] p-6 mb-[60px]">
            <h1 className="text-2xl font-semibold text-center mb-8">
              Survey Results
            </h1>
            <div ref={chartRef}>
              <Pie data={chartData} />
            </div>
            <button
              onClick={downloadPDF}
              className="mt-4 p-2 bg-blue-500 text-white rounded-md ml-[20%] flex items-center justify-center"
            >
              <img
                src={DownloadBtn}
                alt="downloadbtn"
                className="h-[14px] w-[14px] mr-2"
              />
              Download Chart as PDF
            </button>
          </div>
        ) : (
          <p>Don't have enough data</p>
        ))}

      {isAdmin && (
        <div className="w-full mt-4">
          <div className="shadow-lg">
            <h2 className="text-2xl font-semibold text-center mb-4">
              Responded Users
            </h2>
            <table className="table-auto w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Username</th>
                  <th className="px-4 py-2 border">Chosen Option</th>
                </tr>
              </thead>
              <tbody>
                {respondedUsers.map((user, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 border">{user.username}</td>
                    <td className="px-4 py-2 border">{user.option}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-center mt-4 ">
              <button
                onClick={exportRespondedToExcel}
                className="p-2 bg-blue-500 text-white rounded-md mr-4 mb-4 flex items-center justify-center"
              >
                <img
                  src={DownloadBtn}
                  alt="downloadbtn"
                  className="h-[14px] w-[14px] mr-2"
                />
                Export to Excel
              </button>
              <button
                onClick={exportRespondedToPDF}
                className="p-2 bg-blue-500 text-white rounded-md mb-4 flex items-center justify-center"
              >
                <img
                  src={DownloadBtn}
                  alt="downloadbtn"
                  className="h-[14px] w-[14px] mr-2"
                />
                Export to PDF
              </button>
            </div>
          </div>

          <div className="shadow-lg">
            <h2 className="text-2xl font-semibold text-center mt-[60px]">
              Non-Responded Users
            </h2>
            <table className="table-auto w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Username</th>
                </tr>
              </thead>
              <tbody>
                {nonRespondedUsers.map((username, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 border">{username}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-center mt-4">
              <button
                onClick={exportNonRespondedToExcel}
                className="p-2 bg-blue-500 text-white rounded-md mr-4 mb-4 flex items-center justify-center"
              >
                <img
                  src={DownloadBtn}
                  alt="downloadbtn"
                  className="h-[14px] w-[14px] mr-2"
                />
                Export to Excel
              </button>
              <button
                onClick={exportNonRespondedToPDF}
                className="p-2 bg-blue-500 text-white rounded-md mb-4 flex items-center justify-center"
              >
                <img
                  src={DownloadBtn}
                  alt="downloadbtn"
                  className="h-[14px] w-[14px] mr-2"
                />
                Export to PDF
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
      />
    </div>
  );
}

export default SurveyDashboard;
