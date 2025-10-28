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
    const versionValue = packageJson.version || '0.1.0';
    version = versionValue;
    return versionValue;
  } catch {
    // Fallback if package.json cannot be read
    const fallbackVersion = '0.1.0';
    version = fallbackVersion;
    return fallbackVersion;
  }
}
