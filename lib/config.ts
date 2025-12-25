import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of this file
const __dirname = dirname(fileURLToPath(import.meta.url));

// Resolve paths relative to the project root (one level up from lib/)
function resolveFromRoot(relativePath: string) {
    return join(__dirname, '..', relativePath);
}

export const CACHE_PATH = resolveFromRoot('.cache');
export const DEFS_DIR = resolveFromRoot('.defs');
export const MAPPED_TYPES_FILE = resolveFromRoot('mapped-types');
