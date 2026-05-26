// components/UI/TabBar.jsx
import React from "react";
import Icon from "./Icons";

/**
 * <TabBar
 *   tabs={[{ id: 'home', label: 'Accueil', icon: 'home', badge?: number }]}
 *   active="home"
 *   onChange={id => setTab(id)}
 * />
 */
export default function TabBar({ tabs, active, onChange }) {
  return (
    <nav className="tabbar">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            className="tabbar-item"
            onClick={() => onChange(tab.id)}
            style={{ color: isActive ? "var(--coral)" : "var(--textSub)" }}
          >
            <div style={{ position: "relative", display: "inline-flex" }}>
              <Icon name={tab.icon} size={22} />
              {tab.badge > 0 && (
                <span className="badge-dot" style={{ fontSize: 10 }}>
                  {tab.badge > 9 ? "9+" : tab.badge}
                </span>
              )}
            </div>
            <span
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 11,
                fontWeight: isActive ? 700 : 500,
                letterSpacing: "0.01em",
              }}
            >
              {tab.label}
            </span>
            {isActive && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 20,
                  height: 2,
                  background: "var(--coral)",
                  borderRadius: 99,
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
