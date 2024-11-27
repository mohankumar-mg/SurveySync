import React, { createContext, useContext, useState, useEffect } from "react";

const GlobalContext = createContext();

export function GlobalProvider({ children }) {
  const [orgSelected, setOrgSelected] = useState(
    localStorage.getItem("orgSelected") || null
  );

  const [surveySelected, setSurveySelected] = useState(
    localStorage.getItem("surveySelected") || null
  );

  useEffect(() => {
    localStorage.setItem("surveySelected", surveySelected);
  }, [surveySelected]);

  useEffect(() => {
    // Store the selected organization in localStorage whenever it changes
    localStorage.setItem("orgSelected", orgSelected);
  }, [orgSelected]);

  return (
    <GlobalContext.Provider value={{ orgSelected, setOrgSelected, surveySelected, setSurveySelected }}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobalContext() {
  return useContext(GlobalContext);
}
