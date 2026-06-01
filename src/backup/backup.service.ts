import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  // 8h tối giờ Việt Nam (UTC+7) = 13:00 UTC
  @Cron('0 13 * * *', { timeZone: 'Asia/Ho_Chi_Minh', name: 'daily-backup' })
  async handleDailyBackup() {
    if (!this.isMailConfigured()) {
      this.logger.warn(
        'Bỏ qua backup: chưa cấu hình MAIL_HOST/MAIL_USER/MAIL_PASS/MAIL_TO trong .env',
      );
      return;
    }
    this.logger.log('Bắt đầu backup database hàng ngày...');
    let filePath: string | null = null;
    try {
      const sql = await this.generateSqlDump();
      const fileName = `inventory-backup-${this.formatDate(new Date())}.sql`;
      filePath = path.join(os.tmpdir(), fileName);
      fs.writeFileSync(filePath, sql, 'utf8');

      await this.sendBackupEmail(filePath, fileName);

      this.logger.log(`Backup gửi email thành công: ${fileName}`);
    } catch (error) {
      this.logger.error('Backup thất bại', error as Error);
    } finally {
      if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch {
          /* ignore */
        }
      }
    }
  }

  private isMailConfigured(): boolean {
    return Boolean(
      this.configService.get<string>('MAIL_HOST') &&
        this.configService.get<string>('MAIL_USER') &&
        this.configService.get<string>('MAIL_PASS') &&
        this.configService.get<string>('MAIL_TO'),
    );
  }

  /** Manual trigger - dùng cho test/endpoint admin */
  async runBackupNow(): Promise<{ success: boolean; message: string }> {
    if (!this.isMailConfigured()) {
      return {
        success: false,
        message:
          'Chưa cấu hình email. Vui lòng điền MAIL_HOST, MAIL_USER, MAIL_PASS, MAIL_TO trong .env',
      };
    }
    try {
      await this.handleDailyBackup();
      return { success: true, message: 'Backup đã được thực hiện' };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: msg };
    }
  }

  /** Tạo SQL dump từ tất cả các bảng */
  async generateSqlDump(): Promise<string> {
    const lines: string[] = [];
    lines.push('-- Inventory DB Backup');
    lines.push(`-- Generated at: ${new Date().toISOString()}`);
    lines.push('-- ');
    lines.push('SET client_encoding = \'UTF8\';');
    lines.push('');

    const tables: { table_name: string }[] = await this.dataSource.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
       ORDER BY table_name`,
    );

    for (const { table_name } of tables) {
      lines.push(`-- ============================================`);
      lines.push(`-- Table: ${table_name}`);
      lines.push(`-- ============================================`);

      const rows: Record<string, unknown>[] = await this.dataSource.query(
        `SELECT * FROM "${table_name}"`,
      );

      if (rows.length === 0) {
        lines.push(`-- (no data)`);
        lines.push('');
        continue;
      }

      const columns = Object.keys(rows[0]);
      const colList = columns.map((c) => `"${c}"`).join(', ');

      for (const row of rows) {
        const values = columns.map((c) => this.formatValue(row[c])).join(', ');
        lines.push(
          `INSERT INTO "${table_name}" (${colList}) VALUES (${values});`,
        );
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  private formatValue(value: unknown): string {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
    if (value instanceof Date) return `'${value.toISOString()}'`;
    if (typeof value === 'object') {
      return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
    }
    return `'${String(value).replace(/'/g, "''")}'`;
  }

  private formatDate(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
  }

  private async sendBackupEmail(filePath: string, fileName: string) {
    const host = this.configService.get<string>('MAIL_HOST');
    const port = Number(this.configService.get<string>('MAIL_PORT', '587'));
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASS');
    const from = this.configService.get<string>('MAIL_FROM') ?? user;
    const to = this.configService.get<string>('MAIL_TO');

    if (!host || !user || !pass || !to) {
      throw new Error(
        'Thiếu cấu hình email. Cần thiết: MAIL_HOST, MAIL_USER, MAIL_PASS, MAIL_TO trong .env',
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const today = new Date().toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
    });

    await transporter.sendMail({
      from,
      to,
      subject: `[Inventory] Backup database ${today}`,
      text: `File backup database (định dạng SQL) được đính kèm.\nNgày tạo: ${today}\n\n-- Inventory System`,
      attachments: [{ filename: fileName, path: filePath }],
    });
  }
}
