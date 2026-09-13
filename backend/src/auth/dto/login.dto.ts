import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * Body for POST /api/auth/login. The identifier is either the username
 * or the email - we let the service figure out which one it is.
 */
export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'identifier is required' })
  @MaxLength(150)
  identifier: string;

  @IsString()
  @IsNotEmpty({ message: 'password is required' })
  password: string;
}