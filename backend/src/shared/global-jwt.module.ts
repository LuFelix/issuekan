// shared/global-jwt.module.ts
import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');

        return {
          secret: secret,
          signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') as any },
        };
      },
    }),
  ],
  exports: [JwtModule],
})
export class GlobalJwtModule {}