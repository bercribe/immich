import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { IMMICH_SHARED_LINK_ACCESS_COOKIE } from 'src/constants';
import { AssetIdsResponseDto } from 'src/dtos/asset-ids.response.dto';
import { AssetIdsDto } from 'src/dtos/asset.dto';
import { AuthDto, Permission } from 'src/dtos/auth.dto';
import {
  SharedLinkCreateDto,
  SharedLinkEditDto,
  SharedLinkPasswordDto,
  SharedLinkResponseDto,
} from 'src/dtos/shared-link.dto';
import { Auth, Authenticated } from 'src/middleware/auth.guard';
import { SharedLinkService } from 'src/services/shared-link.service';
import { UUIDParamDto } from 'src/validation';

@ApiTags('Shared Link')
@Controller('shared-link')
export class SharedLinkController {
  constructor(private service: SharedLinkService) {}

  @Get()
  @Authenticated(Permission.SHARED_LINK_READ)
  getAllSharedLinks(@Auth() auth: AuthDto): Promise<SharedLinkResponseDto[]> {
    return this.service.getAll(auth);
  }

  @Get('me')
  @Authenticated(Permission.SHARED_LINK_READ, { sharedLink: true })
  async getMySharedLink(
    @Auth() auth: AuthDto,
    @Query() dto: SharedLinkPasswordDto,
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SharedLinkResponseDto> {
    const sharedLinkToken = request.cookies?.[IMMICH_SHARED_LINK_ACCESS_COOKIE];
    if (sharedLinkToken) {
      dto.token = sharedLinkToken;
    }
    const response = await this.service.getMine(auth, dto);
    if (response.token) {
      res.cookie(IMMICH_SHARED_LINK_ACCESS_COOKIE, response.token, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        httpOnly: true,
        sameSite: 'lax',
      });
    }
    return response;
  }

  @Get(':id')
  @Authenticated(Permission.SHARED_LINK_READ)
  getSharedLinkById(@Auth() auth: AuthDto, @Param() { id }: UUIDParamDto): Promise<SharedLinkResponseDto> {
    return this.service.get(auth, id);
  }

  @Post()
  @Authenticated(Permission.SHARED_LINK_CREATE)
  createSharedLink(@Auth() auth: AuthDto, @Body() dto: SharedLinkCreateDto) {
    return this.service.create(auth, dto);
  }

  @Patch(':id')
  @Authenticated(Permission.SHARED_LINK_UPDATE)
  updateSharedLink(
    @Auth() auth: AuthDto,
    @Param() { id }: UUIDParamDto,
    @Body() dto: SharedLinkEditDto,
  ): Promise<SharedLinkResponseDto> {
    return this.service.update(auth, id, dto);
  }

  @Delete(':id')
  @Authenticated(Permission.SHARED_LINK_DELETE)
  removeSharedLink(@Auth() auth: AuthDto, @Param() { id }: UUIDParamDto): Promise<void> {
    return this.service.remove(auth, id);
  }

  @Put(':id/assets')
  @Authenticated(Permission.SHARED_LINK_UPDATE, { sharedLink: true })
  addSharedLinkAssets(
    @Auth() auth: AuthDto,
    @Param() { id }: UUIDParamDto,
    @Body() dto: AssetIdsDto,
  ): Promise<AssetIdsResponseDto[]> {
    return this.service.addAssets(auth, id, dto);
  }

  @Delete(':id/assets')
  @Authenticated(Permission.SHARED_LINK_DELETE, { sharedLink: true })
  removeSharedLinkAssets(
    @Auth() auth: AuthDto,
    @Param() { id }: UUIDParamDto,
    @Body() dto: AssetIdsDto,
  ): Promise<AssetIdsResponseDto[]> {
    return this.service.removeAssets(auth, id, dto);
  }
}
