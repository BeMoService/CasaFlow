// src/app/crm/Inbox.jsx
import React, { useMemo, useState } from "react";
import { useCrm } from "../state/crmStore.js";

/**
 * CasaFlow CRM — Inbox
 * Werkt met crmStore.js (INBOX_* actions).
 * - Open/Closed filter
 * - Mark as (Open/Pending/Closed)
 * - Quick add draft
 * - CasaFlow glass + rood theme
 */
export default function InboxPage() {
  const { state, addInboxDraft, updateInbox } = useCrm();
  const { items, loading } = state.inbox;

  const [status, setStatus] = useState("Open"); // filter
  const [creating, setCreating] = useState(false);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const base =
      status === "All" ? items : items.filter((m) => m.status === status);
    if (!q.trim()) return base;
    const s = q.trim().toLowerCase();
    return base.filter(
      (m) =>
        m.subject.toLowerCase().includes(s) ||
        (m.assignedTo || "").toLowerCase().includes(s)
    );
  }, [items, status, q]);

  function submitNew(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    addInboxDraft({
      id: "M-" + Math.floor(Math.random() * 9000 + 1000),
      subject: f.get("subject") || "Draft",
      status: "Open",
      assignedTo: f.get("owner") || "You",
      unread: true,
    });
    setCreating(false);
  }

  function mark(id, next) {
    updateInbox(id, { status: next, unread: false });
  }

  // Loading state
  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <div
          className="card panel-outline"
          style={{
            padding: 16,
            borderRadius: 16,
            background:
              "radial-gradient(circle at top, rgba(248,113,113,0.14), transparent 50%) rgba(8,8,10,0.96)",
          }}
        >
          Loading inbox…
        </div>
      </div>
    );
  }

  // Main layout
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <div
        className="card panel-outline"
        style={{
          padding: 12,
          borderRadius: 16,
          background:
            "radial-gradient(circle at top right, rgba(248,113,113,0.16), transparent 55%) rgba(8,8,10,0.96)",
        }}
      >
        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              className="btn btn-primary"
              onClick={() => setCreating(true)}
              style={{ borderRadius: 999 }}
            >
              New message
            </button>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={inp}
            >
              {["Open", "Pending", "Closed", "All"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              style={inp}
            />
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div
            className="empty"
            style={{ textAlign: "center", padding: 24, opacity: 0.9 }}
          >
            <h3 style={{ margin: 0 }}>No messages</h3>
            <p style={{ opacity: 0.8, marginTop: 6 }}>
              Try another filter or create a new draft.
            </p>
          </div>
        ) : (
          // Table
          <div style={{ overflowX: "auto" }}>
            <table
              style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}
            >
              <thead>
                <tr style={{ textAlign: "left" }}>
                  <th style={th}>Subject</th>
                  <th style={th}>Status</th>
                  <th style={th}>Assigned</th>
                  <th style={th}>Unread</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr
                    key={m.id}
                    style={{
                      borderTop: "1px solid rgba(255,255,255,.08)",
                      background: m.unread
                        ? "rgba(15,23,42,0.85)"
                        : "transparent",
                    }}
                  >
                    <td style={td}>{m.subject}</td>
                    <td style={td}>
                      <StatusChip value={m.status} />
                    </td>
                    <td style={td}>{m.assignedTo || "—"}</td>
                    <td style={td}>{m.unread ? "•" : ""}</td>
                    <td style={td}>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          justifyContent: "flex-end",
                          flexWrap: "wrap",
                        }}
                      >
                        {m.status !== "Open" && (
                          <button
                            className="btn"
                            onClick={() => mark(m.id, "Open")}
                          >
                            Mark open
                          </button>
                        )}
                        {m.status !== "Pending" && (
                          <button
                            className="btn"
                            onClick={() => mark(m.id, "Pending")}
                          >
                            Mark pending
                          </button>
                        )}
                        {m.status !== "Closed" && (
                          <button
                            className="btn"
                            onClick={() => mark(m.id, "Closed")}
                          >
                            Mark closed
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {creating && (
          <NewMsgModal
            onClose={() => setCreating(false)}
            onSubmit={submitNew}
          />
        )}
      </div>
    </div>
  );
}

function StatusChip({ value }) {
  let border = "rgba(148,163,184,0.7)";
  let bg = "rgba(15,23,42,0.9)";

  if (value === "Open") {
    border = "rgba(34,197,94,0.9)";
    bg = "rgba(22,101,52,0.7)";
  } else if (value === "Pending") {
    border = "rgba(245,158,11,0.9)";
    bg = "rgba(120,53,15,0.7)";
  } else if (value === "Closed") {
    border = "rgba(148,163,184,0.9)";
    bg = "rgba(30,41,59,0.85)";
  }

  return (
    <span
      style={{
        padding: "2px 10px",
        borderRadius: 999,
        border: `1px solid ${border}`,
        background: bg,
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        opacity: 0.95,
      }}
    >
      {value}
    </span>
  );
}

function NewMsgModal({ onClose, onSubmit }) {
  return (
    <div style={modalWrap}>
      <form style={modalCard} onSubmit={onSubmit}>
        <h3 style={{ marginTop: 0 }}>New message</h3>
        <label style={lab}>
          Subject
          <input name="subject" required style={inp} />
        </label>
        <label style={lab}>
          Assign to
          <select name="owner" style={inp} defaultValue="You">
            {["You", "Ruben", "Ops", "Sales"].map((o) => (
              <option key={o} value={o}>
                {o}
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
          <button className="btn btn-primary">Create</button>
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

const td = {
  padding: "10px 8px",
  fontSize: 14,
};

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
