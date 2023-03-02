import { Type, Static } from '@sinclair/typebox';
import { HttpRouter } from '@lib/router';;

export const router = new HttpRouter('/temperature');

const inputSchema = Type.Object({
  body: Type.Object({
    temperature: Type.Number(),
    userId: Type.String()
  })
});

export type InputType = Static<typeof inputSchema>;

export type OutputType = {
  temperature: number,
  userId: string
};

export async function acceptUserTemperature(data: InputType): Promise<OutputType> {
  return {
    temperature: data.body.temperature,
    userId: data.body.userId
  }
}


router.post<InputType, OutputType>(
  { input: inputSchema },
  '/',
  acceptUserTemperature
);
