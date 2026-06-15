// ============================================
// BILLING CONFIGURATION
// ============================================

/* Trial days */
export const TRIAL_DAYS = 7

// ============================================
// R2 STORAGE CONFIGURATION
// ============================================

/* Presigned URL TTL in seconds */
export const PRESIGNED_URL_TTL_SECONDS = 900 // 15 min to complete the upload

/* Temp cleanup threshold in milliseconds */
export const TEMP_CLEANUP_THRESHOLD_MS = 2 * 60 * 60 * 1000 // 2 hours

/* Maximum file size in MB */
export const MAX_FILE_SIZE_MB = 5

/* Maximum file size in bytes */
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
