import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TenantContextService } from '../../../common/services/tenant-context.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly tenantContextService: TenantContextService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET ||
        'koO8FUa++TwmfMTAT2zSR8LtAgK6AoBAwodv6XrWfeU=',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const headerTenantId = req.headers['x-tenant-id'] as string;

    if (!headerTenantId) {
      if (!payload.tenantId) {
        throw new UnauthorizedException('Tenant ID is required');
      }
      this.tenantContextService.setTenantId(payload.tenantId);
    } else {
      if (payload.tenantId && payload.tenantId !== headerTenantId) {
        throw new UnauthorizedException(
          'Tenant ID mismatch between token and request',
        );
      }
      this.tenantContextService.setTenantId(headerTenantId);
    }

    return {
      userId: payload.sub,
      email: payload.email,
      tenantId: headerTenantId || payload.tenantId,
      roles: payload.roles,
    };
  }
}
