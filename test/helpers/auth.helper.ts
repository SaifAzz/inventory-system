import { JwtService } from '@nestjs/jwt';

/**
 * Generates a JWT token for testing
 */
export const generateTestJwtToken = (jwtService: JwtService): string => {
  return jwtService.sign({
    sub: 'test-user-id',
    username: 'testuser',
    roles: ['admin'],
  });
};
