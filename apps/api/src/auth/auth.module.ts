import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';
        const jwtSecret = configService.get<string>('JWT_SECRET');

        // In production, JWT_SECRET must be set
        if (isProduction && !jwtSecret) {
          throw new Error('JWT_SECRET must be set in production environment');
        }

        // In development, use a default secret if not provided
        const secret = jwtSecret || 'dev-secret-change-in-production-use-openssl-rand-hex-32';

        return {
          secret,
          signOptions: {
            expiresIn: '7d',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
