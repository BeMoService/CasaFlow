// src/app/AppShell.jsx
import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import AuthControls from "../components/AuthControls.jsx";
import { useCrm } from "./state/crmStore.js";

export default function AppShell() {
  const { pathname } = useLocation();
  const { counts } = useCrm();

  // Alleen voor mobiel; desktop blijft altijd zichtbaar
  const [leftOpen, setLeftOpen] = React.useState(false);

  const LinkItem = ({ to, label, badge }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        "navlink-underline" + (isActive ? " active" : "")
      }
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
      onClick={() => setLeftOpen(false)}
    >
      <span>{label}</span>
      {typeof badge === "number" ? (
        <span className="badge" style={{ marginLeft: 10 }}>{badge}</span>
      ) : null}
    </NavLink>
  );

  return (
    <div
      className="app2-root"
      style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        gap: 16,
      }}
    >
      {/* Topbar - full width */}
      <div
        className="app2-top"
        style={{
          gridColumn: "1 / -1",
          position: "sticky",
          top: 0,
          zIndex: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          background: "rgba(0,0,0,0.55)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12,
          backdropFilter: "blur(8px)",
          marginBottom: 4,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Alleen op mobile zichtbaar; zie CSS hieronder */}
          <button
            className="btn app2-toggle"
            onClick={() => setLeftOpen((v) => !v)}
            style={{ display: "none", padding: "8px 10px", borderRadius: 10 }}
            aria-label="Toggle navigation"
          >
            ☰
          </button>
          <div style={{ fontWeight: 800 }}>
            CRM
            <span className="muted" style={{ marginLeft: 8, fontWeight: 500 }}>
              / {pathname.replace(/^\/crm\/?/, "") || "overview"}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <AuthControls />
        </div>
      </div>

      {/* Left sidebar */}
      <aside
        className={`app2-left card panel-outline ${leftOpen ? "left-open" : ""}`}
        style={{ padding: 12, alignSelf: "start" }}
      >
        <div
          className="panel-outline"
          style={{ padding: 8, borderRadius: 12, marginBottom: 10 }}
        >
          <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>
            CasaFlow CRM
          </div>
          <div style={{ fontWeight: 700 }}>Navigation</div>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <LinkItem to="/crm" label="Overview" />
          <LinkItem to="/crm/leads" label="Leads" badge={counts?.leads ?? 0} />
          <LinkItem
            to="/crm/contacts"
            label="Contacts"
            badge={counts?.contacts ?? 0}
          />
          <LinkItem to="/crm/deals" label="Deals" badge={counts?.deals ?? 0} />
          <LinkItem to="/crm/inbox" label="Inbox" badge={counts?.inbox ?? 0} />
          <LinkItem to="/crm/tasks" label="Tasks" badge={counts?.tasks ?? 0} />
          <LinkItem to="/crm/automations" label="Automations" />
          <LinkItem to="/crm/templates" label="Templates" />
          <LinkItem to="/crm/settings" label="Settings" />
        </div>
      </aside>

      {/* Main content */}
      <section
        className="card panel-outline"
        style={{ padding: 12, minHeight: 480 }}
      >
        <Outlet />
      </section>
    </div>
  );
}
