// src/app/AppShell.jsx
import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import AuthControls from "../components/AuthControls.jsx";
import { useCrm } from "./state/crmStore.js"; // <-- .js

export default function AppShell() {
  const { pathname } = useLocation();
  const inCRM = pathname.startsWith("/crm"); // <-- geen /app/crm meer

  const [crmCollapsed, setCrmCollapsed] = useState(false);
  const [mobileCrmOpen, setMobileCrmOpen] = useState(false);
  const role = useMemo(() => (localStorage.getItem("role") || "owner").toLowerCase(), []);

  useEffect(() => { const v = localStorage.getItem("crmCollapsed"); if (v === "1") setCrmCollapsed(true); }, []);
  const toggleCrmCollapsed = () => { const n = !crmCollapsed; setCrmCollapsed(n); localStorage.setItem("crmCollapsed", n ? "1" : "0"); };
  useEffect(() => { setMobileCrmOpen(false); }, [pathname]);

  const { state } = useCrm();
  const { counts } = state;

  return (
    <div className={`l2-shell ${inCRM ? "has-secondary" : ""} ${crmCollapsed && inCRM ? "crm-collapsed" : ""}`}>
      {/* Primary sidebar */}
      <aside className="l2-sidebar">
        <nav className="l2-nav">
          <NavLink to="/crm"          className={({isActive}) => `l2-navlink ${pathname.startsWith("/crm") ? "active" : ""}`}>CRM</NavLink>
          <NavLink to="/dashboard"    className={({isActive}) => `l2-navlink ${isActive ? "active" : ""}`}>Dashboard</NavLink>
          <NavLink to="/upload"       className={({isActive}) => `l2-navlink ${isActive ? "active" : ""}`}>Upload</NavLink>
          <NavLink to="/admin"        className={({isActive}) => `l2-navlink ${isActive ? "active" : ""}`}>Admin</NavLink>
        </nav>
      </aside>

      {/* CRM sub-rail */}
      {inCRM && (
        <>
          <aside className={`l3-sidebar ${crmCollapsed ? "is-collapsed" : ""}`}>
            <div className="l3-top">
              <button className="crm-toggle" onClick={toggleCrmCollapsed} title={crmCollapsed ? "Expand" : "Collapse"}>
                {crmCollapsed ? "⟩" : "⟨"}
              </button>
            </div>
            <nav className="l3-nav">
              <NavLink end to="/crm"               className={({isActive}) => `l2-navlink ${isActive ? "active" : ""}`}><span className="t">Overview</span></NavLink>
              <NavLink to="/crm/leads"             className={({isActive}) => `l2-navlink ${isActive ? "active" : ""}`}><span className="t">Leads</span><span className="badge count">{counts.leads ?? 0}</span></NavLink>
              <NavLink to="/crm/contacts"          className={({isActive}) => `l2-navlink ${isActive ? "active" : ""}`}><span className="t">Contacts</span><span className="badge count">{counts.contacts ?? 0}</span></NavLink>
              <NavLink to="/crm/deals"             className={({isActive}) => `l2-navlink ${isActive ? "active" : ""}`}><span className="t">Deals</span></NavLink>
              <NavLink to="/crm/inbox"             className={({isActive}) => `l2-navlink ${isActive ? "active" : ""}`}><span className="t">Inbox</span><span className="badge count">{counts.inbox ?? 0}</span></NavLink>
              <NavLink to="/crm/tasks"             className={({isActive}) => `l2-navlink ${isActive ? "active" : ""}`}><span className="t">Tasks</span><span className="badge count">{counts.tasks ?? 0}</span></NavLink>
              {role === "owner" && <NavLink to="/crm/automations" className={({isActive}) => `l2-navlink ${isActive ? "active" : ""}`}><span className="t">Automations</span></NavLink>}
              <NavLink to="/crm/templates"         className={({isActive}) => `l2-navlink ${isActive ? "active" : ""}`}><span className="t">Templates</span></NavLink>
              <NavLink to="/crm/settings"          className={({isActive}) => `l2-navlink ${isActive ? "active" : ""}`}><span className="t">Settings</span></NavLink>
            </nav>
          </aside>

          {/* Mobile drawer trigger */}
          <button className="l3-mobile-toggle" onClick={() => setMobileCrmOpen(true)} aria-label="Open CRM menu">CRM ▸</button>
          {mobileCrmOpen && (
            <div className="l3-drawer">
              <div className="drawer-head">
                <span>CRM</span>
                <button onClick={() => setMobileCrmOpen(false)} aria-label="Close">✕</button>
              </div>
              <div className="drawer-nav">
                {[
                  ["/crm","Overview"],
                  ["/crm/leads",`Leads (${counts.leads ?? 0})`],
                  ["/crm/contacts",`Contacts (${counts.contacts ?? 0})`],
                  ["/crm/deals","Deals"],
                  ["/crm/inbox",`Inbox (${counts.inbox ?? 0})`],
                  ["/crm/tasks",`Tasks (${counts.tasks ?? 0})`],
                  ["/crm/automations","Automations"],
                  ["/crm/templates","Templates"],
                  ["/crm/settings","Settings"],
                ].map(([to,label]) => (
                  <NavLink key={to} to={to} onClick={()=>setMobileCrmOpen(false)} className="drawer-link">{label}</NavLink>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Content */}
      <section className="l2-content">
        <div className="app-topbar">
          <div className="app-topbar-left">
            <span className="top-kv"><b>Engine:</b> <span className="dim">Offline</span></span>
            <span className="top-kv"><b>Queue:</b> <span className="dim">0</span></span>
            <span className="top-kv"><b>Credits:</b> <span className="dim">0</span></span>
          </div>
          <div className="app-topbar-right">
            <span className="status-chip">Demo mode • Engine Offline</span>
            <AuthControls />
          </div>
        </div>

        {inCRM && <div className="crm-breadcrumb-wrap"><CrmBreadcrumbs pathname={pathname} /></div>}
        <Outlet />
      </section>

      {/* styles (onze bestaande inline CSS laten we staan) */}
      <style>{`
        .l2-shell{ display:grid; grid-template-columns:220px 1fr; min-height:100vh; }
        .l2-shell.has-secondary{ grid-template-columns:220px 220px 1fr; }
        .l2-sidebar{ padding:16px; border-right:1px solid rgba(255,255,255,0.12); }
        .l3-sidebar{ padding:16px; border-right:1px solid rgba(255,255,255,0.12); }
        .l2-nav, .l3-nav{ display:grid; gap:8px; position:sticky; top:16px; }
        .l3-top{ display:flex; justify-content:flex-end; margin-bottom:8px; }
        .crm-toggle{ height:28px; width:28px; border-radius:8px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); }
        .l3-sidebar.is-collapsed{ width:64px; overflow:hidden; }
        .l3-sidebar.is-collapsed .l2-navlink{ display:flex; justify-content:center; }
        .l3-sidebar.is-collapsed .l2-navlink .t{ display:none; }
        .l3-sidebar .count{ margin-left:auto; }

        .l2-content{ min-width:0; }
        .app-topbar{ position: sticky; top:0; z-index: 5; display:flex; align-items:center; justify-content:space-between; padding:10px 12px; margin:0 -8px 8px; background: rgba(0,0,0,0.6); backdrop-filter: blur(6px); border-bottom:1px solid rgba(255,255,255,0.10); }
        .top-kv{ margin-right:14px; font-size:13px; }
        .dim{ opacity:.8; }
        .status-chip{ display:inline-flex; align-items:center; height:28px; padding:0 10px; border-radius:999px; border:1px solid rgba(255,255,255,0.18); background:rgba(255,255,255,0.06); margin-right:8px; font-size:12px; }

        .crm-breadcrumb-wrap{ position: sticky; top: 38px; z-index: 4; padding: 6px 10px; margin: 0 -8px 6px; background: rgba(0,0,0,0.55); backdrop-filter: blur(6px); border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 12px; color: rgba(255,255,255,0.85); }
        .crm-breadcrumb-wrap b{ color:#fff; }

        .l3-mobile-toggle{ display:none; position:fixed; bottom:16px; left:16px; z-index:6; height:36px; padding:0 12px; border-radius:999px; border:1px solid rgba(255,255,255,0.18); background:rgba(0,0,0,0.55); }
        .l3-drawer{ position:fixed; inset:0; background:rgba(0,0,0,.55); backdrop-filter:blur(4px); z-index: 7; display:flex; justify-content:flex-start; }
        .l3-drawer .drawer-head{ display:flex; align-items:center; justify-content:space-between; padding:12px; background:rgba(18,18,18,.92); border-bottom:1px solid rgba(255,255,255,.12); }
        .l3-drawer .drawer-nav{ width:78%; max-width:320px; background:rgba(18,18,18,.92); padding:12px; overflow:auto; }
        .drawer-link{ display:block; padding:10px 12px; border:1px solid rgba(255,255,255,.12); border-radius:10px; margin-bottom:8px; text-decoration:none; }

        @media (max-width:1100px){
          .l2-shell{ grid-template-columns:1fr; }
          .l2-shell.has-secondary{ grid-template-columns:1fr; }
          .l2-sidebar, .l3-sidebar{ border-right:none; border-bottom:1px solid rgba(255,255,255,0.12); }
          .l2-nav, .l3-nav{ grid-auto-flow:column; overflow:auto; gap:6px; }
          .l3-mobile-toggle{ display:inline-flex; }
        }
      `}</style>
    </div>
  );
}

function CrmBreadcrumbs({ pathname }) {
  const parts = pathname.split("/").filter(Boolean);
  const leaf = parts[parts.length - 1];
  const leafName = leaf === "crm" ? "Overview" : leaf.charAt(0).toUpperCase() + leaf.slice(1);
  return (
    <div>
      <span style={{opacity:.8}}>Dashboard</span> <span>›</span> <span style={{opacity:.95}}>CRM</span> <span>›</span> <b>{leafName}</b>
    </div>
  );
}
