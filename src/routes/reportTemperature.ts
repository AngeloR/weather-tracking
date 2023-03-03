import { Type, Static } from '@sinclair/typebox';
import { HttpRouter } from '@lib/router';;

export const router = new HttpRouter('');

const inputSchema = Type.Object({
  params: Type.Object({
    userId: Type.String()
  }),
  body: Type.Object({
    temperature: Type.Number(),
  })
});

export type InputType = Static<typeof inputSchema>;

export type OutputType = {
  temperature: number,
  userId: string
};

export async function acceptUserTemperature(data: InputType): Promise<OutputType> {
  console.log(data.body.temperature, typeof data.body.temperature);
  return {
    temperature: data.body.temperature,
    userId: data.params.userId
  }
}


router.post<InputType, OutputType>(
  { input: inputSchema },
  '/user/:userId/temperature',
  acceptUserTemperature
);
