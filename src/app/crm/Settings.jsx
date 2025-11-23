// src/app/crm/Settings.jsx
import React, { useState } from "react";

/**
 * CasaFlow CRM — Settings
 * Mock settings voor CRM configuratie / branding.
 * Later te koppelen aan Firestore user settings.
 */
export default function SettingsPage() {
  const [settings, setSettings] = useState({
    companyName: "CasaFlow Realty",
    defaultCurrency: "€",
    theme: "dark",
    notifications: true,
  });
  const [saved, setSaved] = useState(false);

  function handleChange(e) {
    const { name, type, value, checked } = e.target;
    setSettings((s) => ({
      ...s,
      [name]: type === "checkbox" ? checked : value,
    }));
    setSaved(false);
  }

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
    // later: save to Firestore
  }

  return (
    <div
      className="card panel-outline cf-settings-card"
      style={{
        padding: 20,
        borderRadius: 16,
        maxWidth: 640,
      }}
    >
      <header style={{ marginBottom: 12 }}>
        <h1 style={{ marginTop: 0, marginBottom: 4 }}>Settings</h1>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            opacity: 0.8,
          }}
        >
          Configure your CasaFlow CRM workspace. This is a mock UI — wiring to
          Firestore comes later.
        </p>
      </header>

      <form
        onSubmit={handleSave}
        style={{ display: "grid", gap: 12, marginTop: 8 }}
      >
        <label style={lab}>
          Company name
          <input
            name="companyName"
            value={settings.companyName}
            onChange={handleChange}
            style={inp}
          />
        </label>

        <label style={lab}>
          Default currency
          <input
            name="defaultCurrency"
            value={settings.defaultCurrency}
            onChange={handleChange}
            style={inp}
          />
        </label>

        <label style={lab}>
          Theme
          <select
            name="theme"
            value={settings.theme}
            onChange={handleChange}
            style={inp}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </label>

        <label
          style={{
            ...lab,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <input
            type="checkbox"
            name="notifications"
            checked={settings.notifications}
            onChange={handleChange}
          />
          Enable notifications
        </label>

        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          {saved && (
            <div
              style={{
                fontSize: 13,
                padding: "6px 10px",
                borderRadius: 999,
                border: "1px solid rgba(34,197,94,0.7)",
                background: "rgba(22,101,52,0.45)",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                opacity: 0.95,
              }}
            >
              <span>Saved</span>
              <span>✔</span>
            </div>
          )}
          <button className="btn cf-settings-save" type="submit">
            Save
          </button>
        </div>
      </form>

      {/* Scoped styling voor de rode card + Save button */}
      <style>{`
        .cf-settings-card {
          background:
            radial-gradient(circle at top left, rgba(248,113,113,0.22), transparent 55%)
            rgba(8,8,10,0.96);
          box-shadow: 0 22px 60px rgba(0,0,0,0.9);
        }

        .cf-settings-save {
          border-radius: 999px;
          border: 1px solid rgba(248,113,113,0.75);
          background:
            radial-gradient(circle at 0% 0%, rgba(248,113,113,0.55), transparent 55%),
            rgba(15,15,18,0.96);
          box-shadow:
            0 0 18px rgba(248,113,113,0.45),
            0 10px 30px rgba(0,0,0,0.85);
          color: #fee2e2;
          font-weight: 600;
        }

        .cf-settings-save:hover {
          border-color: rgba(248,113,113,0.95);
          background:
            radial-gradient(circle at 0% 0%, rgba(248,113,113,0.75), transparent 60%),
            rgba(24,7,7,1);
          transform: translateY(-1px);
        }

        .cf-settings-save:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}

const inp = {
  padding: "8px 10px",
  borderRadius: 8,
  background: "rgba(255,255,255,.06)",
  border: "1px solid rgba(255,255,255,.16)",
  color: "inherit",
};
const lab = { display: "grid", gap: 6 };
