import { Injectable } from '@nestjs/common';
import { getAppVersion } from './common/utils/version';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'cocobu-api',
      version: getAppVersion(),
    };
  }
}
