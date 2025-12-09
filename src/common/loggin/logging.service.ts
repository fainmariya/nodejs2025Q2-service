import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

enum LogLevel {
  ERROR = 0,
  WARN = 1,
  LOG = 2,
  DEBUG = 3,
}

@Injectable()
export class LoggingService {
  private readonly level: LogLevel;
  private readonly logFilePath: string;
  private readonly errorFilePath: string;
  private readonly maxSizeBytes: number;

  constructor() {
    this.level = this.getLevelFromEnv(process.env.LOG_LEVEL);

    this.logFilePath =
      process.env.LOG_FILE_PATH ?? path.resolve('logs', 'app.log');
    this.errorFilePath =
      process.env.LOG_ERROR_FILE_PATH ?? path.resolve('logs', 'error.log');

    const maxKb = Number(process.env.LOG_MAX_FILE_SIZE_KB ?? '1024'); // 1 MB по умолчанию
    this.maxSizeBytes = maxKb * 1024;

    this.ensureLogDirsExist();
  }

  log(message: string) {
    this.write(LogLevel.LOG, 'LOG', message);
  }

  debug(message: string) {
    this.write(LogLevel.DEBUG, 'DEBUG', message);
  }

  warn(message: string) {
    this.write(LogLevel.WARN, 'WARN', message);
  }

  error(message: string, trace?: string) {
    const full = trace ? `${message} | trace: ${trace}` : message;
    this.write(LogLevel.ERROR, 'ERROR', full, true);
  }

  // ======== приватные методы ========

  private write(level: LogLevel, label: string, message: string, isError = false) {
    if (level > this.level) {
      return; // не логируем, если уровень ниже установленного
    }

    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] [${label}] ${message}`;

    // вывод в консоль
    if (isError) {
      // eslint-disable-next-line no-console
      console.error(line);
    } else {
      // eslint-disable-next-line no-console
      console.log(line);
    }

    const filePath = isError ? this.errorFilePath : this.logFilePath;

    this.rotateIfNeeded(filePath);

    fs.appendFile(filePath, line + '\n', (err) => {
      if (err) {
        // как fallback просто пишем в stderr
        // eslint-disable-next-line no-console
        console.error('Failed to write log file', err);
      }
    });
  }

  private rotateIfNeeded(filePath: string) {
    try {
      if (!fs.existsSync(filePath)) {
        return;
      }
      const { size } = fs.statSync(filePath);
      if (size < this.maxSizeBytes) {
        return;
      }

      const ext = path.extname(filePath);
      const base = path.basename(filePath, ext);
      const dir = path.dirname(filePath);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      const rotatedName = `${base}-${timestamp}${ext}`;
      const rotatedPath = path.join(dir, rotatedName);

      fs.renameSync(filePath, rotatedPath);
    } catch {
      // ошибки ротации логов не должны падать наружу
    }
  }

  private ensureLogDirsExist() {
    const logDir = path.dirname(this.logFilePath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const errorDir = path.dirname(this.errorFilePath);
    if (errorDir !== logDir && !fs.existsSync(errorDir)) {
      fs.mkdirSync(errorDir, { recursive: true });
    }
  }

  private getLevelFromEnv(value?: string): LogLevel {
    switch ((value ?? '').toLowerCase()) {
      case '0':
      case 'error':
        return LogLevel.ERROR;
      case '1':
      case 'warn':
        return LogLevel.WARN;
      case '2':
      case 'log':
        return LogLevel.LOG;
      case '3':
      case 'debug':
        return LogLevel.DEBUG;
      default:
        return LogLevel.LOG; // значение по умолчанию
    }
  }
}
