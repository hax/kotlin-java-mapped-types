import { fileURLToPath } from 'url';

function resolveFromRoot(relativePath: string) {
    return fileURLToPath(import.meta.resolve(`../${relativePath}`));
}

export const CACHE_PATH = resolveFromRoot('doc-cache');
export const MAPPINGS_DIR = resolveFromRoot('mappings');
export const MAPPED_TYPES_FILE = resolveFromRoot('mapped-types.yaml');
export const MAPPED_TYPES_DETAILS_FILE = resolveFromRoot('mapped-types-details.yaml');
