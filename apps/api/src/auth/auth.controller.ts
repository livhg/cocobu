import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Res,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';
import { AUTH_CONSTANTS } from '../common/constants/auth.constants';

@ApiTags('Authentication')
@Controller('auth')
@Public()
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Helper method to set session cookie with consistent configuration
   * @param response Express response object
   * @param token JWT session token
   * @param forceInsecure Force secure flag to false (for dev-only endpoints)
   */
  private setSessionCookie(
    response: Response,
    token: string,
    forceInsecure = false
  ): void {
    response.cookie('session', token, {
      httpOnly: true,
      secure: forceInsecure ? false : process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: AUTH_CONSTANTS.COOKIE_MAX_AGE,
    });
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Request magic link login' })
  @ApiResponse({ status: 200, description: 'Magic link sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid email' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('verify')
  @ApiOperation({ summary: 'Verify magic link token' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  async verify(
    @Query('token') token: string,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.authService.verify(token);
    this.setSessionCookie(response, result.accessToken);
    return result;
  }

  @Get('dev-login')
  @ApiOperation({
    summary: 'Development-only: Login without email (bypass magic link)',
  })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({
    status: 400,
    description: 'Only available in development mode',
  })
  async devLogin(
    @Query('email') email: string,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.authService.devLogin(email);
    this.setSessionCookie(response, result.accessToken, true);
    return result;
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout user' })
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('session');
    return { message: 'Logged out successfully' };
  }
}
