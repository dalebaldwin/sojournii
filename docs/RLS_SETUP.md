# Row-Level Security (RLS) Setup

This document explains the row-level security implementation for the Sojournii application using Convex and Clerk authentication.

## Overview

Row-level security ensures that users can only access data that belongs to them. This is implemented through:

1. **Authentication Middleware** - Gets the Clerk user ID from the authentication context
2. **RLS Policies** - Enforces that users can only access their own documents
3. **Convex Queries & Mutations** - Apply RLS checks before performing database operations

## Architecture

### 1. Authentication Middleware (`convex/lib/auth.js`)

```javascript
// Get the authenticated Clerk user ID
export async function getClerkUserId(ctx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    return null
  }
  return identity.tokenIdentifier // This is the Clerk user ID
}

// Ensure user is authenticated
export async function requireAuth(ctx) {
  const userId = await getClerkUserId(ctx)
  if (!userId) {
    throw new Error('Authentication required')
  }
  return userId
}

// RLS policy: Check if document belongs to authenticated user
export async function canAccessDocument(ctx, doc) {
  const userId = await getClerkUserId(ctx)
  if (!userId) {
    return false
  }
  return doc.user_id === userId
}
```

### 2. Convex Auth Configuration (`convex/auth.config.js`)

```javascript
export default defineAuth({
  providers: [
    {
      domain: 'clerk',
      applicationID: 'clerk',
    },
  ],
  getUserMetadata: async (ctx, args) => {
    const { tokenIdentifier, email, name, pictureUrl } = args
    return {
      tokenIdentifier, // Clerk user ID used for RLS
      email,
      name,
      pictureUrl,
    }
  },
})
```

### 3. Account Settings Schema (`convex/schema.ts`)

```typescript
export default defineSchema({
  account_settings: defineTable({
    user_id: v.string(), // Clerk user ID for RLS
    email: v.string(),
    onboarding_completed: v.boolean(),
    weekly_reminder: v.boolean(),
    weekly_reminder_hour: v.number(),
    weekly_reminder_minute: v.number(),
    weekly_reminder_day: v.union(
      v.literal('monday'),
      v.literal('tuesday'),
      v.literal('wednesday'),
      v.literal('thursday'),
      v.literal('friday'),
      v.literal('saturday'),
      v.literal('sunday')
    ),
    weekly_reminder_time_zone: v.string(),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index('bu_user', ['user_id']) // Index for efficient RLS queries
    .index('by_email', ['email']),
})
```

## RLS Implementation

### Queries

All queries use the `getClerkUserId` middleware to ensure users only see their own data:

```typescript
export const getAccountSettings = query({
  handler: async ctx => {
    const userId = await getClerkUserId(ctx)
    if (!userId) {
      return null
    }

    // RLS: Only return settings for the authenticated user
    const settings = await ctx.db
      .query('account_settings')
      .withIndex('bu_user', q => q.eq('user_id', userId))
      .first()

    return settings
  },
})
```

### Mutations

All mutations use the `requireAuth` and `canAccessDocument` middleware:

```typescript
export const updateAccountSettings = mutation({
  args: {
    /* ... */
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx) // Ensure user is authenticated

    const settings = await ctx.db.get(args.id)
    if (!settings) {
      throw new Error('Account settings not found')
    }

    // RLS: Ensure user can only update their own settings
    if (!(await canAccessDocument(ctx, settings))) {
      throw new Error('Access denied: You can only update your own settings')
    }

    // Proceed with update...
  },
})
```

## React Query Integration

The application uses React Query for state management with proper RLS-aware hooks:

```typescript
// Query key factory for account settings
const accountSettingsKeys = {
  all: ['accountSettings'] as const,
  current: () => [...accountSettingsKeys.all, 'current'] as const,
  onboarding: () => [...accountSettingsKeys.all, 'onboarding'] as const,
  reminders: () => [...accountSettingsKeys.all, 'reminders'] as const,
}

// Hook to get current user's account settings
export function useAccountSettings() {
  const { isAuthenticated } = useConvexAuth()

  return useQuery({
    queryKey: accountSettingsKeys.current(),
    queryFn: async () => {
      // Convex handles the RLS automatically
      return null
    },
    enabled: isAuthenticated, // Only run when authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}
```

## Security Features

1. **Authentication Required**: All operations require a valid Clerk session
2. **User Isolation**: Users can only access their own data
3. **Index Optimization**: Database queries use indexes for efficient RLS filtering
4. **Error Handling**: Clear error messages for unauthorized access attempts
5. **Type Safety**: TypeScript ensures proper typing of user IDs and data

## Usage Example

```typescript
// In a React component
function AccountSettings() {
  const { data: settings, isLoading } = useAccountSettings()
  const updateSettings = useUpdateAccountSettings()

  const handleUpdate = async newData => {
    await updateSettings.mutateAsync({
      id: settings._id,
      ...newData,
    })
  }

  // RLS is automatically enforced - users can only see/update their own settings
}
```

## Environment Variables

Ensure these environment variables are set:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Convex
NEXT_PUBLIC_CONVEX_URL=https://...
```

## Deployment

1. Deploy the Convex schema: `npx convex dev`
2. Ensure Clerk webhook is configured for Convex
3. Test RLS by creating multiple user accounts and verifying data isolation

## Testing RLS

To test that RLS is working correctly:

1. Create two different user accounts
2. Each user should only see their own account settings
3. Attempting to access another user's data should return null or throw an error
4. All mutations should only affect the authenticated user's data
