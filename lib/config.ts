import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the root directory of the project (parent of lib/)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

export const CACHE_PATH = join(rootDir, '.cache');
export const DEFS_DIR = join(rootDir, '.defs');
export const MAPPED_TYPES_FILE = join(rootDir, 'mapped-types');
