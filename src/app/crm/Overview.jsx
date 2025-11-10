// src/app/crm/Overview.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { useCrm } from "../state/crmStore.js";

export default function Overview() {
  const { counts, kpis } = useCrm(); // optional: { leads, contacts, deals, inbox, tasks } & kpis

  return (
    <div className="glassy" style={{ padding: 18 }}>
      {/* Header */}
      <div className="between" style={{ marginBottom: 14 }}>
        <div>
          <div className="h1">CasaFlow CRM</div>
          <div className="muted">Powered by Nexora</div>
        </div>
        <div className="row">
          <NavLink to="/crm/leads" className="btn">Open Leads</NavLink>
          <NavLink to="/crm/contacts" className="btn">Import Contacts</NavLink>
          <NavLink to="/crm/deals" className="btn btn-primary">New Deal</NavLink>
        </div>
      </div>

      {/* Status strip */}
      <div className="card" style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
        <span className="badge ok">Operational</span>
        <span className="badge">EU-West</span>
        <span className="badge info">Latency ~92ms</span>
        <div className="muted" style={{ marginLeft: "auto", fontSize: "var(--fs-sm)" }}>
          Need help? <a href="#/crm/help">Read docs</a>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
        <KpiCard title="Leads (Open)" value={fmt(counts?.leads)} hint="+4 this week" />
        <KpiCard title="Contacts" value={fmt(counts?.contacts)} hint="Imported" />
        <KpiCard title="Active Deals" value={fmt(counts?.deals)} hint="Pipeline" />
        <KpiCard title="Inbox" value={fmt(counts?.inbox)} hint="Unseen" />
      </div>

      <div style={{ height: 14 }} />

      {/* Quick links */}
      <div className="card">
        <div className="between" style={{ marginBottom: 8 }}>
          <div className="h3">Quick links</div>
          <div className="label">CasaFlow CRM (Powered by Nexora)</div>
        </div>

        <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
          <NavLink to="/crm/leads" className="btn">Create Lead</NavLink>
          <NavLink to="/crm/templates" className="btn">Email Template</NavLink>
          <NavLink to="/crm/automations" className="btn">Automation</NavLink>
          <NavLink to="/crm/settings" className="btn">Team Settings</NavLink>
        </div>
      </div>

      <div style={{ height: 14 }} />

      {/* Recent activity / placeholder table */}
      <div className="card">
        <div className="between" style={{ marginBottom: 10 }}>
          <div className="h3">Recent activity</div>
          <div className="label">Last 24h</div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Title</th>
              <th>Owner</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {/* Skeleton rows as placeholder for now */}
            {[...Array(3)].map((_, i) => (
              <tr key={i}>
                <td><div className="skeleton" style={{ width: 80, height: 14 }} /></td>
                <td><div className="skeleton" style={{ width: 220, height: 14 }} /></td>
                <td><div className="skeleton" style={{ width: 120, height: 14 }} /></td>
                <td><div className="skeleton" style={{ width: 90, height: 14 }} /></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="muted" style={{ marginTop: 10, fontSize: "var(--fs-sm)" }}>
          Data shows once Firestore wiring is connected to activity feed.
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, hint }) {
  return (
    <div className="card">
      <div className="label">{title}</div>
      <div className="h2" style={{ marginTop: 6 }}>{value ?? "—"}</div>
      <div className="muted" style={{ marginTop: 4, fontSize: "var(--fs-sm)" }}>{hint}</div>
    </div>
  );
}

function fmt(n) {
  if (typeof n !== "number") return "—";
  return new Intl.NumberFormat().format(n);
}
