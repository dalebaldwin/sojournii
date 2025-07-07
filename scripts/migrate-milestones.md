# Milestone Events Migration Guide

This guide helps you migrate milestone events from numeric values to string literals.

## What Changed

- **Before**: `event: 0` (number)
- **After**: `event: 'joined_sojournii'` (string literal)

## Migration Mapping

| Old Value | New Value            |
| --------- | -------------------- |
| `0`       | `'joined_sojournii'` |
| `1`       | `'new_employer'`     |

## Running the Migration

### Step 1: Check Migration Status

First, check how many milestones need migration:

```javascript
// In Convex Dashboard or your app
await convex.query(api.migrations.checkMilestonesMigrationNeeded)
```

### Step 2: Run the Migration

Execute the migration in batches:

```javascript
// Migrate in batches of 100 (default)
const result = await convex.mutation(api.migrations.migrateMilestoneEvents, {})

// Or specify a custom batch size
const result = await convex.mutation(api.migrations.migrateMilestoneEvents, {
  batchSize: 50,
})
```

### Step 3: Check Results

The migration returns:

- `migratedCount`: Number of successfully migrated milestones
- `remainingCount`: Number of milestones still needing migration
- `errors`: Array of any errors encountered
- `hasMore`: Whether there are more milestones to migrate

### Step 4: Repeat if Necessary

If `hasMore` is `true`, run the migration again until all milestones are converted.

## Schema Changes Made

1. **Schema**: `convex/schema.ts`
   - Changed `event: v.number()` to `event: v.union(v.literal('joined_sojournii'), v.literal('new_employer'))`

2. **Constants**: `src/lib/milestone-events.ts`
   - Updated values from numbers to strings
   - Added migration mapping

3. **Database Operations**: `convex/accountSettings.ts`
   - Updated milestone creation to use string literals

## Verification

After migration, verify the changes:

```javascript
// Check all milestones have string events
const milestones = await convex.query(api.milestones.getAllMilestones)
console.log(
  'All events are strings:',
  milestones.every(m => typeof m.event === 'string')
)
```

## Rollback (if needed)

If you need to rollback, you can create a reverse migration using the same pattern but mapping strings back to numbers.
