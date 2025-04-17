import {
  Controller,
  Post,
  Body,
  Headers,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { TenantInterceptor } from '../../common/interceptors/tenant.Interceptor';
import {
  InvalidCredentialsException,
  MissingTenantIdException,
} from '../../common/exceptions/auth.exceptions';

@ApiTags('Auth')
@Controller('auth')
@UseInterceptors(TenantInterceptor)
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  async login(
    @Body() loginDto: LoginDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) {
      throw new MissingTenantIdException();
    }

    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
      tenantId,
    );

    if (!user) {
      throw new InvalidCredentialsException();
    }

    return this.authService.login(user);
  }
}
