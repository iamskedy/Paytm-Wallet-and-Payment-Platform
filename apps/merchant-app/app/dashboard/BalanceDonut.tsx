"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export function BalanceDonut({ available, locked, accentColor }: { available: number; locked: number; accentColor: string }) {
  const data = [
    { name: "Available", value: available },
    { name: "Locked", value: locked },
  ];
  const hasData = available + locked > 0;

  if (!hasData) {
    return (
      <div style={{ width: "100%", height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--text3)", fontSize: 13 }}>No balance yet</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ width: "100%", height: 180 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={3} stroke="none">
              <Cell fill={accentColor} />
              <Cell fill="#D97706" />
            </Pie>
            <Tooltip
              contentStyle={{ background: "var(--card2)", border: "1px solid var(--border2)", borderRadius: 10, fontSize: 12 }}
              labelStyle={{ color: "var(--text)" }}
              itemStyle={{ color: "var(--text2)" }}
              formatter={(value, name) => [`₹${Number(value ?? 0).toLocaleString("en-IN")}`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text2)" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: accentColor, display: "inline-block" }} />
          Available · ₹{available.toLocaleString("en-IN")}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text2)" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#D97706", display: "inline-block" }} />
          Locked · ₹{locked.toLocaleString("en-IN")}
        </div>
      </div>
    </div>
  );
}