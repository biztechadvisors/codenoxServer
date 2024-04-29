import { Injectable } from "@nestjs/common";
import * as fs from 'fs';
import axios from "axios";
import { config } from "dotenv";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class ShiprocketServiceEnv {
    private readonly envFilePath = '.env';

    async fetchToken(): Promise<string> {
        try {
            const email = process.env.SHIPROCKET_EMAIL;
            const password = process.env.SHIPROCKET_PASSWORD;
            const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', { email, password })

            const token = response.data.token;

            this.updateEnvFile({ SHIPROCKET_TOKEN: token });

            return token;

        } catch (error) {
            console.error('Error fetching Shiprocket token:', error);
            throw error;
        }
    }

    private updateEnvFile(newVariables: { [key: string]: string }): void {
        const currentEnvContent = fs.readFileSync(this.envFilePath, 'utf-8')

        const currentEnvObject = currentEnvContent.split('\n').reduce<{ [key: string]: string }>((acc, line) => {
            const [key, value] = line.split('=');
            acc[key] = value;
            return acc;
        }, {});

        const updateEnvObject = { ...currentEnvObject, ...newVariables };

        const updateEnvContent = Object.entries(updateEnvObject).map(([key, value]) => `${key}=${value}`).join('/n');

        fs.writeFileSync(this.envFilePath, updateEnvContent)
    }

    @Cron(CronExpression.EVERY_12_HOURS)
    async scheduleTokenUpdate(): Promise<void> {
        try {
            await this.fetchToken();
        } catch (error) {
            console.error('Error scheduling token update:', error);
        }
    }
}