### 🧠 Cursor Agent Technical Reference for *Listicle*

#### 📝 App Description
Listicle is a content creation platform that allows users to simply and effectively create beautiful, engaging listicles. Lists can be:
- **Ordered**
- **Reverse ordered**
- **Unordered**

Each list serves as a lightweight blog post, making **SEO a high priority** on all public-facing pages.

**Interactive Features:**
- Users can **save**, **comment**, and **react** to entire lists or individual list items
- List items can contain **text** or **rich media embeds**, including images, tweets, and YouTube videos

Over time, the app will introduce features to help users **discover personalized, relevant lists**.

You can think of it like **Medium, but for listicles**.

**Publications:**
- Users can create or be invited to join **publications**, similar to Medium
- Publications represent organizations or brands (e.g. Buzzfeed)
- Authors can publish lists under a publication
- Lists published to a publication will appear both on the **author's profile** and the **publication's page**

#### 1. **Project Overview**
- **Name**: Listicle
- **Stack**:
  - **Frontend**: Next.js (App Router)
  - **Backend**: Next.js (API routes)
  - **Database**: Supabase
  - **ORM**: Drizzle
  - **Design System**: Subframe (Tailwind CSS based)
  - **Hosting**: Vercel
  - **Email Service**: Resend

**Current Implementation Status:**
- ✅ **Completed**: Authentication system, database schema, user profiles, settings pages, dashboard, email utilities, error handling, rate limiting, moderation utilities, utility functions (slug generation, pagination, date formatting, media handling, metadata generation)
- 🚧 **In Progress**: Homepage with sample lists, API routes for profiles and OG images
- ⏳ **Planned**: List creation/editing, publication system, comments/reactions, user profile pages (`/@username`), list pages, email templates, search functionality

**URL Structure (Configured in next.config.js):**
- User profiles: `/@username` → `/profile/username` (route handler not yet implemented)
- User lists: `/@username/list-slug` → `/profile/username/list-slug` (route handler not yet implemented)
- Publications: `/pub/slug` → `/publication/slug` (route handler not yet implemented)
- Publication lists: `/pub/slug/list-slug` → `/publication/slug/list-slug` (route handler not yet implemented)

#### 2. **Authentication**
- **Provider**: Supabase Auth 
- **Login/Signup flow**: Handled by Supabase client SDK
- **Token handling**: Supabase handles JWT-based sessions internally, accessible via `supabase.auth.getSession()`
- **Protecting routes**:
  - Use Supabase middleware or server-side checks in `middleware.ts` or server functions.
  - Client-side route protection can be implemented via session check wrappers.

**Note**: Clerk (`@clerk/nextjs`) is installed as a dependency but not currently used. This should be removed if Supabase Auth is the chosen solution, or the authentication system should be migrated to Clerk if preferred.

**Package Name**: The project is currently named "subframe-nextjs-starter-kit" in package.json but should be renamed to "listicle" to match the project.

**App Metadata**: The root layout still shows "Subframe Next.js Starter" as the title and should be updated to reflect the Listicle branding.

#### 3. **API Design**
- **Base URL**: `/api` (internal Next.js API routes)
- **Internal API routes**: Use Next.js App Router `/app/api/*`
- **Endpoint validation**:
  - **Library**: `zod`
  - **Structure**: Validation schemas are defined in `shared/validation`
  - **Example**:
    ```ts
    import { z } from 'zod';

    const createListSchema = z.object({
      title: z.string().min(1),
      items: z.array(z.string().min(1)),
    });

    export type CreateListInput = z.infer<typeof createListSchema>;
    ```

