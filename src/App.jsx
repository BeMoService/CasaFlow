// src/App.jsx
import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

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

/* ===== CasaFlow visuals (via Vite imports) ===== */
import cfBg from "./assets/casaflow-bg.jpg";
import cfBadge from "./assets/casaflow-badge.png";

function Nav() {
  const loc = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u || null)), []);

  const item = (to, label) => {
    const active = loc.pathname === to || loc.pathname.startsWith(to + "/");
    return (
      <Link
        to={to}
        className={active ? "navlink-underline active" : "navlink-underline"}
        style={{ fontWeight: 600 }}
      >
        {label}
      </Link>
    );
  };

  async function doLogout() {
    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (e) {
      console.error(e);
      alert("Sign out failed.");
    }
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        background: "rgba(0,0,0,0.65)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(8px)",
      }}
    >
      <Link
        to="/dashboard"
        style={{ fontWeight: 800, color: "inherit", textDecoration: "none" }}
      >
        CasaFlow
      </Link>

      <nav style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {item("/dashboard", "Dashboard")}
        {item("/upload", "Upload")}
        {item("/admin", "Admin")}
        {item("/crm", "CRM")}
        {!user ? (
          item("/login", "Login")
        ) : (
          <button
            onClick={doLogout}
            className="btn-logout"
            style={{ padding: "8px 12px", borderRadius: 10, fontWeight: 600 }}
          >
            Logout
          </button>
        )}
      </nav>
    </header>
  );
}

export default function App() {
  // Volledige achtergrond (gradients + image)
  const rootStyle = {
    minHeight: "100vh",
    color: "#fff",
    background: `
      url(${cfBg}) center/cover no-repeat fixed,
      radial-gradient(1200px 800px at 85% -10%, rgba(248,113,113,0.28), transparent 60%),
      radial-gradient(900px 700px at -10% 100%, rgba(127,29,29,0.40), transparent 60%),
      #02040a
    `,
  };

  // Helper: zelfde pattern als "Overview werkte", maar nu met shell eromheen
  const withCrmShell = (node) => (
    <RequireAuth>
      <CrmProvider>
        <AppShell>{node}</AppShell>
      </CrmProvider>
    </RequireAuth>
  );

  return (
    <div className="cf-root" style={rootStyle}>
      <Nav />

      <main className="cf-main" style={{ padding: 16 }}>
        <Routes>
          <Route
            path="/"
            element={
              <RequireAuth>
                <Navigate to="/dashboard" replace />
              </RequireAuth>
            }
          />

          {/* hoofdapp */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/upload"
            element={
              <RequireAuth>
                <UploadProperty />
              </RequireAuth>
            }
          />
          <Route
            path="/property/:id"
            element={
              <RequireAuth>
                <PropertyView />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <Admin />
              </RequireAuth>
            }
          />

          {/* public */}
          <Route path="/p/:id" element={<PublicProperty />} />
          <Route path="/login" element={<Login />} />

          {/* CRM-routes — zelfde auth-pattern als Overview, maar met AppShell */}
          <Route path="/crm" element={withCrmShell(<CrmOverview />)} />
          <Route path="/crm/leads" element={withCrmShell(<CrmLeads />)} />
          <Route
            path="/crm/contacts"
            element={withCrmShell(<CrmContacts />)}
          />
          <Route path="/crm/deals" element={withCrmShell(<CrmDeals />)} />
          <Route path="/crm/inbox" element={withCrmShell(<CrmInbox />)} />
          <Route path="/crm/tasks" element={withCrmShell(<CrmTasks />)} />
          <Route
            path="/crm/automations"
            element={withCrmShell(<CrmAutomations />)}
          />
          <Route
            path="/crm/templates"
            element={withCrmShell(<CrmTemplates />)}
          />
          <Route
            path="/crm/settings"
            element={withCrmShell(<CrmSettings />)}
          />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      {/* Badge rechtsonder */}
      <div className="cf-badge">
        <img
          src={cfBadge}
          alt="CasaFlow badge"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            borderRadius: 18,
            display: "block",
          }}
        />
      </div>
    </div>
  );
}
