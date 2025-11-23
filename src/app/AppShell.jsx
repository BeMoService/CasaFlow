// src/app/AppShell.jsx
import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useCrm } from "./state/crmStore.js";

export default function AppShell() {
  const { pathname } = useLocation();
  const { counts } = useCrm();

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
    >
      <span>{label}</span>
      {typeof badge === "number" ? (
        <span className="badge" style={{ marginLeft: 10 }}>
          {badge}
        </span>
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
        alignItems: "flex-start",
        padding: "16px 8px 24px",
      }}
    >
      {/* CRM sub-topbar (alleen label + breadcrumb, géén extra logout) */}
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
        <div style={{ fontWeight: 800 }}>
          CRM
          <span className="muted" style={{ marginLeft: 8, fontWeight: 500 }}>
            / {pathname.replace(/^\/crm\/?/, "") || "overview"}
          </span>
        </div>

        {/* Rechts gewoon een subtiele label, geen tweede Logout */}
        <div className="muted" style={{ fontSize: 13 }}>
          CasaFlow CRM workspace
        </div>
      </div>

      {/* Sidebar links met rode outline, verder transparant */}
      <aside
        className="panel-outline"
        style={{
          padding: 12,
          borderRadius: 16,
          alignSelf: "start",
          background: "rgba(0,0,0,0.72)",
        }}
      >
        <div
          style={{
            padding: 8,
            borderRadius: 12,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              fontSize: 12,
              opacity: 0.85,
              marginBottom: 6,
            }}
          >
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
          <LinkItem
            to="/crm/deals"
            label="Deals"
            badge={counts?.deals ?? 0}
          />
          <LinkItem
            to="/crm/inbox"
            label="Inbox"
            badge={counts?.inbox ?? 0}
          />
          <LinkItem
            to="/crm/tasks"
            label="Tasks"
            badge={counts?.tasks ?? 0}
          />
          <LinkItem to="/crm/automations" label="Automations" />
          <LinkItem to="/crm/templates" label="Templates" />
          <LinkItem to="/crm/settings" label="Settings" />
        </div>
      </aside>

      {/* Main: de pagina zelf regelt de kaarten; hier geen extra card-wrapper */}
      <section style={{ minHeight: 480 }}>
        <Outlet />
      </section>
    </div>
  );
}
