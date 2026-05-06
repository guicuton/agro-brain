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
  IAuthCreateDTO,
  IAuthLoginCreateResponseDTO,
  IAuthLoginDTO,
  IAuthLoginResponseDTO,
  IAuthPutPasswordDTO,
} from './auth.dto';
import { IAuthLoginCreatePromise, IAuthLoginPromise } from './auth.interface';
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
    @User() user: IAuthenticatedUser,
    @Ip() ip: string,
  ): Promise<IAuthLoginPromise> {
    return await this.controllerService.login({ user, ip });
  }

  @ApiOperation({
    summary: 'Create new user',
    description: 'Registered users can add new user',
  })
  @ApiBearerAuth('bearer')
  @ApiBody({ type: IAuthCreateDTO })
  @ApiResponse({
    status: 201,
    description: 'User created successfully.',
    type: IAuthLoginCreateResponseDTO,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed for the request body.',
  })
  @ApiResponse({
    status: 401,
    description: 'Missing/invalid token or wrong current password.',
  })
  @UseGuards(JwtAuthGuard)
  @Post('register')
  async register(
    @User() user: IAuthenticatedUser,
    @Ip() ip: string,
    @Body() body: IAuthCreateDTO,
  ): Promise<IAuthLoginCreatePromise> {
    return await this.controllerService.createOne({
      body,
      ip,
      user,
    });
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
