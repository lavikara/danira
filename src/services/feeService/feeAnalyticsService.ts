import { prismaClient } from '../dbServices/dbClient/prismaClient.js';
import { toChartData } from '../../utils/analytics.js';
import { FeeCategory } from '../../generated/client.js';

export async function getFeeStructureCounts(scopeWhere: Record<string, any>) {
  const [totalFees, totalCompulsoryFees, totalOptionalFees] = await Promise.all([
    prismaClient.feeStructures.count({ where: scopeWhere }),
    prismaClient.feeStructures.count({
      where: { ...scopeWhere, category: FeeCategory.COMPULSORY },
    }),
    prismaClient.feeStructures.count({
      where: { ...scopeWhere, category: FeeCategory.OPTIONAL },
    }),
  ]);

  return { totalFees, totalCompulsoryFees, totalOptionalFees };
}

export async function getStudentsPerFeeTypeChart(feeScopeWhere: Record<string, any>) {
  const feeStructures = await prismaClient.feeStructures.findMany({
    where: feeScopeWhere,
    select: { id: true, name: true },
  });

  const counts = await Promise.all(
    feeStructures.map((structure) =>
      prismaClient.fees.findMany({
        where: { feeStructureId: structure.id },
        distinct: ['studentId'],
        select: { studentId: true },
      }),
    ),
  );

  const chartData = feeStructures.map((structure, i) => ({
    label: structure.name,
    value: counts[i]!.length,
  }));

  return { chart: toChartData(chartData, 'Students Expected to Pay', 7) };
}
