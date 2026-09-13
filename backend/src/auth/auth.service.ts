import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const SALT_ROUNDS = 10;

/** A user object that is safe to send over the API (no password hash). */
export type SafeUser = {
  id: number;
  username: string;
  email: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Creates a new account. Every user starts with the same access and can
   * use the whole app.
   */
  async register(dto: RegisterDto): Promise<{ accessToken: string; user: SafeUser }> {
    await this.ensureUnique(dto.username, dto.email);

    const user = this.users.create({
      username: dto.username,
      email: dto.email,
      passwordHash: await bcrypt.hash(dto.password, SALT_ROUNDS),
      active: true,
    });
    await this.users.save(user);

    return this.buildLoginResponse(user);
  }

  /** Verifies credentials and issues a signed JWT. */
  async login(dto: LoginDto): Promise<{ accessToken: string; user: SafeUser }> {
    const user = await this.findByIdentifier(dto.identifier);
    if (!user) {
      throw new UnauthorizedException('Invalid username/email or password');
    }
    if (!user.active) {
      throw new UnauthorizedException('This account has been disabled');
    }

    const passwordOk = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordOk) {
      throw new UnauthorizedException('Invalid username/email or password');
    }

    return this.buildLoginResponse(user);
  }

  private async buildLoginResponse(
    user: User,
  ): Promise<{ accessToken: string; user: SafeUser }> {
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      username: user.username,
    });
    return { accessToken, user: this.toSafeUser(user) };
  }

  /** Fetches a user by the identifier string from the login form. */
  async findByIdentifier(identifier: string): Promise<User | null> {
    return (
      (await this.users.findOneBy({ username: identifier })) ??
      (await this.users.findOneBy({ email: identifier }))
    );
  }

  /** Throws 409 if the username or email is already taken. */
  private async ensureUnique(username: string, email: string): Promise<void> {
    const existing = await this.users.findOne({
      where: [{ username }, { email }],
    });
    if (existing) {
      const taken =
        existing.username.toLowerCase() === username.toLowerCase()
          ? username
          : email;
      throw new ConflictException(`${taken} is already taken`);
    }
  }

  /** Strips the password hash before anything leaves the service. */
  toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}