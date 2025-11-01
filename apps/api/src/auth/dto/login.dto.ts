import {
  IsString,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AUTH_CONSTANTS } from '../../common/constants/auth.constants';

export class LoginDto {
  @ApiProperty({
    example: 'my-user-id',
    description:
      'User ID consisting of lowercase letters, numbers, or hyphen (3-64 characters)',
  })
  @IsString()
  @Matches(AUTH_CONSTANTS.USER_ID_REGEX, {
    message: 'User ID can only contain lowercase letters, numbers, and hyphen',
  })
  @MinLength(AUTH_CONSTANTS.USER_ID_MIN_LENGTH)
  @MaxLength(AUTH_CONSTANTS.USER_ID_MAX_LENGTH)
  userId!: string;
}
