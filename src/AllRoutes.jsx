import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./Pages/Home/Home";
import Auth from "./Pages/Auth/Auth";
import Questions from "./Pages/Questions/Questions";
import AskQuestion from "./Pages/AskQuestion/AskQuestion";
import DisplayQuestion from "./Pages/Questions/DisplayQuestion";
import Tags from "./Pages/Tags/Tags";
import Users from "./Pages/Users/Users";
import UserProfile from "./Pages/UserProfile/UserProfile";
import VoipWrapper from "./Pages/voip/VoipWrapper";
import Voip from "./Pages/voip/Voip";
import PlanWrapper from "./Pages/Plans/PlanWrapper";

const AllRoutes = ({ isMobile, handleisMobile }) => {
  return (
    <Routes>
      <Route
        path="/"
        element={<Home isMobile={isMobile} handleisMobile={handleisMobile} />}
      />
      <Route path="/Auth" element={<Auth handleisMobile={handleisMobile} isMobile={isMobile} />} />
      <Route path="/AskQuestion" element={<AskQuestion />} />
      <Route
        path="/Questions"
        element={<Questions isMobile={isMobile} handleisMobile={handleisMobile} />}
      />
      <Route
        path="/Questions/:id"
        element={
          <DisplayQuestion isMobile={isMobile} handleisMobile={handleisMobile} />
        }
      />
      <Route
        path="/Tags"
        element={<Tags isMobile={isMobile} handleisMobile={handleisMobile} />}
      />
      <Route
        path="/Users"
        element={<Users isMobile={isMobile} handleisMobile={handleisMobile} />}
      />
      <Route
        path="/Users/:id"
        element={
          <UserProfile isMobile={isMobile} handleisMobile={handleisMobile} />
        }
      />
      <Route
        path="/call"
        element={
          <VoipWrapper handleisMobile={handleisMobile} isMobile={isMobile} />
        }
      />
      <Route path="/incoming/:callId/:callType/:callToken/:reciverFuid?/:reciverName?" element={<Voip/>} />
      <Route
        path="/plan"
        element={
          <PlanWrapper handleisMobile={handleisMobile} isMobile={isMobile} />
        }
      />
    </Routes>
  );
};

export default AllRoutes;
