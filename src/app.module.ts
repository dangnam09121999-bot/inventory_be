import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InventoryModule } from './inventory/inventory.module';
import { AuthModule } from './auth/auth.module';
import { BackupModule } from './backup/backup.module';
import { UsersModule } from './users/users.module';
import { InventoryItem } from './inventory/inventory.entity';
import { InventoryImportHistory } from './inventory/inventory-import-history.entity';
import { InventoryExportHistory } from './inventory/inventory-export-history.entity';
import { User } from './auth/user.entity';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { InventoryDetail } from './inventory/inventory-detail.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction =
          configService.get<string>('NODE_ENV') === 'production';
        return {
          type: 'postgres',
          url: configService.get<string>('DATABASE_URL'),
          entities: [
            InventoryItem,
            InventoryDetail,
            InventoryImportHistory,
            InventoryExportHistory,
            User,
          ],
          synchronize: !isProduction, // Tắt synchronize trong production
          ssl: isProduction ? { rejectUnauthorized: false } : false,
          logging: !isProduction,
        };
      },
    }),
    InventoryModule,
    AuthModule,
    BackupModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
