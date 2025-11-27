// src/app/AppShell.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { useCrm } from "./state/crmStore.js";

export default function AppShell({ children }) {
  const { counts } = useCrm();

  const items = [
    { to: "/crm", label: "Overview" },
    { to: "/crm/leads", label: "Leads", badge: counts.leads },
    { to: "/crm/contacts", label: "Contacts", badge: counts.contacts },
    { to: "/crm/deals", label: "Deals", badge: counts.deals },
    { to: "/crm/inbox", label: "Inbox", badge: counts.inbox },
    { to: "/crm/tasks", label: "Tasks", badge: counts.tasks },
    { to: "/crm/automations", label: "Automations" },
    { to: "/crm/templates", label: "Templates" },
    { to: "/crm/settings", label: "Settings" },
  ];

  return (
    <>
      {/* Alleen layout/CSS, geen extra logica */}
      <style>{`
        .cf-crm-shell {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: flex-start;
          gap: 24px;
        }

        .cf-crm-aside {
          width: 260px;
          flex-shrink: 0;
          border-radius: 18px;
          padding: 18px 14px;
          background: radial-gradient(circle at 0 0, rgba(15,23,42,0.9), rgba(15,15,18,0.96));
          box-shadow: 0 18px 40px rgba(0,0,0,0.8);
          border: 1px solid rgba(248,113,113,0.25);
          color: #e5e7eb;
        }

        .cf-crm-brand {
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .cf-crm-sub {
          font-size: 12px;
          opacity: 0.7;
          margin-bottom: 18px;
        }

        .cf-crm-nav-section-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          opacity: 0.65;
          margin-bottom: 6px;
        }

        .cf-crm-nav-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .cf-crm-nav-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border-radius: 12px;
          font-size: 14px;
          cursor: pointer;
          border: 1px solid rgba(148,163,184,0.35);
          background: radial-gradient(circle at 0 0, rgba(15,23,42,0.75), rgba(15,15,18,0.96));
          transition: border-color 0.15s ease, background 0.15s ease, transform 0.05s ease;
          text-decoration: none;
          color: inherit;
        }

        .cf-crm-nav-item span.cf-crm-label {
          font-weight: 500;
        }

        .cf-crm-nav-item .cf-crm-badge {
          min-width: 24px;
          padding: 3px 7px;
          border-radius: 999px;
          font-size: 11px;
          text-align: center;
          background: rgba(15,23,42,0.9);
          border: 1px solid rgba(148,163,184,0.8);
        }

        .cf-crm-nav-item:hover {
          border-color: rgba(248,113,113,0.75);
          background: radial-gradient(circle at 0 0, rgba(248,113,113,0.15), rgba(15,15,18,0.96));
          transform: translateY(-1px);
        }

        .cf-crm-nav-item-active {
          border-color: rgba(248,113,113,0.95);
          background: radial-gradient(circle at 0 0, rgba(248,113,113,0.22), rgba(15,15,18,0.98));
        }

        .cf-crm-main {
          flex: 1;
          min-width: 0;
        }

        /* Mobile: sidebar boven, content eronder, geen horizontale swipe */
        @media (max-width: 900px) {
          .cf-crm-shell {
            flex-direction: column;
            padding-bottom: 40px;
          }

          .cf-crm-aside {
            width: 100%;
          }
        }
      `}</style>

      <div className="cf-crm-shell">
        <aside className="cf-crm-aside">
          <div className="cf-crm-brand">CasaFlow CRM</div>
          <div className="cf-crm-sub">Powered by Nexora</div>

          <div className="cf-crm-nav-section-label">Navigation</div>
          <div className="cf-crm-nav-list">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  "cf-crm-nav-item" +
                  (isActive ? " cf-crm-nav-item-active" : "")
                }
              >
                <span className="cf-crm-label">{item.label}</span>
                {typeof item.badge === "number" && (
                  <span className="cf-crm-badge">{item.badge}</span>
                )}
              </NavLink>
            ))}
          </div>
        </aside>

        <section className="cf-crm-main">{children}</section>
      </div>
    </>
  );
}
