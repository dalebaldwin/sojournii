/**
 * Middleware to get the authenticated Clerk user ID
 * @param {Object} ctx - Convex context
 * @returns {string|null} - Clerk user ID or null if not authenticated
 */
export async function getClerkUserId(ctx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    return null
  }

  // Extract just the user ID part from the token identifier
  // tokenIdentifier format: "https://domain.clerk.accounts.dev|user_123456"
  const userId = identity.tokenIdentifier.split('|')[1]

  return userId
}

/**
 * Middleware to ensure user is authenticated
 * @param {Object} ctx - Convex context
 * @returns {string} - Clerk user ID
 * @throws {Error} - If user is not authenticated
 */
export async function requireAuth(ctx) {
  const userId = await getClerkUserId(ctx)
  if (!userId) {
    throw new Error('Authentication required')
  }
  return userId
}

/**
 * RLS policy: Check if the document belongs to the authenticated user
 * @param {Object} ctx - Convex context
 * @param {Object} doc - Document to check
 * @returns {boolean} - True if user can access the document
 */
export async function canAccessDocument(ctx, doc) {
  const userId = await getClerkUserId(ctx)
  if (!userId) {
    return false
  }

  // Check if the document's user_id matches the authenticated user
  return doc.user_id === userId
}
