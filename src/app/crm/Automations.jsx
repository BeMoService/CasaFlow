// src/app/crm/Automations.jsx
import React, { useMemo, useState } from "react";

/**
 * CasaFlow CRM — Automations (UI-only demo)
 * Deze pagina gebruikt voor nu lokale state (geen store),
 * zodat de demo meteen "klopt" zonder backend.
 * Later kunnen we dit mappen naar Firestore of crmStore.
 */
export default function Automations() {
  const [rules, setRules] = useState([
    { id: "A-6001", name: "Lead → Auto-reply (NL/IT)", when: "Lead created", then: "Send email template", status: "Active" },
  ]);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q.trim()) return rules;
    const s = q.trim().toLowerCase();
    return rules.filter(r =>
      r.name.toLowerCase().includes(s) || r.when.toLowerCase().includes(s) || r.then.toLowerCase().includes(s)
    );
  }, [rules, q]);

  function createRule(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const next = {
      id: "A-" + Math.floor(Math.random() * 9000 + 1000),
      name: f.get("name") || "Untitled",
      when: f.get("when") || "Lead created",
      then: f.get("then") || "Send email",
      status: f.get("status") || "Active",
    };
    setRules(prev => [next, ...prev]);
    setCreating(false);
  }

  function updateRule(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const patch = {
      name: f.get("name"),
      when: f.get("when"),
      then: f.get("then"),
      status: f.get("status"),
    };
    setRules(prev => prev.map(r => (r.id === editing ? { ...r, ...patch } : r)));
    setEditing(null);
  }

  function removeRule(id) {
    if (!confirm("Delete this automation?")) return;
    setRules(prev => prev.filter(r => r.id !== id));
  }

  return (
    <div className="card glass" style={{ padding: 16, borderRadius: 12 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Automations</h1>
          <div style={{ opacity: .75, fontSize: 14 }}>UI-only demo — connect later to Firestore / Functions</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            value={q}
            onChange={e=>setQ(e.target.value)}
            placeholder="Search…"
            style={inp}
          />
          <button className="btn" onClick={() => setCreating(true)}>New rule</button>
        </div>
      </header>

      {filtered.length === 0 ? (
        <Empty onCreate={() => setCreating(true)} />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left" }}>
                <th style={th}>Name</th>
                <th style={th}>When</th>
                <th style={th}>Then</th>
                <th style={th}>Status</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} style={{ borderTop: "1px solid rgba(255,255,255,.08)" }}>
                  <td style={td}>{r.name}</td>
                  <td style={td}>{r.when}</td>
                  <td style={td}>{r.then}</td>
                  <td style={td}><StatusChip value={r.status} /></td>
                  <td style={td}>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button className="btn" onClick={() => setEditing(r.id)}>Edit</button>
                      <button className="btn" onClick={() => removeRule(r.id)} style={{ borderColor: "rgba(255,80,80,.4)" }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creating && <RuleModal title="New Automation" onClose={()=>setCreating(false)} onSubmit={createRule} />}
      {editing && (
        <RuleModal
          title="Edit Automation"
          onClose={()=>setEditing(null)}
          onSubmit={updateRule}
          defaults={rules.find(r => r.id === editing)}
        />
      )}
    </div>
  );
}

function StatusChip({ value }) {
  const dim = { opacity: .9, padding: "2px 8px", borderRadius: 999, border: "1px solid rgba(255,255,255,.18)" };
  return <span style={dim}>{value}</span>;
}

function Empty({ onCreate }) {
  return (
    <div className="empty" style={{ textAlign: "center", padding: 32 }}>
      <h3 style={{ margin: 0 }}>No automations yet</h3>
      <p style={{ opacity: .8 }}>Create your first rule to automate routine tasks.</p>
      <button className="btn" onClick={onCreate} style={{ marginTop: 8 }}>New rule</button>
    </div>
  );
}

function RuleModal({ title, onClose, onSubmit, defaults }) {
  return (
    <div style={modalWrap}>
      <form style={modalCard} onSubmit={onSubmit}>
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        <label style={lab}>Name<input name="name" defaultValue={defaults?.name} required style={inp} /></label>
        <label style={lab}>When<input name="when" defaultValue={defaults?.when || "Lead created"} style={inp} /></label>
        <label style={lab}>Then<input name="then" defaultValue={defaults?.then || "Send email"} style={inp} /></label>
        <label style={lab}>
          Status
          <select name="status" defaultValue={defaults?.status || "Active"} style={inp}>
            {["Active","Paused"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn">Save</button>
        </div>
      </form>
    </div>
  );
}

const th = { padding: "10px 8px", fontWeight: 600, opacity: .9, fontSize: 13 };
const td = { padding: "10px 8px", fontSize: 14 };
const inp = { padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.16)", color: "inherit" };
const lab = { display: "grid", gap: 6, margin: "10px 0" };
const modalWrap = { position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", backdropFilter: "blur(3px)", display: "grid", placeItems: "center", zIndex: 40 };
const modalCard = { width: "min(520px, 92vw)", background: "rgba(18,18,18,.92)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12, padding: 16 };
