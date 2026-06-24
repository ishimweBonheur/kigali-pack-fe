"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useTheme } from "@/providers/theme-provider";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
);

interface AreaChartProps {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    color?: string;
  }>;
  height?: number;
}

export function AreaChart({ labels, datasets, height = 280 }: AreaChartProps) {
  const { theme } = useTheme();
  const gridColor =
    theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
  const textColor = theme === "dark" ? "#94a3b8" : "#64748b";

  const colors = ["#0ea5e9", "#22c55e", "#f59e0b", "#8b5cf6", "#ef4444"];

  return (
    <div style={{ height }}>
      <Line
        data={{
          labels,
          datasets: datasets.map((ds, i) => ({
            label: ds.label,
            data: ds.data,
            borderColor: ds.color ?? colors[i % colors.length],
            backgroundColor: `${ds.color ?? colors[i % colors.length]}20`,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 4,
            borderWidth: 2,
          })),
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: {
              display: datasets.length > 1,
              labels: { color: textColor, boxWidth: 12, padding: 16 },
            },
            tooltip: {
              backgroundColor: "#0b1220",
              borderColor: "rgba(255,255,255,0.08)",
              borderWidth: 1,
              titleColor: "#f8fafc",
              bodyColor: "#94a3b8",
              padding: 12,
            },
          },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: { color: textColor, maxTicksLimit: 8 },
            },
            y: {
              grid: { color: gridColor },
              ticks: { color: textColor },
              beginAtZero: true,
            },
          },
        }}
      />
    </div>
  );
}
