// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import UploadProperty from "./pages/UploadProperty";
import PropertyView from "./pages/PropertyView";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import PublicProperty from "./pages/PublicProperty";
import RequireAuth from "./components/RequireAuth";

import { auth } from "./firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";

/* ===== CRM layer ===== */
import AppShell from "./app/AppShell.jsx";
import { CrmProvider } from "./app/state/crmStore.js";
import CrmOverview from "./app/crm/Overview.jsx";
import CrmLeads from "./app/crm/Leads.jsx";
import CrmContacts from "./app/crm/Contacts.jsx";
import CrmDeals from "./app/crm/Deals.jsx";
import CrmInbox from "./app/crm/Inbox.jsx";
import CrmTasks from "./app/crm/Tasks.jsx";
import CrmAutomations from "./app/crm/Automations.jsx";
import CrmTemplates from "./app/crm/Templates.jsx";
import CrmSettings from "./app/crm/Settings.jsx";

function Nav() {
  const loc = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u || null)), []);

  const item = (to, label) => {
    const active = loc.pathname.startsWith(to);
    return (
      <Link
        to={to}
        style={{
          padding: "8px 12px",
          borderRadius: 10,
          fontWeight: 600,
          textDecoration: "none",
          opacity: active ? 1 : 0.9,
          border: active ? "1px solid rgba(255,255,255,0.14)" : "1px solid transparent",
        }}
      >
        {label}
      </Link>
    );
  };

  async function doLogout() {
    try { await signOut(auth); navigate("/login", { replace: true }); }
    catch (e) { console.error(e); alert("Sign out failed."); }
  }

  return (
    <header style={{
      position:"sticky", top:0, zIndex:10, display:"flex", justifyContent:"space-between",
      alignItems:"center", gap:12, padding:"12px 16px", background:"rgba(0,0,0,0.65)",
      borderBottom:"1px solid rgba(255,255,255,0.08)", backdropFilter:"blur(8px)"
    }}>
      <Link to="/dashboard" style={{ fontWeight: 800, color: "inherit", textDecoration: "none" }}>
        CasaFlow
      </Link>

      <nav style={{ display:"flex", gap:8, alignItems:"center" }}>
        {item("/dashboard", "Dashboard")}
        {item("/upload", "Upload")}
        {item("/admin", "Admin")}
        {item("/crm", "CRM")}       {/* ✅ CRM link zichtbaar */}
        {!user ? item("/login", "Login") : (
          <button onClick={doLogout} className="button-secondary"
                  style={{ padding:"8px 12px", borderRadius:10, fontWeight:600 }}>
            Logout
          </button>
        )}
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <Nav />
      <main style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<RequireAuth><Navigate to="/dashboard" replace /></RequireAuth>} />
          {/* hoofdapp */}
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/upload" element={<RequireAuth><UploadProperty /></RequireAuth>} />
          <Route path="/property/:id" element={<RequireAuth><PropertyView /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />
          {/* public */}
          <Route path="/p/:id" element={<PublicProperty />} />
          <Route path="/login" element={<Login />} />

          {/* ===== CRM shell + subroutes ===== */}
          <Route
            path="/crm/*"
            element={
              <RequireAuth>
                <CrmProvider>
                  <AppShell />
                </CrmProvider>
              </RequireAuth>
            }
          >
            <Route index element={<CrmOverview />} />
            <Route path="leads" element={<CrmLeads />} />
            <Route path="contacts" element={<CrmContacts />} />
            <Route path="deals" element={<CrmDeals />} />
            <Route path="inbox" element={<CrmInbox />} />
            <Route path="tasks" element={<CrmTasks />} />
            <Route path="automations" element={<CrmAutomations />} />
            <Route path="templates" element={<CrmTemplates />} />
            <Route path="settings" element={<CrmSettings />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}
