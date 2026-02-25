type LogLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface Logger {
  ASSERT: 1;
  ERROR: 2;
  WARN: 3;
  INFO: 4;
  DEBUG: 5;
  VERBOSE: 6;
  loggingLevel: LogLevel;
  a: typeof console.assert;
  e: typeof console.error;
  w: typeof console.warn;
  i: typeof console.info;
  d: (...data: any[]) => void;
  v: typeof console.log;
  level: LogLevel;
}

const log: Logger = {
  ASSERT: 1,
  ERROR: 2,
  WARN: 3,
  INFO: 4,
  DEBUG: 5,
  VERBOSE: 6,
  loggingLevel: 3, // Default level

  // Placeholder functions, will be initialized by the setter
  a: () => {},
  e: () => {},
  w: () => {},
  i: () => {},
  d: () => {},
  v: () => {},

  set level(level: LogLevel) {
    this.loggingLevel = level;
    this.a = level >= this.ASSERT ? console.assert.bind(console) : () => {};
    this.e = level >= this.ERROR ? console.error.bind(console) : () => {};
    this.w = level >= this.WARN ? console.warn.bind(console) : () => {};
    this.i = level >= this.INFO ? console.info.bind(console) : () => {};
    this.d =
      level >= this.DEBUG ? console.log.bind(console, "[DEBUG]") : () => {};
    this.v = level >= this.VERBOSE ? console.log.bind(console) : () => {};
  },

  get level(): LogLevel {
    return this.loggingLevel;
  },
};

// single ENV var toggle (Vite):
const debug = import.meta.env.VITE_APP_DEBUG === "true";
log.level = (debug ? log.DEBUG : log.WARN) as LogLevel;

export default log;
