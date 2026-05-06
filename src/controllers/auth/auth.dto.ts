import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { IAuthLoginCreatePromise, IAuthLoginPromise } from './auth.interface';

export class IAuthLoginDTO {
  @ApiProperty({
    description: 'Username',
    example: 'admin',
    minLength: 4,
    pattern: '^[A-Za-z0-9]+$',
  })
  @IsString()
  @MinLength(4)
  @Matches(/^[A-Za-z0-9]+$/)
  username: string;

  @ApiProperty({
    description: 'Password (min 4 chars, allowed: A-Z a-z 0-9 ! @ # $ _)',
    example: 'my_super_pass@!',
    minLength: 4,
    pattern: '^[A-Za-z0-9!@#$_]+$',
  })
  @IsString()
  @MinLength(4)
  @Matches(/^[A-Za-z0-9!@#$_]+$/)
  password: string;
}

export class IAuthPutPasswordDTO {
  @ApiProperty({
    description:
      'Current password (min 4 chars, allowed: A-Z a-z 0-9 ! @ # $ _)',
    example: 'OldPass_1',
    minLength: 4,
    pattern: '^[A-Za-z0-9!@#$_]+$',
  })
  @IsString()
  @MinLength(4)
  @Matches(/^[A-Za-z0-9!@#$_]+$/)
  currentPassword: string;

  @ApiProperty({
    description: 'New password (min 4 chars, allowed: A-Z a-z 0-9 ! @ # $ _)',
    example: 'NewPass_1',
    minLength: 4,
    pattern: '^[A-Za-z0-9!@#$_]+$',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @Matches(/^[A-Za-z0-9!@#$_]+$/)
  newPassword: string;
}

export class IAuthLoginResponseDTO implements IAuthLoginPromise {
  @ApiProperty({
    description: 'JWT access token. Use in `Authorization: Bearer <token>`',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;
}

export class IAuthCreateDTO {
  @ApiProperty({
    description: 'Username',
    example: 'johndoe',
    minLength: 4,
    pattern: '^[A-Za-z0-9]+$',
  })
  @IsString()
  @MinLength(4)
  @Matches(/^[A-Za-z0-9]+$/)
  username: string;

  @ApiProperty({
    description: 'New password (min 4 chars, allowed: A-Z a-z 0-9 ! @ # $ _)',
    example: 'NewPass_1',
    minLength: 4,
    pattern: '^[A-Za-z0-9!@#$_]+$',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @Matches(/^[A-Za-z0-9!@#$_]+$/)
  password: string;

  @ApiProperty({
    description: 'User email',
    example: 'test@test.com',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class IAuthLoginCreateResponseDTO implements IAuthLoginCreatePromise {
  @ApiProperty({ format: 'uuid' })
  id: string;
}