#### 4. **File Structure**
```bash
src/
├── app/                 # App Router pages and layouts
│   ├── api/             # API route handlers
│   │   ├── profile/     # Profile API routes
│   │   └── og/          # Open Graph image generation
│   ├── auth/            # Authentication pages
│   │   └── callback/    # Auth callback handler
│   ├── dashboard/       # User dashboard
│   ├── settings/        # User settings pages
│   ├── sitemap.xml/     # Dynamic sitemap generation
│   ├── layout.tsx       # Root layout with Toaster
│   ├── page.tsx         # Homepage
│   ├── globals.css      # Global styles
│   └── favicon.ico      # App icon
├── client/              # Client-side code
│   ├── auth/            # Auth utilities
│   ├── components/      # Custom React components (NOT Subframe components)
│   ├── hooks/           # Custom React hooks
│   │   ├── use-api.ts   # API hook with toast integration
│   │   └── use-auth.ts  # Auth hook with toast integration
│   ├── context/         # Context providers (empty currently)
│   ├── supabase.ts      # Supabase client configuration
│   └── config.ts        # Client configuration
├── server/              # Server-side utilities and logic
│   ├── db/              # Database setup
│   │   ├── queries/     # Database query functions
│   │   ├── index.ts     # Database connection
│   │   ├── schema.ts    # Drizzle schema
│   │   └── envConfig.ts # Environment configuration
│   ├── api-error.ts     # Custom API error classes
│   ├── config.ts        # Server configuration
│   ├── email.ts         # Email sending utilities using Resend
│   ├── logger.ts        # Structured logging with Pino
│   ├── middleware.ts    # Server middleware utilities
│   ├── moderation.ts    # Content moderation utilities
│   ├── rate-limit.ts    # Rate limiting utilities
│   ├── sentry.ts        # Sentry error tracking
│   └── supabase.ts      # Server-side Supabase client
├── shared/              # Shared utilities
│   ├── sentry/          # Sentry client setup
│   ├── types/           # Shared TypeScript types
│   ├── utils/           # Shared utilities
│   └── validation/      # Zod validation schemas
│       ├── index.ts     # Validation exports
│       ├── list.ts      # List validation schemas
│       ├── publication.ts # Publication validation schemas
│       └── user.ts      # User validation schemas
├── ui/                  # UI components from Subframe (RESERVED)
│   └── components/      # Subframe components ONLY - do not add custom components here
└── middleware.ts        # Next.js middleware
```

- **Conventions**:
  - Components: PascalCase
  - Functions/variables: camelCase
  - Filenames: kebab-case or camelCase depending on folder

- **Directory Structure Rules**:
  - `/src/ui/components/` is RESERVED for Subframe components only
  - Custom React components go in `/src/client/components/`
  - Never add custom components to the `/ui` directory
  - When importing Subframe components, use `@/ui/components/`
  - When importing custom components, use `@/client/components/`

#### 5. **State Management**
- **Tool**: Local state, React Context (lightweight for now)
- Future consideration for Zustand if global state grows

#### 6. **Styling**
- **Library**: Tailwind CSS (via Subframe)
- **Theming**: Handled through Subframe's design system primitives

