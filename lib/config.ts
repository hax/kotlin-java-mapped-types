import { fileURLToPath } from 'url';

function resolveFromRoot(relativePath: string) {
    return fileURLToPath(import.meta.resolve(`../${relativePath}`));
}

export const CACHE_PATH = resolveFromRoot('.cache');
export const DEFS_DIR = resolveFromRoot('.defs');
export const MAPPED_TYPES_FILE = resolveFromRoot('mapped-types.md');
