"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ActivityChartProps {
  data: { label: string; demandes: number; messages: number }[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  const hasData = data.some((d) => d.demandes > 0 || d.messages > 0);

  return (
    <div className="rounded-xl border border-[#dddad4] bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-normal tracking-tight text-(--ink)">
            Activité des 7 derniers jours
          </h3>
          <p className="text-xs text-muted-foreground">
            Demandes et messages reçus
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="inline-flex items-center gap-1.5 text-(--ink)">
            <span className="h-2 w-2 rounded-sm bg-(--ink)" />
            Demandes
          </span>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-sm bg-[#9b1b1b]" />
            Messages
          </span>
        </div>
      </div>

      <div className="h-48 w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={10}>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6a6864", fontSize: 11 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6a6864", fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "#f8f7f5" }}
                contentStyle={{
                  background: "#ffffff",
                  border: "1px solid #dddad4",
                  borderRadius: "0.5rem",
                  fontSize: "12px",
                  color: "#1c1c1c",
                }}
              />
              <Bar dataKey="demandes" fill="#1c1c1c" radius={[3, 3, 0, 0]} />
              <Bar dataKey="messages" fill="#9b1b1b" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-[#dddad4] bg-(--cream)">
            <p className="text-sm text-muted-foreground">
              Aucune activité cette semaine
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
