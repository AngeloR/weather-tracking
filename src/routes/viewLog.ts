import { Type, Static } from '@sinclair/typebox';
import { HttpRouter } from '@lib/router';;
import { db } from '@lib/db';
import type { Prisma } from '@prisma/client';

export const router = new HttpRouter('');

const inputSchema = Type.Object({
  params: Type.Object({
    stationId: Type.String()
  })
});

export type InputType = Static<typeof inputSchema>;


type OutputType = {
  value: Prisma.Decimal;
  takenDate: Date
}[]

export async function viewTemperatureLog(data: InputType): Promise<OutputType> {

  const temperatureList = await db.temperature.findMany({
    select: {
      value: true,
      takenDate: true
    },
    where: {
      stationId: data.params.stationId
    },
    orderBy: {
      takenDate: 'desc'
    }
  });

  return temperatureList;
}


router.get<InputType, OutputType>(
  { input: inputSchema },
  '/station/:stationId/temperature',
  viewTemperatureLog
);
