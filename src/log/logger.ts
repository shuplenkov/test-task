import * as util from 'util';
import winston from 'winston';

// Create custom formatter to correctly log metadata (e.g. in case it contains BigInt)
const metaFormat = winston.format.printf((info) => {
  let output = `${info.level}: ${
    Object.prototype.toString.call(info.message) === '[object String]' ? info.message : util.inspect(info.message)
  }`;

  if (info[Symbol.for('splat')]) {
    const metadata = info[Symbol.for('splat')];
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
  level: process.env.NODE_ENV === 'test' ? 'silent' : 'info', // don't log anything during tests
  format: winston.format.combine(winston.format.colorize(), winston.format.splat(), metaFormat),
  transports: [new winston.transports.Console()],
});
