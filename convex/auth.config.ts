export default {
  providers: [
    {
      domain: 'clerk',
      applicationID: 'clerk',
    },
  ],
  getUserMetadata: async (
    _ctx: unknown,
    args: {
      tokenIdentifier: string
      email: string
      name: string
      pictureUrl: string
    }
  ) => {
    // This function is called when a user signs in
    // We'll use the Clerk user ID as the token identifier for RLS
    const { tokenIdentifier, email, name, pictureUrl } = args

    return {
      tokenIdentifier, // This will be the Clerk user ID
      email,
      name,
      pictureUrl,
    }
  },
}
