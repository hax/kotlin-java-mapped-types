import { setOfflineMode } from '../fetch-text.ts';

const offlineMode = process.argv.includes('--offline');
if (offlineMode) {
    console.log('Running in offline mode (using only cache)...\n');
    setOfflineMode(true);
}
