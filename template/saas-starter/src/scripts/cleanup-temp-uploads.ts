/**
 * @fileoverview Deletes uploads that were never confirmed, such as a logo
 * picked and then abandoned. Run it on a schedule (for example hourly) with
 * `bun run storage:cleanup`.
 */

import { cleanupTempUploads, isR2Configured } from '~/lib/storage'

if (import.meta.main) {
  if (!isR2Configured()) {
    console.info('R2 is not configured; there are no temporary uploads.')
    process.exit(0)
  }

  cleanupTempUploads()
    .then(({ deleted, errors }) => {
      console.info(`Deleted ${deleted} temporary uploads; ${errors} failed.`)
      process.exit(errors ? 1 : 0)
    })
    .catch(err => {
      console.error('Error cleaning up temporary uploads:', err)
      process.exit(1)
    })
}
