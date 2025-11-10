// src/app/AppShell.jsx
import React, { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import AuthControls from "../components/AuthControls.jsx";
import { useAuth } from "../AuthProvider.jsx";
import { useCrm } from "../state/crmStore.js";

/**
 * CRM App Shell
 * - Primair: left sidebar (main nav + counts)
 * - Secondary: right context panel (optional)
 * - Topbar: breadcrumbs/title/actions
 * - Mobile: collapsible drawer for primary nav
 *
 * NOTE: Only styling updated to use index.css tokens/utilities.
 *       All logic/structure preserved.
 */

export default function AppShell() {
  const { user } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const { counts } = useCrm(); // { leads, contacts, deals, inbox, tasks } (mock-ready)

  // simple breadcrumb from pathname
  const crumbs = useMemo(() => {
    const parts = loc.pathname.replace(/^\/+/, "").split("/");
    const acc = [];
    let path = "";
    for (const p of parts) {
      path += `/${p}`;
      acc.push({ label: toTitle(p), path });
    }
    return acc;
  }, [loc.pathname]);

  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 50,
          }}
        />
      )}

      {/* Primary Sidebar */}
      <aside
        className="sidebar"
        style={{
          height: "100%",
          position: "relative",
          zIndex: 55,
          display: mobileOpen ? "block" : undefined,
        }}
      >
        <div className="section" style={{ paddingTop: 18, paddingBottom: 10 }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div className="row" style={{ gap: 10 }}>
              <div
                className="badge info"
                title="CasaFlow CRM"
                style={{ fontWeight: 600 }}
              >
                CRM
              </div>
              <div className="badge" title="Powered by Nexora">
                <span style={{ width: 8, height: 8, borderRadius: 99, background: "var(--primary)" }} />
                Nexora
              </div>
            </div>
            <button
              className="btn btn-ghost"
              onClick={() => setMobileOpen(false)}
              style={{ display: "none" }}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
        </div>

        <nav className="section" aria-label="Main">
          <div className="heading">Main</div>

          <NavItem to="/crm/overview" label="Overview" />
          <NavItem to="/crm/leads" label="Leads" count={counts?.leads} />
          <NavItem to="/crm/contacts" label="Contacts" count={counts?.contacts} />
          <NavItem to="/crm/deals" label="Deals" count={counts?.deals} />
          <NavItem to="/crm/inbox" label="Inbox" count={counts?.inbox} />
          <NavItem to="/crm/tasks" label="Tasks" count={counts?.tasks} />
          <NavItem to="/crm/automations" label="Automations" />
          <NavItem to="/crm/templates" label="Templates" />
          <NavItem to="/crm/settings" label="Settings" />
        </nav>

        <div className="section" style={{ marginTop: "auto" }}>
          <div className="card" style={{ padding: 12 }}>
            <div className="label">Signed in</div>
            <div style={{ fontSize: "var(--fs-sm)" }}>
              {user?.email ?? "—"}
            </div>
            <div style={{ marginTop: 10 }}>
              <AuthControls compact />
            </div>
          </div>
          <div style={{ height: 12 }} />
        </div>
      </aside>

      {/* Main content + secondary */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
        {/* Topbar */}
        <div className="topbar">
          <div className="between">
            <div className="row">
              <button
                className="btn btn-ghost"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle menu"
                style={{ display: "none" }}
              >
                ☰
              </button>

              <div className="breadcrumbs">
                <NavLink to="/crm/overview" className="navlink-underline">
                  CasaFlow CRM
                </NavLink>
                {crumbs.slice(1).map((c, i) => (
                  <React.Fragment key={c.path}>
                    <span className="sep">/</span>
                    <NavLink to={c.path} className="navlink-underline">
                      {c.label}
                    </NavLink>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="row">
              <NavLink to="/dashboard" className="btn">
                Back to App
              </NavLink>
              <button className="btn btn-primary" onClick={() => nav("/crm/leads")}>
                New Lead
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="content-wrap">
          <Outlet />
        </main>
      </div>

      {/* Secondary/context sidebar (kept minimal; can host filters, details, etc.) */}
      <aside className="sidebar-2">
        <div className="h3" style={{ marginBottom: 8 }}>Context</div>
        <div className="muted" style={{ marginBottom: 12 }}>
          Quick actions & filters
        </div>
        <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
          <button className="btn">Filter</button>
          <button className="btn">Export</button>
          <button className="btn">Share</button>
        </div>
        <div style={{ height: 16 }} />
        <div className="card">
          <div className="label">Status</div>
          <div style={{ marginTop: 8 }} className="row">
            <span className="badge ok">Operational</span>
            <span className="badge">EU-West</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

function NavItem({ to, label, count }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        "item" + (isActive ? " active" : "")
      }
    >
      <span>{label}</span>
      {typeof count === "number" ? (
        <span className="badge">{count}</span>
      ) : null}
    </NavLink>
  );
}

function toTitle(s) {
  return s
    .replace(/^\//, "")
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}
