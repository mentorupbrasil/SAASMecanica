"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

type RevenuePoint = { day: string; value: number };
type ServicePoint = { service: string; qty: number };

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
        <YAxis stroke="#64748b" fontSize={12} />
        <Tooltip formatter={(v) => formatCurrency(Number(v))} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#ea580c"
          strokeWidth={2}
          dot={{ fill: "#ea580c" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ServicesChart({ data }: { data: ServicePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="service" stroke="#64748b" fontSize={12} />
        <YAxis stroke="#64748b" fontSize={12} />
        <Tooltip />
        <Bar dataKey="qty" fill="#ea580c" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

type TrendPoint = { month: string; income: number; expense: number; profit: number };

export function ProfitTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
        <YAxis stroke="#64748b" fontSize={12} />
        <Tooltip formatter={(v) => formatCurrency(Number(v))} />
        <Bar dataKey="income" name="Receita" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
