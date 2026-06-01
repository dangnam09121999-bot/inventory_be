import { Controller, Post } from '@nestjs/common';
import { BackupService } from './backup.service';

@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  /** Chạy backup ngay - dùng cho admin test */
  @Post('run')
  runNow() {
    return this.backupService.runBackupNow();
  }
}
