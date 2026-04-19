import winston, { debug, error, log, warn } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const envVariable = process.env.NODE_ENV;

const customlevels = {
    error : 0,
    warn : 1,
    info : 2,
    debug : 3,
};

function getLogFormate() {
    if (envVariable === 'production') {
        return winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        )
    }
    else{
        return winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({format : 'YYYY-MM-DD  HH:mm:ss'}),
            winston.format.printf((log)=>`[${log.timestamp}] ${log.level} : ${log.message}`)
        )
    }
}

const transport = new DailyRotateFile({
    level: 'info',
    filename: 'logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
  });

  const logger = winston.createLogger({
    levels : customlevels,

    level : (envVariable === 'production')? 'info' : 'debug',

    format : getLogFormate(),

    transports : [
        new winston.transports.File({
            filename : 'logs/error.log',
            level : 'error'
        }),
        transport
    ]
  })

  if(envVariable!=='production')
  {
    logger.add(new winston.transports.Console({
        format : getLogFormate()
    }))
  }

  export {
    logger
  }