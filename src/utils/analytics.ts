import { ChartJsBarData } from '../types/definitions.js';

export function toBarChartData(
  items: { label: string; value: number }[],
  datasetLabel: string,
): ChartJsBarData {
  return {
    labels: items.map((item) => item.label),
    datasets: [
      {
        label: datasetLabel,
        data: items.map((item) => item.value),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };
}
