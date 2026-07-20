import { ChartJsData } from '../types/definitions.js';

export function toChartData(
  items: { label: string; value: number }[],
  datasetLabel: string,
  borderRadious: number,
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
        borderRadius: borderRadious,
      },
    ],
  };
}
