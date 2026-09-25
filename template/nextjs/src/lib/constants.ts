/**
 * @fileoverview Application-wide constants for configuration and validation.
 *
 * Read limits, labels, and repeated values from here in the UI, validation,
 * tests, and docs, so one change updates every place.
 *
 * @module lib/constants
 */

// ============================================
// REQUEST ARRAY BOUNDS
// ============================================

/*
 * Ceilings for arrays that reach SQL as an `IN (…)` list. Postgres caps a
 * statement at 65535 bind parameters, and an unbounded array also builds in
 * server memory first.
 */

/** Values accepted in one list-filter array, such as status facets */
export const MAX_FILTER_VALUES = 100
