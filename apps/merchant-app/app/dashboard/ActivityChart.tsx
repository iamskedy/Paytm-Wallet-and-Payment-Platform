"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type ActivityDatum = {
  day: string;
  payments: number;
  withdrawals: number;
};

export function ActivityChart({ data }: { data: ActivityDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="paymentsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="withdrawalsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F87171" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#F87171" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis
          dataKey="day"
          stroke="var(--text3)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="var(--text3)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          width={36}
        />
        <Tooltip
          contentStyle={{
            background: "#101820",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "var(--text2)" }}
        />
        <Area
          type="monotone"
          dataKey="payments"
          stroke="#10B981"
          fill="url(#paymentsGrad)"
          strokeWidth={2}
          name="Payments (₹)"
        />
        <Area
          type="monotone"
          dataKey="withdrawals"
          stroke="#F87171"
          fill="url(#withdrawalsGrad)"
          strokeWidth={2}
          name="Withdrawals (₹)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}