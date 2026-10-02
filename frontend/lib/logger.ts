type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  message: string;
  level: LogLevel;
  context?: Record<string, any>;
  timestamp: string;
}

function writeLog(level: LogLevel, message: string, context?: Record<string, any>) {
  const payload: LogPayload = {
    message,
    level,
    context,
    timestamp: new Date().toISOString(),
  };

  const formattedMsg = `[${payload.timestamp}] [${level.toUpperCase()}] ${message}`;

  switch (level) {
    case "debug":
      if (process.env.NODE_ENV !== "production") {
        console.debug(formattedMsg, context || "");
      }
      break;
    case "info":
      console.info(formattedMsg, context || "");
      break;
    case "warn":
      console.warn(formattedMsg, context || "");
      break;
    case "error":
      console.error(formattedMsg, context || "");
      break;
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, any>) => writeLog("debug", message, context),
  info: (message: string, context?: Record<string, any>) => writeLog("info", message, context),
  log: (message: string, context?: Record<string, any>) => writeLog("info", message, context),
  warn: (message: string, context?: Record<string, any>) => writeLog("warn", message, context),
  error: (message: string, context?: Record<string, any>) => writeLog("error", message, context),
};

