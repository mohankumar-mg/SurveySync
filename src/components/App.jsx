import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import Page404 from "./Page404";
import LandingPage from "./LandingPage";
import Dashboard from "./Dashboard";
import ProtectedRoute from "../ProtectedRoute";
import SideNavbar from "./SideNavbar";
import CreateOrg from "./CreateOrg";
import JoinOrg from "./JoinOrg";
import OrgDashboard from "./OrgDashboard";
import CreateSurvey from "./CreateSurvey";
import SurveyDashboard from "./SurveyDashboard";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hamburger button for toggling sidebar */}
      <button
        onClick={toggleSidebar}
        className="absolute top-2 left-4 z-20 p-2 text-gray-600"
      >
        {isSidebarOpen ? null : <span className="text-2xl">☰</span>}
      </button>

      <SideNavbar isOpen={isSidebarOpen} toggleNavbar={toggleSidebar} />

      <div
        className={`flex-1 p-4 transition-all  duration-300  ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`} // Adjusts margin based on sidebar state
      >
        <h1 className="text-center text-3xl font-extrabold text-2xl font-bold font-serif mt-1 mx-4 mb-4 text-[#3A6D8C]">
          SurveySync
        </h1>

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-org"
            element={
              <ProtectedRoute>
                <CreateOrg />
              </ProtectedRoute>
            }
          />
          <Route
            path="/join-org"
            element={
              <ProtectedRoute>
                <JoinOrg />
              </ProtectedRoute>
            }
          />
          <Route
            path="/org-dashboard"
            element={
              <ProtectedRoute>
                <OrgDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-survey"
            element={
              <ProtectedRoute>
                <CreateSurvey />
              </ProtectedRoute>
            }
          />
          <Route
            path="/survey-dashboard"
            element={
              <ProtectedRoute>
                <SurveyDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Page404 />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
