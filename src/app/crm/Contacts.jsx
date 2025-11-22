// src/app/crm/Contacts.jsx
import React, { useMemo, useState } from "react";
import { useCrm } from "../state/crmStore.js";

/**
 * CasaFlow CRM — Contacts
 * Werkt met crmStore.js (CONTACTS_* actions).
 * - Quick add
 * - Bulk delete
 * - Merge (combineert meerdere naar één, via CONTACTS_MERGE)
 * - Inline edit (company/email/tags/notes)
 * - Gestyled in CasaFlow glass + rood theme
 */
export default function ContactsPage() {
  const { state, addContact, updateContact, removeContacts, mergeContacts } =
    useCrm();
  const { items, loading } = state.contacts;

  const [selected, setSelected] = useState(new Set());
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState("");

  const allSelected = useMemo(
    () => items.length > 0 && selected.size === items.length,
    [items, selected]
  );

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const s = q.trim().toLowerCase();
    return items.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        (c.company || "").toLowerCase().includes(s) ||
        (c.email || "").toLowerCase().includes(s) ||
        (c.tags || []).join(",").toLowerCase().includes(s)
    );
  }, [items, q]);

  function toggle(id) {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  }

  function bulkDelete() {
    if (!selected.size) return;
    if (!confirm(`Delete ${selected.size} contact(s)?`)) return;
    removeContacts([...selected]);
    setSelected(new Set());
  }

  function doMerge() {
    if (selected.size < 2)
      return alert("Select at least two contacts to merge.");
    const ids = [...selected];
    mergeContacts(ids); // store impl: first id is kept
    setSelected(new Set([ids[0]]));
  }

  function submitNew(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const item = {
      id: "C-" + Math.floor(Math.random() * 9000 + 1000),
      name: f.get("name"),
      company: f.get("company") || "",
      email: f.get("email") || "",
      tags: (f.get("tags") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      notes: f.get("notes") || "",
      lastActivity: "Now",
    };
    addContact(item);
    setCreating(false);
  }

  function submitEdit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const patch = {
      company: f.get("company") || "",
      email: f.get("email") || "",
      tags: (f.get("tags") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      notes: f.get("notes") || "",
    };
    updateContact(editing, patch);
    setEditing(null);
  }

  // Loading
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
          Loading contacts…
        </div>
      </div>
    );
  }

  // Empty
  if (!loading && items.length === 0) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <div
          className="card panel-outline"
          style={{
            textAlign: "center",
            padding: 24,
            borderRadius: 16,
            background:
              "radial-gradient(circle at top, rgba(248,113,113,0.18), transparent 55%) rgba(8,8,10,0.96)",
          }}
        >
          <h3 style={{ margin: 0 }}>No contacts yet</h3>
          <p style={{ opacity: 0.8, marginTop: 6 }}>
            Create your first contact to get started.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => setCreating(true)}
            style={{ marginTop: 8, borderRadius: 999 }}
          >
            New contact
          </button>
        </div>

        {creating && (
          <NewContactModal
            onClose={() => setCreating(false)}
            onSubmit={submitNew}
          />
        )}
      </div>
    );
  }

  // Filled
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
              New contact
            </button>
            <button
              className="btn"
              onClick={doMerge}
              disabled={selected.size < 2}
            >
              Merge
            </button>
            <button
              className="btn"
              onClick={bulkDelete}
              disabled={selected.size === 0}
              style={{ borderColor: "rgba(248,113,113,0.6)" }}
            >
              Delete
            </button>
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

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}
          >
            <thead>
              <tr style={{ textAlign: "left" }}>
                <th style={th}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() => {
                      if (allSelected) setSelected(new Set());
                      else setSelected(new Set(filtered.map((i) => i.id)));
                    }}
                  />
                </th>
                <th style={th}>Name</th>
                <th style={th}>Company</th>
                <th style={th}>Email</th>
                <th style={th}>Tags</th>
                <th style={th}>Last activity</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  style={{ borderTop: "1px solid rgba(255,255,255,.08)" }}
                >
                  <td style={td}>
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => toggle(c.id)}
                    />
                  </td>
                  <td style={td}>{c.name}</td>
                  <td style={td}>{c.company || "—"}</td>
                  <td style={td}>{c.email || "—"}</td>
                  <td style={td}>
                    {(c.tags || []).join(", ") || "—"}
                  </td>
                  <td style={td}>{c.lastActivity || "—"}</td>
                  <td style={td}>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        className="btn"
                        onClick={() => setEditing(c.id)}
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {creating && (
          <NewContactModal
            onClose={() => setCreating(false)}
            onSubmit={submitNew}
          />
        )}
        {editing && (
          <EditContactModal
            id={editing}
            onClose={() => setEditing(null)}
            onSubmit={submitEdit}
            defaults={items.find((x) => x.id === editing)}
          />
        )}
      </div>
    </div>
  );
}

function NewContactModal({ onClose, onSubmit }) {
  return (
    <div style={modalWrap}>
      <form style={modalCard} onSubmit={onSubmit}>
        <h3 style={{ marginTop: 0 }}>New contact</h3>
        <label style={lab}>
          Name
          <input name="name" required style={inp} />
        </label>
        <label style={lab}>
          Company
          <input name="company" style={inp} />
        </label>
        <label style={lab}>
          Email
          <input name="email" type="email" style={inp} />
        </label>
        <label style={lab}>
          Tags (comma separated)
          <input name="tags" placeholder="lead,warm" style={inp} />
        </label>
        <label style={lab}>
          Notes
          <textarea
            name="notes"
            rows={4}
            style={{ ...inp, resize: "vertical" }}
          />
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

function EditContactModal({ id, onClose, onSubmit, defaults }) {
  return (
    <div style={modalWrap}>
      <form style={modalCard} onSubmit={onSubmit}>
        <h3 style={{ marginTop: 0 }}>Edit contact</h3>
        <label style={lab}>
          Company
          <input
            name="company"
            defaultValue={defaults?.company}
            style={inp}
          />
        </label>
        <label style={lab}>
          Email
          <input
            name="email"
            type="email"
            defaultValue={defaults?.email}
            style={inp}
          />
        </label>
        <label style={lab}>
          Tags (comma separated)
          <input
            name="tags"
            defaultValue={(defaults?.tags || []).join(", ")}
            style={inp}
          />
        </label>
        <label style={lab}>
          Notes
          <textarea
            name="notes"
            rows={4}
            defaultValue={defaults?.notes}
            style={{ ...inp, resize: "vertical" }}
          />
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
  width: "min(620px, 92vw)",
  background: "rgba(18,18,18,.96)",
  border: "1px solid rgba(248,113,113,0.6)",
  borderRadius: 14,
  padding: 16,
};
