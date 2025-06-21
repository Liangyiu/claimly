import { pinoLogger } from "hono-pino";
import pino from "pino";
const pretty = require("pino-pretty");
export function logger() {
  return pinoLogger({
    pino: pino(pretty()),
  });
}
