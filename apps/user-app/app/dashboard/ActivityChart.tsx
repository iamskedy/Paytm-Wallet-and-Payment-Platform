"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function ActivityChart({ data }: { data: { day: string; sent: number; received: number }[] }) {
  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
        <BarChart data={data} barGap={4} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: "var(--text3)", fontSize: 11, fontFamily: "var(--font-mono)" }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--text3)", fontSize: 11, fontFamily: "var(--font-mono)" }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,.03)" }}
            contentStyle={{ background: "var(--card2)", border: "1px solid var(--border2)", borderRadius: 10, fontSize: 12 }}
            labelStyle={{ color: "var(--text)", fontWeight: 600, marginBottom: 4 }}
            itemStyle={{ color: "var(--text2)" }}
            formatter={(value, name) => {
            const num = Array.isArray(value) ? value[0] : value;
            return [`₹${Number(num ?? 0).toLocaleString("en-IN")}`, name as string];
          }}
          />
          <Bar dataKey="received" name="Received" fill="#34D399" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="sent" name="Sent" fill="#F87171" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text2)" }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: "#34D399", display: "inline-block" }} /> Received
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text2)" }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: "#F87171", display: "inline-block" }} /> Sent
        </div>
      </div>
    </div>
  );
}