import type { IAuthenticatedUser } from '@app/auth';
import { JwtAuthGuard, LocalAuthGuard } from '@app/auth';
import { Body, Controller, Ip, Post, Put, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '../../../decorators/user.decorator';
import {
  IAuthLoginDTO,
  IAuthLoginResponseDTO,
  IAuthPutPasswordDTO,
} from './auth.dto';
import { IAuthLoginPromise } from './auth.interface';
import { AuthenticationControllerService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly controllerService: AuthenticationControllerService,
  ) {}

  @ApiOperation({
    summary: 'Sign in with username and password',
    description:
      'Authenticates a user using user and pass to get the access_token.',
  })
  @ApiBody({ type: IAuthLoginDTO })
  @ApiResponse({
    status: 201,
    description: 'Authenticated successfully.',
    type: IAuthLoginResponseDTO,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @UseGuards(LocalAuthGuard)
  @Post()
  async login(
    @Body() body: IAuthLoginDTO,
    @User() user: IAuthenticatedUser,
    @Ip() ip: string,
  ): Promise<IAuthLoginPromise> {
    return await this.controllerService.login({ user, ip });
  }

  @ApiOperation({
    summary: 'Update the authenticated user password',
    description:
      'Validates the current password and replaces it with a new one for the authenticated user.',
  })
  @ApiBearerAuth('bearer')
  @ApiBody({ type: IAuthPutPasswordDTO })
  @ApiResponse({ status: 200, description: 'Password updated successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed for the request body.',
  })
  @ApiResponse({
    status: 401,
    description: 'Missing/invalid token or wrong current password.',
  })
  @UseGuards(JwtAuthGuard)
  @Put('password')
  async update(
    @User() user: IAuthenticatedUser,
    @Ip() ip: string,
    @Body() body: IAuthPutPasswordDTO,
  ): Promise<void> {
    return await this.controllerService.update({
      body,
      ip,
      user,
    });
  }
}
