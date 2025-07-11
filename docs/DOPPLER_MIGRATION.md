# Doppler Environment Variables Migration

## Overview

This project has been migrated from using local `.env` files to Doppler for environment variable management. This provides better security, team collaboration, and environment synchronization.

## Current Setup

### Environment Variables in Doppler

The following environment variables are now managed via Doppler:

- `NEXT_PUBLIC_CONVEX_URL` - Convex backend URL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk authentication public key
- `CLERK_SECRET_KEY` - Clerk authentication secret key
- `CLERK_DOMAIN` - Clerk domain configuration
- `NEXT_PUBLIC_CLERK_FRONTEND_API_URL` - Clerk frontend API URL
- `CONVEX_DEPLOYMENT` - Convex deployment identifier

### Commands Updated

All npm scripts have been updated to use `doppler run`:

- `npm run dev` → `doppler run -- next dev --turbopack`
- `npm run build` → `doppler run -- next build`
- `npm run start` → `doppler run -- next start`
- `npm run convex` → `doppler run -- npx convex dev`

### Fallback Commands

Local commands are still available (without Doppler):

- `npm run dev:local` → `next dev --turbopack`
- `npm run convex:local` → `npx convex dev`

## Usage

### Development

```bash
# Start development server with Doppler
npm run dev

# Start Convex backend with Doppler
npm run convex
```

### Production

```bash
# Build with Doppler
npm run build

# Start production server with Doppler
npm run start
```

### Managing Environment Variables

#### View all secrets

```bash
doppler secrets
```

#### Get specific secret

```bash
doppler secrets get NEXT_PUBLIC_CONVEX_URL
```

#### Set/update secret

```bash
doppler secrets set VARIABLE_NAME="value"
```

#### Download secrets as .env file (for backup)

```bash
doppler secrets download --no-file --format env > .env.backup
```

## Configuration

### Current Doppler Configuration

- **Project**: `next-app`
- **Environment**: `dev`
- **Config**: `dev_personal`

### Switching Environments

```bash
# Switch to different environment
doppler configure set config dev_staging

# Or set project-wide
doppler configure set project your-project-name
```

## Migration Details

### What Was Changed

1. **Package.json**: Updated scripts to use `doppler run`
2. **Error Messages**: Updated to reference Doppler instead of `.env` files
3. **Environment Variables**: Migrated all variables from `.env.local` to Doppler
4. **Backup**: Created `.env.local.backup` for reference

### Files Modified

- `package.json` - Updated scripts
- `src/components/providers/convex-provider.tsx` - Updated error messages
- `docs/DOPPLER_MIGRATION.md` - This documentation

### Backup Files

- `.env.local.backup` - Original environment variables (for reference)

## Benefits

✅ **Security**: No more sensitive keys in local files  
✅ **Team Collaboration**: Easy to share configs with team members  
✅ **Environment Management**: Easy switching between dev/staging/prod  
✅ **Synchronization**: Environment variables sync across all devices  
✅ **Audit Trail**: Track changes to environment variables  
✅ **Compliance**: Better security practices for sensitive data

## Troubleshooting

### Environment Variables Not Found

If you get errors about missing environment variables:

1. Check if the variable exists in Doppler:

   ```bash
   doppler secrets get VARIABLE_NAME
   ```

2. Verify Doppler configuration:

   ```bash
   doppler configure
   ```

3. Test Doppler connection:
   ```bash
   doppler run -- env | grep VARIABLE_NAME
   ```

### Fallback to Local Development

If Doppler is not available, use local commands:

```bash
npm run dev:local
npm run convex:local
```

### Reset Doppler Configuration

If you need to reconfigure Doppler:

```bash
doppler configure
```

## Security Notes

- Never commit `.env` files to version control
- Use Doppler for all sensitive environment variables
- Regularly rotate secrets and API keys
- Use different Doppler configs for different environments

## Next Steps

1. **Team Setup**: Share Doppler project access with team members
2. **CI/CD**: Configure Doppler for deployment pipelines
3. **Staging/Production**: Set up separate Doppler configs for other environments
4. **Monitoring**: Set up Doppler webhooks for environment variable changes
