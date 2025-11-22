// src/app/AppShell.jsx
import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import AuthControls from "../components/AuthControls.jsx";
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
      {/* Topbar */}
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
        <div
          className="app2-auth"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <AuthControls />
        </div>
      </div>

      {/* Sidebar — enkel rode outline, geen extra card-layer */}
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

      {/* Main — geen card/panel-outline wrapper meer, alleen page-cards zelf */}
      <section style={{ minHeight: 480 }}>
        <Outlet />
      </section>

      {/* Scoped styling: rode glow-logout in CRM topbar */}
      <style>{`
        .app2-top button {
          border-radius: 999px;
          padding: 8px 16px;
          border: 1px solid rgba(248,113,113,0.75);
          background:
            radial-gradient(circle at 0% 0%, rgba(248,113,113,0.55), transparent 55%),
            rgba(15,15,18,0.96);
          box-shadow:
            0 0 18px rgba(248,113,113,0.45),
            0 10px 30px rgba(0,0,0,0.85);
          color: #fee2e2;
          font-weight: 600;
          transition: background .18s ease, border-color .18s ease, transform .08s ease;
        }

        .app2-top button:hover {
          border-color: rgba(248,113,113,0.95);
          background:
            radial-gradient(circle at 0% 0%, rgba(248,113,113,0.75), transparent 60%),
            rgba(24,7,7,1);
          transform: translateY(-1px);
        }

        .app2-top button:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
