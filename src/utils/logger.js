const write = (level, message) => {
    const line = `${new Date().toISOString()} ${level.toUpperCase()} ${message}`;
    (level === "error" ? console.error : console.log)(line);
};

export const logger = {
    info: (msg) => write("info", msg),
    warn: (msg) => write("warn", msg),
    error: (msg) => write("error", msg),
};