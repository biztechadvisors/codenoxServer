/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SilentLogger extends Logger {
    // Override methods to suppress all logs
    logQuery(): void { }
    logQueryError(): void { }
    logQuerySlow(): void { }
    logSchemaBuild(): void { }
    logMigration(): void { }
    log(): void { }
}
