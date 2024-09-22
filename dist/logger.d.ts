import { Logger } from '@nestjs/common';
export declare class SilentLogger extends Logger {
    logQuery(query: string, parameters?: any[], queryRunner?: import('typeorm').QueryRunner): void;
    logQueryError(error: string, query: string, parameters?: any[], queryRunner?: import('typeorm').QueryRunner): void;
    logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: import('typeorm').QueryRunner): void;
    logSchemaBuild(message: string, queryRunner?: import('typeorm').QueryRunner): void;
    logMigration(message: string, queryRunner?: import('typeorm').QueryRunner): void;
    log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: import('typeorm').QueryRunner): void;
}
