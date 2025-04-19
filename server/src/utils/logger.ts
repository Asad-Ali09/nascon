import { createLogger, format, transports } from "winston";
const { combine, timestamp, json, colorize } = format;

// Custom format for console logging with colors
const consoleLogFormat = format.combine(
  format.colorize(),
  format.printf(({ level, message, timestamp }) => {
    let parsedMessage;
    try {
      parsedMessage = JSON.parse(message);
      message = JSON.stringify(parsedMessage, null, 2);
    } catch (e) {
      // Message is not JSON, keep it as is
    }
    return `[${timestamp}] [${level}]: ${message}`;
  })
);

// Create a Winston logger
const logger = createLogger({
  level: "info",
  format: combine(colorize(), timestamp({ format: "HH:mm:ss" }), json()),
  transports: [
    new transports.Console({
      format: consoleLogFormat,
    }),
    // new transports.File({ filename: "app.log" }),
  ],
});

export default logger;
