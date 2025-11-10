// src/app/AppShell.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";

export default function AppShell() {
  const loc = useLocation();
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u || null)), []);

  // Breadcrumbs
  const crumbs = useMemo(() => {
    const parts = loc.pathname.replace(/^\/crm\/?/, "").split("/").filter(Boolean);
    const first = "CasaFlow CRM";
    if (parts.length === 0) return [first, "Overview"];
    return [first, parts[0].charAt(0).toUpperCase() + parts[0].slice(1)];
  }, [loc.pathname]);

  const linkClass = ({ isActive }) => `navlink-underline${isActive ? " active" : ""}`;

  return (
    <div className="app2-grid">
      {/* LEFT SIDEBAR */}
      <aside className="app2-left">
        <div className="left-top">
          <div className="row" style={{ gap: 8, alignItems: "center", padding: "8px 12px" }}>
            <span className="badge">CRM</span>
            <span className="badge">Nexora</span>
          </div>

          <div className="brand-mini" style={{ padding: "0 12px" }}>
            <Link to="/dashboard">CasaFlow</Link>
          </div>

          <div className="left-nav">
            <div className="muted" style={{ padding: "12px 14px" }}>Main</div>
            <NavLink to="/crm/overview" className={linkClass}>Overview</NavLink>
            <NavLink to="/crm/leads" className={linkClass}>Leads</NavLink>
            <NavLink to="/crm/contacts" className={linkClass}>Contacts</NavLink>
            <NavLink to="/crm/deals" className={linkClass}>Deals</NavLink>
            <NavLink to="/crm/inbox" className={linkClass}>Inbox</NavLink>
            <NavLink to="/crm/tasks" className={linkClass}>Tasks</NavLink>
            <NavLink to="/crm/automations" className={linkClass}>Automations</NavLink>
            <NavLink to="/crm/templates" className={linkClass}>Templates</NavLink>
            <NavLink to="/crm/settings" className={linkClass}>Settings</NavLink>
          </div>
        </div>

        {/* footer: enkel e-mail (geen extra Logout) */}
        <div className="card panel-outline" style={{ margin: 16, borderRadius: 12, padding: 12 }}>
          <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Signed in</div>
          <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {user?.email || "-"}
          </div>
        </div>
      </aside>

      {/* TOP BAR (géén AuthControls meer hier; Logout zit al in hoofdnav) */}
      <header className="app2-top">
        <div className="row">
          <button className="btn" onClick={() => nav("/dashboard")}>Back to App</button>
          <div className="row" style={{ marginLeft: "auto" }}>
            <button className="btn">New Lead</button>
          </div>
        </div>
      </header>

      {/* RIGHT CONTEXT SIDEBAR */}
      <aside className="app2-right">
        <div className="panel-outline card" style={{ borderRadius: 12 }}>
          <h3 style={{ marginTop: 0 }}>Context</h3>
          <div className="muted">Quick actions & filters</div>
          <div className="row" style={{ marginTop: 8 }}>
            <button className="btn">Filter</button>
            <button className="btn">Export</button>
            <button className="btn">Share</button>
          </div>
          <div className="muted" style={{ marginTop: 16 }}>Status</div>
          <div className="row" style={{ marginTop: 6 }}>
            <span className="badge">Operational</span>
            <span className="badge">EU-West</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="app2-main">
        <div className="breadcrumbs">
          {crumbs.map((c, i) => (
            <span key={i} className={i === crumbs.length - 1 ? "active" : ""}>
              {c}{i < crumbs.length - 1 ? " / " : ""}
            </span>
          ))}
        </div>
        <Outlet />
      </main>
    </div>
  );
}
