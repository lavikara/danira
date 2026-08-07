import { ChartJsData } from '../types/definitions.js';

export function toChartData(
  items: { label: string; value: number }[],
  datasetLabel: string,
  borderRadius: number,
): ChartJsData {
  return {
    labels: items.map((item) => item.label),
    datasets: [
      {
        label: datasetLabel,
        data: items.map((item) => item.value),
        backgroundColor: [
          '#2563EB',
          '#10B981',
          '#F59E0B',
          '#8B5CF6',
          '#EF4444',
          '#06B6D4',
          '#EC4899',
          '#0EA5E9',
          '#84CC16',
          '#F97316',
        ],
        borderRadius,
      },
    ],
  } as ChartJsData;
}

export function toMultiSeriesChartData(
  labels: string[],
  series: { label: string; data: number[]; color?: string; fill?: boolean }[],
  borderRadius?: number,
): ChartJsData {
  const palette = [
    'rgba(37, 99, 235, 1)',
    'rgba(16, 185, 129, 1)',
    'rgba(245, 158, 11, 1)',
    'rgba(139, 92, 246, 1)',
    'rgba(239, 68, 68, 1)',
    'rgba(6, 182, 212, 1)',
    'rgba(236, 72, 153, 1)',
    'rgba(14, 165, 233, 1)',
    'rgba(132, 204, 22, 1)',
    'rgba(249, 115, 22, 1)',
  ];

  return {
    labels,
    datasets: series.map((s, i) => {
      const color = s.color ?? palette[i % palette.length];

      return {
        label: s.label,
        data: s.data,
        backgroundColor: [`${color}25`, `${color}50`, `${color}75`, color],
        borderColor: color,
        borderRadius,
        tension: 0.35,
        fill: s.fill ?? false,
      };
    }),
  } as ChartJsData;
}
