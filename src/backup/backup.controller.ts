import { Controller, Post } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { BackupService } from './backup.service';

@Controller('backup')
@Roles('warehouse')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  /** Chạy backup ngay - dùng cho admin test */
  @Post('run')
  runNow() {
    return this.backupService.runBackupNow();
  }
}
