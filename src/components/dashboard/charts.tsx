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

const revenueData = [
  { day: "Seg", value: 3200 },
  { day: "Ter", value: 4100 },
  { day: "Qua", value: 3800 },
  { day: "Qui", value: 5200 },
  { day: "Sex", value: 4900 },
  { day: "Sáb", value: 2100 },
];

const servicesData = [
  { service: "Revisão", qty: 42 },
  { service: "Freios", qty: 28 },
  { service: "Suspensão", qty: 19 },
  { service: "Alinhamento", qty: 35 },
  { service: "Elétrica", qty: 12 },
];

export function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={revenueData}>
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

export function ServicesChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={servicesData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="service" stroke="#64748b" fontSize={12} />
        <YAxis stroke="#64748b" fontSize={12} />
        <Tooltip />
        <Bar dataKey="qty" fill="#ea580c" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
