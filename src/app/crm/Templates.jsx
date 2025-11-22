// src/app/crm/Templates.jsx
import React, { useState } from "react";

/**
 * CasaFlow CRM — Templates
 * Mock page for message/email templates.
 * - Local state only
 * - CRUD UI with modals
 * - CasaFlow glass + rood theme
 */
export default function TemplatesPage() {
  const [templates, setTemplates] = useState([
    {
      id: "TMP-001",
      name: "Welcome Email (EN)",
      subject: "Welcome to CasaFlow",
      body: "Thank you for your interest!",
    },
  ]);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);

  function createTemplate(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const t = {
      id: "TMP-" + Math.floor(Math.random() * 9000 + 1000),
      name: f.get("name"),
      subject: f.get("subject"),
      body: f.get("body"),
    };
    setTemplates((prev) => [t, ...prev]);
    setCreating(false);
  }

  function updateTemplate(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const patch = {
      name: f.get("name"),
      subject: f.get("subject"),
      body: f.get("body"),
    };
    setTemplates((prev) =>
      prev.map((t) => (t.id === editing ? { ...t, ...patch } : t))
    );
    setEditing(null);
  }

  function removeTemplate(id) {
    if (!confirm("Delete this template?")) return;
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <div
        className="card panel-outline"
        style={{
          padding: 16,
          borderRadius: 16,
          background:
            "radial-gradient(circle at top left, rgba(248,113,113,0.18), transparent 55%) rgba(8,8,10,0.96)",
          boxShadow: "0 22px 60px rgba(0,0,0,0.9)",
        }}
      >
        {/* Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 22 }}>Templates</h1>
            <div style={{ opacity: 0.8, fontSize: 13 }}>
              Store your message and email templates for automations.
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setCreating(true)}
            style={{ borderRadius: 999 }}
          >
            New template
          </button>
        </header>

        {/* Content */}
        {templates.length === 0 ? (
          <div
            className="empty"
            style={{ textAlign: "center", padding: 24, opacity: 0.95 }}
          >
            <h3 style={{ margin: 0 }}>No templates yet</h3>
            <p style={{ opacity: 0.8, marginTop: 6 }}>
              Add your first message or email template.
            </p>
          </div>
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
                  <th style={th}>Subject</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr
                    key={t.id}
                    style={{ borderTop: "1px solid rgba(255,255,255,.08)" }}
                  >
                    <td style={td}>{t.name}</td>
                    <td style={td}>{t.subject}</td>
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
                          onClick={() => setEditing(t.id)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn"
                          onClick={() => removeTemplate(t.id)}
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
          <TemplateModal
            title="New template"
            onClose={() => setCreating(false)}
            onSubmit={createTemplate}
          />
        )}
        {editing && (
          <TemplateModal
            title="Edit template"
            onClose={() => setEditing(null)}
            onSubmit={updateTemplate}
            defaults={templates.find((t) => t.id === editing)}
          />
        )}
      </div>
    </div>
  );
}

function TemplateModal({ title, onClose, onSubmit, defaults }) {
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
          Subject
          <input
            name="subject"
            defaultValue={defaults?.subject}
            style={inp}
          />
        </label>
        <label style={lab}>
          Body
          <textarea
            name="body"
            rows={5}
            defaultValue={defaults?.body}
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
