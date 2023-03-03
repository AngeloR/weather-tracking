import { Type, Static } from '@sinclair/typebox';
import { HttpRouter } from '@lib/router';;
import { db } from '@lib/db';
import type { Station } from '@prisma/client';

export const router = new HttpRouter('');

const inputSchema = Type.Object({
  params: Type.Object({
    stationId: Type.String()
  }),
  body: Type.Object({
    temperature: Type.Number(),
  })
});

export type InputType = Static<typeof inputSchema>;

export async function acceptUserTemperature(data: InputType): Promise<void> {

  let station: Station;

  try {
    station = await db.station.findUniqueOrThrow({
      where: {
        id: data.params.stationId
      }
    });
  }
  catch(e) {
    station = await db.station.create({
      data: {
        id: data.params.stationId
      }
    });
  }

  await db.temperature.create({
    data: {
      stationId: station.id,
      value: data.body.temperature,
    }
  });
}


router.post<InputType, void>(
  { input: inputSchema },
  '/station/:stationId/temperature',
  acceptUserTemperature
);
