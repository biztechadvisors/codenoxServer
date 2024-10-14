import { Logger } from '@nestjs/common';
export declare class SilentLogger extends Logger {
    logQuery(): void;
    logQueryError(): void;
    logQuerySlow(): void;
    logSchemaBuild(): void;
    logMigration(): void;
    log(): void;
}
