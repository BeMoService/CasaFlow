// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import UploadProperty from "./pages/UploadProperty";
import PropertyView from "./pages/PropertyView";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import PublicProperty from "./pages/PublicProperty";
import RequireAuth from "./components/RequireAuth";
import DebugStorage from "./pages/DebugStorage";

/* CRM */
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

export default function App() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <main style={{ padding: 16 }}>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<RequireAuth><Navigate to="/dashboard" replace /></RequireAuth>} />

          {/* Existing app pages */}
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/upload"    element={<RequireAuth><UploadProperty /></RequireAuth>} />
          <Route path="/property/:id" element={<RequireAuth><PropertyView /></RequireAuth>} />
          <Route path="/admin"     element={<RequireAuth><Admin /></RequireAuth>} />
          <Route path="/debug"     element={<DebugStorage />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/p/:id"     element={<PublicProperty />} />

          {/* ===== CRM layer (shell + provider) ===== */}
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
