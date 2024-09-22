export declare class ShiprocketServiceEnv {
    private readonly envFilePath;
    fetchToken(): Promise<string>;
    private updateEnvFile;
    scheduleTokenUpdate(): Promise<void>;
}
