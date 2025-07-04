// Clerk user type definition
export interface ClerkUser {
  id: string
  firstName?: string | null
  lastName?: string | null
  imageUrl?: string | null
  primaryEmailAddress?: {
    emailAddress?: string | null
  } | null
}

// Timezone type definition
export interface Timezone {
  value: string
  label: string
  city: string
  country: string
}
