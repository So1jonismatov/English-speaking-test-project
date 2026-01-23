import { BrowserRouter, Route, Routes } from "react-router";
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import LoginPage from "@/pages/LoginPage.tsx";
import SignUpPage from '@/pages/SignupPage.tsx'
import HomePage from "@/pages/HomePage.tsx";
import UserProfilePage from "@/pages/UserProfilePage.tsx";
import ExamDetailPage from "@/pages/ExamDetailPage.tsx";


createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignUpPage />} />
        <Route path="user" element={<UserProfilePage />} />
        <Route path="detail/:examId" element={<ExamDetailPage />} /> 
      </Route>
    </Routes>
  </BrowserRouter>
)
