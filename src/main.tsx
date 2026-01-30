import { BrowserRouter, Route, Routes } from "react-router";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App.tsx";
import LoginPage from "@/pages/LoginPage.tsx";
import SignUpPage from "@/pages/SignupPage.tsx";
import UserProfilePage from "@/pages/UserProfilePage.tsx";
import HomeResultsPage from "@/pages/HomeResultsPage.tsx";
import IndividualTestPage from "@/pages/IndividualTestPage.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="signup" element={<SignUpPage />} />
      <Route path="/" element={<App />}>
        <Route index element={<HomeResultsPage />} />
        <Route path="user" element={<UserProfilePage />} />
      </Route>
      <Route path="test/:id" element={<IndividualTestPage />} />
    </Routes>
  </BrowserRouter>
);
