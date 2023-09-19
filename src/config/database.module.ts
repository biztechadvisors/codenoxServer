import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                type: "mysql",
                host: "103.191.208.50",
                port: 3306,
                username: "pzqjchtu_remote",
                password: "h!Ibz6eSn!-S",
                database: "pzqjchtu_CodenoxxAdmin",
                // entities: [__dirname + '/../**/*.entity.ts'],
                autoLoadEntities: true,
                synchronize: true,
                logging: true,
                // subscribers: [],
                // migrations: []
            })
        })
    ]
})

export class DatabaseModule { }