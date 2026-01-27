import { BrowserRouter, Route, Routes } from "react-router";
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import LoginPage from "@/pages/LoginPage.tsx";
import SignUpPage from '@/pages/SignupPage.tsx'
import HomePage from "@/pages/HomePage.tsx";
import UserProfilePage from "@/pages/UserProfilePage.tsx";
import ExamDetailPage from "@/pages/ExamDetailPage.tsx";
import TestPage from "@/pages/TestPage.tsx";
import IndividualTestPage from "@/pages/IndividualTestPage.tsx";
import ResultsPage from "@/pages/ResultsPage.tsx";
import { AuthProvider } from "./contexts/AuthContext";


createRoot(document.getElementById("root")!).render(
  <AuthProvider>
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignUpPage />} />
        <Route path="user" element={<UserProfilePage />} />
        <Route path="detail/:examId" element={<ExamDetailPage />} />
        <Route path="test" element={<TestPage />} />
        <Route path="test/:id" element={<IndividualTestPage />} />
        <Route path="results" element={<ResultsPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
  </AuthProvider>
)
