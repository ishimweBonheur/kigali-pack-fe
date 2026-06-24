"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useTheme } from "@/providers/theme-provider";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface BarChartProps {
  labels: string[];
  data: number[];
  label?: string;
  color?: string;
  height?: number;
}

export function BarChart({
  labels,
  data,
  label = "Count",
  color = "#0ea5e9",
  height = 240,
}: BarChartProps) {
  const { theme } = useTheme();
  const gridColor =
    theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
  const textColor = theme === "dark" ? "#94a3b8" : "#64748b";

  return (
    <div style={{ height }}>
      <Bar
        data={{
          labels,
          datasets: [
            {
              label,
              data,
              backgroundColor: `${color}80`,
              borderColor: color,
              borderWidth: 1,
              borderRadius: 6,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#0b1220",
              borderColor: "rgba(255,255,255,0.08)",
              borderWidth: 1,
            },
          },
          scales: {
            x: {
              grid: { display: false },
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