#### 7. **Deployment**
- **Hosting**: Vercel
- **Environment Variables**:
  - `NEXT_PUBLIC_APP_URL`: The app URL
  - `NEXT_PUBLIC_SUPABASE_URL`: Supabase URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
  - `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
  - `DATABASE_URL`: Database connection string
  - `RESEND_API_KEY`: Resend API key for emails
  - `SENTRY_DSN`: Sentry DSN for error tracking
- **CI/CD**: Managed through Vercel Git integration

#### 8. **Dev Notes for Cursor**
- Prioritize SEO on all public-facing pages:
  - Use semantic HTML (`<h1>`, `<article>`, etc.)
  - Configure `next/head` with appropriate meta tags
  - Use Open Graph tags for rich sharing previews
  - Consider `structured data` for enhanced Google visibility
  - Generate dynamic Open Graph images for list previews
  - Use dynamic metadata (`generateMetadata` in App Router) to match list content
  - Include `sitemap.xml` generation via `next-sitemap` or similar for search indexing
  - Use SEO-friendly URLs for list pages:
    - Format: `/@username/list-title-slug`
    - Auto-generate slugs from titles using `slugify`
    - Ensure uniqueness per user, fallback to adding ID if needed
- Always validate input using `zod` schemas in `shared/validation`
- Use Drizzle ORM for all standard database interactions
- Use native Supabase APIs for any real-time features (e.g. `supabase.channel()` or `supabase.realtime.*`)
- Use Supabase client for auth/session management
- Use Resend for all transactional and marketing emails
- API routes live under `src/app/api/*`
- Shared types live in `src/types`
- Design components should follow Tailwind and Subframe conventions
- Make components responsive by default (use Tailwind breakpoints)
- Avoid putting business logic directly in API routes—use `server/`
- When building new features, consult Subframe designs first

#### 9. **Performance Considerations**

- **Data Fetching Strategy**:
  - **List pages, profile pages, publication pages**: Use Server Components with SSR for initial load to optimize SEO and LCP metrics
  - **Homepage**: Use SSR with revalidation (ISR approach in App Router) to balance SEO needs with server load
    - Revalidation interval: 1-5 minutes for homepage content
  - **List details**: Static rendering with dynamic imports for interactive elements
  - **Comments section**: Client-side fetching after initial page load
  - **Real-time features**: Use Supabase's real-time subscriptions for reactions, comment counts, and engagement metrics

- **Caching Strategy**:
  - **CDN caching**: Leverage Vercel's Edge Network for static assets
  - **API Routes**: Add Cache-Control headers based on data volatility:
    - Public list data: `s-maxage=60, stale-while-revalidate=600`
    - User profiles: `s-maxage=300, stale-while-revalidate=3600`
    - Real-time data (reactions, comments): No cache
  - **Next.js cache**: Configure `fetch` cache options in data-fetching functions based on content type
  - **React Query/SWR**: Implement for client-side data fetching with appropriate stale times
  - **Supabase queries**: Use Response Transformers and PostgreSQL functions to minimize data transfer

- **Pagination Approaches**:
  - **Lists on homepage/profile pages**: Implement cursor-based pagination using Supabase's `range` header
    - Initial load: 10-15 lists per page
    - Load more: Infinite scroll with intersection observer
  - **List items within a list**: 
    - Short lists (<=20 items): Load all at once
    - Longer lists: Implement virtual scrolling for performance
    - Very long lists (50+ items): Add "load more" button after initial 20 items
  - **Comments**: 
    - Show most recent 5 comments initially
    - "Show more comments" button to load previous comments in batches of 10
    - Use real-time subscriptions for new comments
  - **API endpoints**: Always implement pagination with limits (default: 20 items)

- **Image Optimization**:
  - **Next.js Image component**: Use for all user-uploaded content with:
    - Responsive sizes based on viewport
    - WebP/AVIF format with fallbacks
    - Lazy loading for below-the-fold images
    - Priority loading for hero images
  - **Image storage**: Use Supabase Storage with CDN delivery
  - **Image dimensions**: Store standard dimensions for different use cases:
    - List thumbnails: 400x225px (16:9)
    - Profile pictures: 150x150px (1:1)
    - Featured images: 1200x675px (16:9)
  - **Placeholder strategy**: Use blurred placeholders for improved UX during loading
  - **External media embeds**: Lazy load all embeds (Twitter, YouTube) and use lightweight preview images until interaction

- **Performance Monitoring**:
  - **Core Web Vitals**: Track via Vercel Analytics
  - **Performance budgets**: 
    - Time to Interactive: <3.5s on 4G
    - First Contentful Paint: <1.8s
    - Largest Contentful Paint: <2.5s
    - Total page weight: <1MB (excluding user-generated images)
  - **Regular lighthouse audits**: Maintain >90 score for Performance and SEO

#### 10. **Security Considerations**

- **Supabase Row-Level Security (RLS)**:
  - **Public Lists**: 
    - Anyone can read published lists
    - Only the author can update or delete their lists
    - Example policy:
      ```sql
      CREATE POLICY "Public lists are viewable by everyone"
      ON lists
      FOR SELECT
      USING (is_published = true);
      
      CREATE POLICY "Authors can manage their own lists"
      ON lists
      FOR ALL
      USING (auth.uid() = user_id);
      ```
  - **Draft Lists**:
    - Only visible to the author
    - Example policy:
      ```sql
      CREATE POLICY "Draft lists are only visible to author"
      ON lists
      FOR SELECT
      USING (auth.uid() = user_id);
      ```
  - **Publication Lists**:
    - Editors and admins of the publication can edit lists
    - Example policy:
      ```sql
      CREATE POLICY "Publication editors can edit publication lists"
      ON lists
      FOR UPDATE
      USING (
        auth.uid() IN (
          SELECT user_id FROM publication_members
          WHERE publication_id = lists.publication_id
          AND (role = 'editor' OR role = 'admin')
        )
      );
      ```
  - **Comments**:
    - Authors can delete comments on their lists
    - Users can edit/delete their own comments
    - Admins can moderate all comments

- **CORS and CSP Configuration**:
  - **CORS**: Restrict to production domain and localhost in development
    ```typescript
    // middleware.ts or next.config.js
    const corsHeaders = {
      'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
        ? 'https://yourdomain.com' 
        : 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    ```
  - **Content Security Policy (CSP)**:
    - Implement CSP headers in Next.js config or middleware:
      ```typescript
      // next.config.js
      const securityHeaders = [
        {
          key: 'Content-Security-Policy',
          value: `
            default-src 'self';
            script-src 'self' 'unsafe-inline' https://cdn.vercel-insights.com;
            style-src 'self' 'unsafe-inline';
            img-src 'self' blob: data: https://*.supabase.co https://res.cloudinary.com;
            connect-src 'self' https://*.supabase.co https://vitals.vercel-insights.com https://api.resend.com;
            frame-src https://www.youtube.com https://platform.twitter.com;
            font-src 'self';
          `.replace(/\s{2,}/g, ' ').trim()
        }
      ];
      ```

- **API Rate Limiting**:
  - Implement rate limiting on all API routes:
    - 60 requests per minute for authenticated users
    - 20 requests per minute for unauthenticated users
    - More restrictive limits for mutation operations
    - Example implementation using `@upstash/ratelimit` with Redis:
      ```typescript
      // server/rate-limit.ts
      import { Ratelimit } from "@upstash/ratelimit";
      import { Redis } from "@upstash/redis";
      
      export const rateLimit = (identifier: string) => {
        const ratelimit = new Ratelimit({
          redis: Redis.fromEnv(),
          limiter: Ratelimit.slidingWindow(60, "60 s"),
          analytics: true,
          prefix: "@upstash/ratelimit",
        });
        
        return ratelimit.limit(identifier);
      };
      ```

- **Content Moderation Strategy**:
  - **Automated Pre-publication Filters**:
    - Integrate with OpenAI's Moderation API or similar service to detect harmful content
    - Implement keyword filters for profanity and harmful content
    - Flag potentially problematic content for review
  - **User-driven Moderation**:
    - Allow users to report inappropriate content
    - Implement a flagging system with threshold-based review triggers
  - **Admin Review System**:
    - Dashboard for reviewing flagged content
    - Ability to edit, unpublish, or delete violating content
    - Audit log for moderation actions
  - **Progressive Enforcement**:
    - First offense: Warning
    - Second offense: Temporary restrictions
    - Repeated offenses: Account suspension
    - Clear violation reporting to users
  - **Regular Reviews**:
    - Periodic spot-checks of randomly selected content
    - Review of trending/popular content
    - Automated scanning of all media using image recognition APIs

- **Authentication Security**:
  - **Passwordless Authentication**:
    - Configure Supabase Auth for magic link emails and social login providers only
    - Set appropriate redirect URLs for OAuth providers
    - Implement custom email templates with Resend for magic links to prevent phishing
    - Example configuration:
      ```typescript
      // client/auth/config.ts
      export const supabaseAuthConfig = {
        providers: ['google', 'twitter', 'github'],
        redirectTo: process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL,
        magicLink: {
          // Configure passwordless sign-ins via email
          enabled: true,
          // Custom email template
          emailRedirectTo: process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL,
        },
        // Disable password-based authentication
        password: false,
      };
      ```
  - **Session Security**:
    - Implement short-lived JWT tokens (default: 1 hour)
    - Use refresh tokens for seamless re-authentication
    - Store session data securely in cookies with HttpOnly, Secure, and SameSite flags
  - **Device Management**:
    - Allow users to view and revoke access from active sessions/devices
    - Implement suspicious login detection based on geolocation or device changes
  - **Account Recovery**:
    - Design secure account recovery flows for users who lose access to their email
    - Implement alternative verification methods for critical account changes
  - **2FA for Additional Security**:
    - Offer 2FA as an optional security enhancement using authenticator apps
    - Require 2FA for administrative actions and sensitive data access

- **Data Protection**:
  - Encrypt sensitive data at rest
  - Implement proper data backup and recovery procedures
  - Regularly audit data access logs
  - Define data retention policies
  - Handle user deletion requests (GDPR compliance)

- **Regular Security Audits**:
  - Conduct quarterly security reviews
  - Stay updated on Supabase security patches
  - Subscribe to security newsletters for Next.js and related tools
  - Consider annual penetration testing as the application scales

#### 11. **Accessibility Requirements**

- **WCAG Compliance Target**:
  - **Target Level**: WCAG 2.1 Level AA compliance
  - **Priority Areas**:
    - Text alternatives for non-text content (images, media)
    - Adaptable content presentation
    - Keyboard accessibility
    - Sufficient time for user interactions
    - Navigable interfaces
    - Input assistance to help users avoid and correct mistakes

- **Keyboard Navigation**:
  - **Core Requirements**:
    - All interactive elements must be accessible via keyboard
    - Logical tab order following visual layout
    - Custom keyboard shortcuts for common actions with list editing (documented in help section)
    - Focus styles must be clearly visible (≥3:1 contrast ratio against adjacent colors)
    - No keyboard traps in modal dialogs or complex components
    - Skip links for bypassing navigation to main content

- **Screen Reader Compatibility**:
  - **Implementation Details**:
    - Semantic HTML structure with appropriate ARIA attributes where needed
    - Use `aria-live` regions for real-time updates (e.g., new comments, reactions)
    - Descriptive labels for form controls and interactive elements
    - Announce loading states and results of user actions
    - Image descriptions for uploaded content (user prompted to add alt text)
    - Proper heading hierarchy (`h1` - `h6`) to facilitate navigation
    - Test with popular screen readers (NVDA, VoiceOver, JAWS)

- **Color and Contrast**:
  - **Minimum Requirements**:
    - Text contrast ratio ≥4.5:1 for normal text, ≥3:1 for large text
    - UI components and graphical objects contrast ratio ≥3:1 against adjacent colors
    - Color must not be the only means of conveying information
    - Provide visual cues in addition to color differentiation
    - Test color blindness compatibility for all UI elements

- **Content Structure and Forms**:
  - **Guidelines**:
    - Ensure resizable text without loss of content or functionality
    - Responsive design maintaining functionality at 400% zoom
    - Provide descriptive labels for all form fields
    - Clearly indicate required fields
    - Display form validation errors in context with clear remediation instructions
    - Group related form elements with `fieldset` and `legend`

- **Testing and Validation**:
  - **Process**:
    - Automated testing with tools like Axe or Lighthouse
    - Manual testing with assistive technologies
    - User testing with individuals who use assistive technology
    - Regular accessibility audits as part of development cycle
    - Document known accessibility limitations with planned resolution dates

- **Documentation**:
  - Maintain accessibility statement and help documentation
  - Provide keyboard shortcut reference
  - Document accessible features for users

#### 12. **Error Handling and Monitoring**

- **Error Boundary Implementation**:
  - **Global Error Boundaries**:
    - Implement root-level React Error Boundary for catching unhandled exceptions
    - Custom error pages that maintain navigation and branding
    - Example implementation:
      ```tsx
      // components/error-boundary.tsx
      import { Component, ErrorInfo, ReactNode } from 'react';

      interface Props {
        children?: ReactNode;
        fallback?: ReactNode;
      }

      interface State {
        hasError: boolean;
      }

      export class ErrorBoundary extends Component<Props, State> {
        public state: State = {
          hasError: false
        };

        public static getDerivedStateFromError(_: Error): State {
          return { hasError: true };
        }

        public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
          console.error("Uncaught error:", error, errorInfo);
          
          // Report to Sentry
          Sentry.captureException(error, { 
            extra: { 
              componentStack: errorInfo.componentStack 
            } 
          });
        }

        public render() {
          if (this.state.hasError) {
            return this.props.fallback || (
              <div className="error-container">
                <h2>Something went wrong</h2>
                <button onClick={() => this.setState({ hasError: false })}>
                  Try again
                </button>
              </div>
            );
          }

          return this.props.children;
        }
      }
      ```
      
  - **Feature-level Error Boundaries**:
    - Isolate critical features with dedicated error boundaries
    - Prevent whole-page crashes from non-critical component failures
    - Implement graceful degradation for key features

- **Sentry Integration**:
  - **Implementation**:
    - Initialize Sentry in `_app.tsx` for client-side monitoring
    - Configure Next.js server-side Sentry SDK for API routes
    - Sample configuration:
      ```typescript
      // server/sentry.ts
      import * as Sentry from '@sentry/nextjs';

      const SENTRY_DSN = process.env.SENTRY_DSN;

      Sentry.init({
        dsn: SENTRY_DSN,
        tracesSampleRate: 0.2, // Sample 20% of transactions for performance monitoring
        environment: process.env.NODE_ENV,
        integrations: [
          new Sentry.BrowserTracing(),
          new Sentry.Replay({
            // Session replay for critical user journeys
            maskAllText: true,
            blockAllMedia: true,
          }),
        ],
      });
      ```
  - **Data Collection Considerations**:
    - Implement breadcrumbs for user actions to provide context for errors
    - Create custom tags for filtering (user role, feature area, etc.)
    - Use Sentry's Performance monitoring for critical user flows
    - Configure PII scrubbing to ensure privacy compliance

- **Structured Logging Strategy**:
  - **Implementation**:
    - Use structured JSON logging format for machine-readability
    - Log levels: ERROR, WARN, INFO, DEBUG, TRACE
    - Include correlation IDs across client and server for request tracing
    - Sample configuration:
      ```typescript
      // server/logger.ts
      import pino from 'pino';

      const logger = pino({
        level: process.env.LOG_LEVEL || 'info',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true
          }
        },
        base: {
          env: process.env.NODE_ENV,
        },
      });

      export default logger;
      ```

- **Client-side Error Handling**:
  - **Strategy**:
    - Global handler for uncaught promise rejections and JS errors
    - Custom hook for API error handling with retries for transient failures
    - Toast notifications for non-critical errors
    - Example implementation:
      ```typescript
      // hooks/use-api.ts
      import { useState } from 'react';
      import * as Sentry from '@sentry/nextjs';
      import { toast } from "@subframe/core";

      export function useApi<T, P>(
        apiFunction: (params: P) => Promise<T>,
        options = { retries: 3, retryDelay: 1000 }
      ) {
        const [data, setData] = useState<T | null>(null);
        const [isLoading, setIsLoading] = useState(false);
        const [error, setError] = useState<Error | null>(null);

        const execute = async (params: P) => {
          setIsLoading(true);
          setError(null);
          
          let attempts = 0;
          
          while (attempts < options.retries) {
            try {
              const result = await apiFunction(params);
              setData(result);
              setIsLoading(false);
              return result;
            } catch (err) {
              attempts++;
              
              if (attempts >= options.retries) {
                const error = err instanceof Error ? err : new Error(String(err));
                setError(error);
                setIsLoading(false);
                
                // Report to Sentry if it's a final failure
                Sentry.captureException(error, {
                  extra: { params, attempts }
                });
                
                // Show user-friendly message
                toast.error('An error occurred. Please try again later.');
                throw error;
              }
              
              // Wait before retry
              await new Promise(r => setTimeout(r, options.retryDelay));
            }
          }
        };

        return { execute, data, isLoading, error };
      }
      ```

- **Server-side Error Handling**:
  - **Implementation**:
    - Custom error middleware for API routes
    - Standardized error responses with consistent format
    - HTTP status code mapping to error types
    - Example:
      ```typescript
      // server/api-error.ts
      export class ApiError extends Error {
        statusCode: number;
        
        constructor(message: string, statusCode: number) {
          super(message);
          this.statusCode = statusCode;
        }
        
        static badRequest(msg: string) {
          return new ApiError(msg, 400);
        }
        
        static unauthorized(msg: string = 'Unauthorized') {
          return new ApiError(msg, 401);
        }
        
        static forbidden(msg: string = 'Forbidden') {
          return new ApiError(msg, 403);
        }
        
        static notFound(msg: string = 'Resource not found') {
          return new ApiError(msg, 404);
        }
        
        static internal(msg: string = 'Internal server error') {
          return new ApiError(msg, 500);
        }
      }
      ```

- **Performance Monitoring**:
  - **Strategy**:
    - Use Sentry Performance for transaction monitoring
    - Implement Web Vitals reporting to Sentry
    - Track custom user journey metrics for critical flows
    - Example setup:
      ```typescript
      // shared/utils/vitals.ts
      import { onCLS, onFID, onLCP, onTTFB } from 'web-vitals';
      import * as Sentry from '@sentry/nextjs';

      export function reportWebVitals() {
        onCLS(metric => {
          Sentry.captureMessage('CLS', {
            level: 'info',
            extra: { metric }
          });
        });
        
        onFID(metric => {
          Sentry.captureMessage('FID', {
            level: 'info',
            extra: { metric }
          });
        });
        
        onLCP(metric => {
          Sentry.captureMessage('LCP', {
            level: 'info',
            extra: { metric }
          });
        });
        
        onTTFB(metric => {
          Sentry.captureMessage('TTFB', {
            level: 'info',
            extra: { metric }
          });
        });
      }
      ```

- **Alerting and Dashboards**:
  - **Configuration**:
    - Set up Sentry alerts for error rate spikes
    - Create team notifications for critical errors via Resend emails
    - Configure weekly error reports
    - Implement error budget tracking based on SLOs
    - Develop custom dashboards for error trends and performance metrics
    - Schedule regular error triage meetings with development team

#### 13. **Email Notifications**

- **Email Service Provider**:
  - **Provider**: Resend
  - **Integration**: Use the Resend SDK for Next.js/React
  - **Environment Setup**: Configure `RESEND_API_KEY` in environment variables

- **Email Templates**:
  - **Framework**: React Email for component-based email templates
  - **Storage**: Email templates to be stored as React components (directory not yet created)
  - **Features**: Responsive design, dark mode support, text fallbacks

  - **Email Implementation**:
    - **Server-side Integration**:
      - Utility module for sending emails in `server/email.ts`
      - Integration with React Email for template rendering
      - Error handling and logging for email delivery failures

- **Notification Types**:
  - **User Onboarding**:
    - Welcome email after signup
    - Account verification
    - Getting started guide
  - **Engagement Notifications**:
    - Comment notifications
    - Reaction alerts
    - List save/bookmark notifications
    - Publication invitations
  - **Digest Emails**:
    - Weekly user digest of popular lists
    - Publication activity summary
    - Personalized content recommendations
  - **System Notifications**:
    - Security alerts
    - Account activity notifications
    - Password/email change confirmations

- **Email Preferences Management**:
  - **User Controls**:
    - Dedicated email preferences page
    - Granular control over notification types
    - Frequency settings (immediate, daily digest, weekly digest)
    - One-click unsubscribe from all marketing emails
  - **Implementation**:
    - Store preferences in Supabase `user_email_preferences` table
    - Apply RLS policies for user-specific access

- **Email Deliverability and Compliance**:
  - **SPF, DKIM, and DMARC**: Configured via Resend dashboard
  - **Anti-spam Compliance**:
    - Include physical address in marketing emails
    - Clear unsubscribe mechanism in every email
    - Honor unsubscribe requests promptly
  - **GDPR Compliance**:
    - Document lawful basis for sending each email type
    - Maintain user consent records
    - Include privacy policy link in email footer
    - Honor data deletion requests
  - **Email Testing**:
    - Test templates across major email clients
    - Implement email previews in admin dashboard
    - Monitor delivery rates and spam placement

#### 14. **Toast Notifications**

- **Implementation**:
  - **Provider**: Subframe's Toast component
  - **Integration**: Using `@subframe/core` package
  - **Setup**: Added Toaster component to root layout

- **Usage**:
  - **Client-side**:
    ```typescript
    import { toast } from "@subframe/core";
    
    // Success toast
    toast.success("Operation completed successfully");
    
    // Error toast
    toast.error("Something went wrong");
    
    // Info toast
    toast.info("Here's some information");
    
    // Brand toast
    toast.brand("Welcome to Listicle!");
    ```
  
  - **Server-side**:
    - Toast notifications are only available in client components
    - Server components should use other notification methods or pass data to client components

- **Customization**:
  - Toasts are styled according to Subframe's design system
  - Default duration is 5 seconds
  - Toasts appear in the top-right corner of the screen
  - Multiple toasts stack vertically with appropriate spacing

- **Integration with Hooks**:
  - `use-auth.ts` and `use-api.ts` hooks use toast for user feedback
  - Error handling in API calls shows appropriate toast messages
  - Success messages confirm successful operations

