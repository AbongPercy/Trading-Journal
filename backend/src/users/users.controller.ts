import {
  Controller,
  Get,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

/**
 * Only one user endpoint exists: who am I?
 * It's used to restore a session from a stored token.
 */
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /api/users/me — who am I?
  @Get('me')
  async me(@CurrentUser() user: { id: number }) {
    const fresh = await this.usersService.findById(user.id);
    if (!fresh) {
      throw new UnauthorizedException('Account no longer exists');
    }
    return this.usersService.toSafeUser(fresh);
  }
}