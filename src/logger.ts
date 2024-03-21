/* eslint-disable prettier/prettier */
// import { Logger } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SilentLogger extends Logger {
    logQuery(query: string, parameters?: any[], queryRunner?: import('typeorm').QueryRunner) {
        // Suppress query logs
    }

    logQueryError(error: string, query: string, parameters?: any[], queryRunner?: import('typeorm').QueryRunner) {
        // Suppress query error logs
    }

    logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: import('typeorm').QueryRunner) {
        // Suppress slow query logs
    }

    logSchemaBuild(message: string, queryRunner?: import('typeorm').QueryRunner) {
        // Suppress schema build logs
    }

    logMigration(message: string, queryRunner?: import('typeorm').QueryRunner) {
        // Suppress migration logs
    }

    log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: import('typeorm').QueryRunner) {
        // Suppress general logs
    }
}
