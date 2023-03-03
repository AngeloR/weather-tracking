import { router as reportTeperatureRouter } from './reportTemperature';
import { router as viewTemperatureLog } from './viewLog';
import { router as deleteTemperatureLog } from './deleteLog';
import { router as viewTemperatureStats } from './tempStat';

export const Routers = [
  reportTeperatureRouter,
  viewTemperatureLog,
  deleteTemperatureLog,
  viewTemperatureStats
];
