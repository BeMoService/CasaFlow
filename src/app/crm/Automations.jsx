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
    {
      id: "A-6001",
      name: "Lead → Auto-reply (NL/IT)",
      when: "Lead created",
      then: "Send email template",
      status: "Active",
    },
  ]);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q.trim()) return rules;
    const s = q.trim().toLowerCase();
    return rules.filter(
      (r) =>
        r.name.toLowerCase().includes(s) ||
        r.when.toLowerCase().includes(s) ||
        r.then.toLowerCase().includes(s)
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
    setRules((prev) => [next, ...prev]);
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
    setRules((prev) =>
      prev.map((r) => (r.id === editing ? { ...r, ...patch } : r))
    );
    setEditing(null);
  }

  function removeRule(id) {
    if (!confirm("Delete this automation?")) return;
    setRules((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <div
        className="card panel-outline"
        style={{
          padding: 16,
          borderRadius: 16,
          background:
            "radial-gradient(circle at top right, rgba(248,113,113,0.18), transparent 55%) rgba(8,8,10,0.96)",
          boxShadow: "0 22px 60px rgba(0,0,0,0.9)",
        }}
      >
        {/* Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 22 }}>Automations</h1>
            <div style={{ opacity: 0.75, fontSize: 13 }}>
              UI-only demo — connect later to Firestore / Functions.
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              style={inp}
            />
            <button
              className="btn btn-primary"
              onClick={() => setCreating(true)}
              style={{ borderRadius: 999 }}
            >
              New rule
            </button>
          </div>
        </header>

        {/* Content */}
        {filtered.length === 0 ? (
          <Empty onCreate={() => setCreating(true)} />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
              }}
            >
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
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    style={{ borderTop: "1px solid rgba(255,255,255,.08)" }}
                  >
                    <td style={td}>{r.name}</td>
                    <td style={td}>{r.when}</td>
                    <td style={td}>{r.then}</td>
                    <td style={td}>
                      <StatusChip value={r.status} />
                    </td>
                    <td style={td}>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          justifyContent: "flex-end",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          className="btn"
                          onClick={() => setEditing(r.id)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn"
                          onClick={() => removeRule(r.id)}
                          style={{ borderColor: "rgba(248,113,113,0.6)" }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {creating && (
          <RuleModal
            title="New automation"
            onClose={() => setCreating(false)}
            onSubmit={createRule}
          />
        )}
        {editing && (
          <RuleModal
            title="Edit automation"
            onClose={() => setEditing(null)}
            onSubmit={updateRule}
            defaults={rules.find((r) => r.id === editing)}
          />
        )}
      </div>
    </div>
  );
}

function StatusChip({ value }) {
  let border = "rgba(148,163,184,0.7)";
  let bg = "rgba(30,41,59,0.85)";

  if (value === "Active") {
    border = "rgba(34,197,94,0.9)";
    bg = "rgba(22,101,52,0.7)";
  } else if (value === "Paused") {
    border = "rgba(245,158,11,0.9)";
    bg = "rgba(120,53,15,0.7)";
  }

  return (
    <span
      style={{
        opacity: 0.95,
        padding: "2px 10px",
        borderRadius: 999,
        border: `1px solid ${border}`,
        background: bg,
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      {value}
    </span>
  );
}

function Empty({ onCreate }) {
  return (
    <div
      className="empty"
      style={{ textAlign: "center", padding: 32, opacity: 0.95 }}
    >
      <h3 style={{ margin: 0 }}>No automations yet</h3>
      <p style={{ opacity: 0.8, marginTop: 6 }}>
        Create your first rule to automate routine tasks.
      </p>
      <button
        className="btn btn-primary"
        onClick={onCreate}
        style={{ marginTop: 8, borderRadius: 999 }}
      >
        New rule
      </button>
    </div>
  );
}

function RuleModal({ title, onClose, onSubmit, defaults }) {
  return (
    <div style={modalWrap}>
      <form style={modalCard} onSubmit={onSubmit}>
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        <label style={lab}>
          Name
          <input
            name="name"
            defaultValue={defaults?.name}
            required
            style={inp}
          />
        </label>
        <label style={lab}>
          When
          <input
            name="when"
            defaultValue={defaults?.when || "Lead created"}
            style={inp}
          />
        </label>
        <label style={lab}>
          Then
          <input
            name="then"
            defaultValue={defaults?.then || "Send email"}
            style={inp}
          />
        </label>
        <label style={lab}>
          Status
          <select
            name="status"
            defaultValue={defaults?.status || "Active"}
            style={inp}
          >
            {["Active", "Paused"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            marginTop: 8,
          }}
        >
          <button
            type="button"
            className="btn"
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="btn btn-primary">Save</button>
        </div>
      </form>
    </div>
  );
}

const th = {
  padding: "10px 8px",
  fontWeight: 600,
  opacity: 0.9,
  fontSize: 13,
};

const td = { padding: "10px 8px", fontSize: 14 };

const inp = {
  padding: "8px 10px",
  borderRadius: 8,
  background: "rgba(15,23,42,0.9)",
  border: "1px solid rgba(148,163,184,0.6)",
  color: "inherit",
};

const lab = { display: "grid", gap: 6, margin: "10px 0" };

const modalWrap = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.55)",
  backdropFilter: "blur(3px)",
  display: "grid",
  placeItems: "center",
  zIndex: 40,
};

const modalCard = {
  width: "min(520px, 92vw)",
  background: "rgba(18,18,18,.96)",
  border: "1px solid rgba(248,113,113,0.6)",
  borderRadius: 14,
  padding: 16,
};
