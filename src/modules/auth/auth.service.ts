import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import {
  InvalidCredentialsException,
  UserAlreadyExistsException,
  UserExistsInAnotherTenantException,
  UserNotInTenantException,
} from '../../common/exceptions/auth.exceptions';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
    tenantId: string,
  ): Promise<any> {
    const user = await this.findUserByEmail(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await this.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    await this.verifyTenantAccess(user, tenantId);

    return this.sanitizeUser(user);
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      tenantId: user.tenantId,
      roles: user.roles,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
        tenantId: user.tenantId,
      },
    };
  }

  async findUserById(id: string, tenantId: string) {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new InvalidCredentialsException();
    }

    await this.verifyTenantAccess(user, tenantId);

    return this.sanitizeUser(user);
  }

  private async findUserByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  private async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  private async verifyTenantAccess(
    user: User,
    tenantId: string,
  ): Promise<void> {
    if (user.tenantId && user.tenantId !== tenantId) {
      throw new UserNotInTenantException(user.email, tenantId);
    }

    if (!user.tenantId) {
      user.tenantId = tenantId;
      await this.usersRepository.save(user);
    }
  }

  private sanitizeUser(user: User): any {
    const { ...result } = user;
    return result;
  }

  private async handleExistingUserRegistration(
    user: User,
    tenantId: string,
  ): Promise<any> {
    if (user.tenantId && user.tenantId !== tenantId) {
      throw new UserExistsInAnotherTenantException(user.email);
    }

    if (user.tenantId === tenantId) {
      throw new UserAlreadyExistsException(user.email);
    }

    user.tenantId = tenantId;
    await this.usersRepository.save(user);

    return this.sanitizeUser(user);
  }
}
