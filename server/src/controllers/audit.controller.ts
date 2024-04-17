import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  AuditDeletesDto,
  AuditDeletesResponseDto,
  FileChecksumDto,
  FileChecksumResponseDto,
  FileReportDto,
  FileReportFixDto,
} from 'src/dtos/audit.dto';
import { AuthDto, Permission } from 'src/dtos/auth.dto';
import { Auth, Authenticated } from 'src/middleware/auth.guard';
import { AuditService } from 'src/services/audit.service';

@ApiTags('Audit')
@Controller('audit')
export class AuditController {
  constructor(private service: AuditService) {}

  @Get('deletes')
  @Authenticated(Permission.ASSET_READ)
  getAuditDeletes(@Auth() auth: AuthDto, @Query() dto: AuditDeletesDto): Promise<AuditDeletesResponseDto> {
    return this.service.getDeletes(auth, dto);
  }

  @Get('file-report')
  @Authenticated(Permission.REPORT_READ)
  getAuditFiles(): Promise<FileReportDto> {
    return this.service.getFileReport();
  }

  @Post('file-report/checksum')
  @Authenticated(Permission.REPORT_READ)
  getFileChecksums(@Body() dto: FileChecksumDto): Promise<FileChecksumResponseDto[]> {
    return this.service.getChecksums(dto);
  }

  @Post('file-report/fix')
  @Authenticated(Permission.REPORT_UPDATE)
  fixAuditFiles(@Body() dto: FileReportFixDto): Promise<void> {
    return this.service.fixItems(dto.items);
  }
}
