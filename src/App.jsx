import { useState } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Families from "./pages/Families";
import Reports from "./pages/Reports";
import Access from "./pages/Access";
import Enrollment from "./pages/Enrollment";
import Enrollments from "./pages/Enrollments";
import { getAccount, registerAccount, signInAccount } from "./services/api";

export default function App() {
  const [account, setAccount] = useState(getAccount);

  const authenticate = ({ mode, name, email }) => {
    const authenticatedAccount = mode === "register" ? registerAccount({ name, email }) : signInAccount(email);
    if (!authenticatedAccount) return "No local account found for this email. Create one first.";
    setAccount(authenticatedAccount);
    return "";
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/enroll/:linkId" element={<Enrollment />} />
        <Route path="/access" element={account ? <Navigate to="/" replace /> : <Access onAuthenticate={authenticate} />} />
        <Route element={account ? <MainLayout /> : <Navigate to="/access" replace />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/families" element={<Families />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/enrollments" element={<Enrollments />} />
        </Route>
        <Route path="*" element={<Navigate to={account ? "/" : "/access"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}