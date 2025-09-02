# Supabase SSR Setup

This project uses Supabase with Server-Side Rendering (SSR) support for Next.js App Router, following the official [Supabase SSR documentation](https://supabase.com/docs/guides/auth/server-side/creating-a-client).

## File Structure

```
src/
├── client/auth/
│   └── supabase.ts        # All client-side Supabase utilities
├── server/
│   └── supabase.ts        # All server-side Supabase utilities
└── middleware.ts          # Route protection middleware
```

## Client-Side (`src/client/auth/supabase.ts`)

Contains all client-side Supabase functionality:

### Exports:
- `createClient()` - Factory function for creating new client instances
- `supabase` - Singleton instance for direct usage

### Usage:
```typescript
import { supabase, createClient } from '@/client/auth/supabase'

// Use singleton (most common)
const { data: { user } } = await supabase.auth.getUser()

// Or create new instance
const supabaseClient = createClient()
const { data: session } = await supabaseClient.auth.getSession()
```

## Server-Side (`src/server/supabase.ts`)

Contains all server-side Supabase functionality:

### Exports:
- `createClient()` - SSR server client with cookie handling
- `supabaseAdmin` - Admin client with elevated permissions  
- `createSupabaseAdminClient()` - Factory for admin clients
- `updateSession()` - Middleware utility for route protection

### Usage:

#### SSR Server Client
```typescript
import { createClient } from '@/server/supabase'

// In Server Components
export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  return <div>Hello {user?.email}</div>
}

// In API Routes
export async function GET() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // ... rest of API logic
}
```

#### Admin Client
```typescript
import { supabaseAdmin } from '@/server/supabase'

// For operations that bypass RLS
const { data: users } = await supabaseAdmin
  .from('users')
  .select('*')
```

#### Middleware
```typescript
import { updateSession } from '@/server/supabase'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}
```

## Authentication Flow

1. **Login**: User enters email in `LoginModal`
2. **Magic Link**: Supabase sends magic link to user's email  
3. **Callback**: User clicks link → redirected to `/auth/callback`
4. **Session**: Callback page exchanges code for session
5. **Dashboard**: User redirected to `/dashboard`
6. **Protection**: Middleware protects routes, redirects unauthenticated users

## Protected Routes

The following routes require authentication:
- `/dashboard/*`
- `/create/*` 
- `/settings/*`
- `/lists/drafts/*`

Unauthenticated users are redirected to the homepage (`/`) where they can access the `LoginModal`.

## Key Benefits

✅ **Server-Side Rendering** - Authenticated content renders on server  
✅ **SEO Optimized** - Critical for listicle platform discoverability  
✅ **Automatic Cookie Management** - Sessions work seamlessly across SSR  
✅ **Route Protection** - Middleware-level authentication checks  
✅ **Type Safety** - Full TypeScript support throughout  
✅ **Backward Compatibility** - Existing code continues to work  

## Environment Variables

Required environment variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Migration from Old Pattern

### Client-Side (No Changes Needed)
```typescript
// This continues to work as before
import { supabase } from '@/client/auth/supabase'
```

### Server-Side 
```typescript
// Before
import { supabaseAdmin } from '@/server/supabase'

// After (admin operations - unchanged)
import { supabaseAdmin } from '@/server/supabase'

// New (user session handling)
import { createClient } from '@/server/supabase'
const supabase = await createClient()
```

## Implementation Notes

- **Always use `await createClient()`** for server-side user session handling
- **Client-side usage doesn't need await**: `createClient()` or use the `supabase` singleton
- **Middleware handles cookie management automatically** - no manual session refresh needed
- **Use admin client only for operations that need to bypass Row Level Security**
- **Server Components can access user data at render time** for better SEO 