import { Type, Static } from '@sinclair/typebox';
import { HttpRouter } from '@lib/router';;
import { db } from '@lib/db';

export const router = new HttpRouter('');

const inputSchema = Type.Object({
  params: Type.Object({
    stationId: Type.String()
  })
});

export type InputType = Static<typeof inputSchema>;

export async function deleteTemperatureLog(data: InputType): Promise<void> {

  await db.temperature.deleteMany({
    where: {
      stationId: data.params.stationId
    }
  });
}


router.delete<InputType, void>(
  { input: inputSchema },
  '/station/:stationId/temperature',
  deleteTemperatureLog
);
