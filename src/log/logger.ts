import * as util from 'util';
import winston from 'winston';

const myFormat = winston.format.printf((info) => {
  let output = `${info.level}: ${util.inspect(info.message)}`;
  if (info[Symbol.for('splat')]) {
    const metadata = info[Symbol.for('splat')]; // assuming metadata is the first splat argument
    const metaStr = util.inspect(metadata, {
      depth: null,
      showHidden: false,
      maxArrayLength: null,
      breakLength: Infinity,
      compact: false,
    });
    output += ` ${metaStr}`;
  }
  return output;
});

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
  format: winston.format.combine(winston.format.colorize(), winston.format.splat(), myFormat),
  transports: [new winston.transports.Console()],
});
