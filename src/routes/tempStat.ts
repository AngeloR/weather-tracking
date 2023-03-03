import { Type, Static } from '@sinclair/typebox';
import { HttpRouter } from '@lib/router';;
import { db } from '@lib/db';
import { Prisma } from '@prisma/client';

export const router = new HttpRouter('');

const inputSchema = Type.Object({
  params: Type.Object({
    stationId: Type.String()
  })
});

export type InputType = Static<typeof inputSchema>;

export type OutputType = {
  average: Prisma.Decimal;
  min: Prisma.Decimal;
  max: Prisma.Decimal;
  median: Prisma.Decimal
}

export async function viewTemperatureStats(data: InputType): Promise<OutputType> {

  const tempStats = await Promise.all([
    db.temperature.aggregate({
      _avg: { value: true },
      _max: { value: true },
      _min: { value: true },
      where: {
        stationId: data.params.stationId
      }
    }), 
    db.$queryRaw`select percentile_cont(0.5) within group (order by value) from "Temperature"`
  ]);

  return {
    average: tempStats[0]._avg.value,
    min: tempStats[0]._min.value,
    max: tempStats[0]._max.value,
    median: tempStats[1][0].percentile_cont
  }
}


router.get<InputType, OutputType>(
  { input: inputSchema },
  '/station/:stationId/stats',
  viewTemperatureStats
);
