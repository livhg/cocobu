import { readFileSync } from 'fs';
import { join } from 'path';

let version: string | undefined;

export function getAppVersion(): string {
  if (version) {
    return version;
  }

  try {
    const packageJsonPath = join(__dirname, '../../../package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    version = packageJson.version || '0.1.0';
    return version;
  } catch {
    // Fallback if package.json cannot be read
    return '0.1.0';
  }
}
