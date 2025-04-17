# The Beauty Salon Booking Platform

A modern web application for booking salon services in Saudi Arabia, built with React, Express, and TypeScript.

## Features

- 🌐 Multilingual support with RTL (Arabic/English)
- 💅 Modern UI with Tailwind CSS and Shadcn/ui components
- 🔐 Secure user authentication with Passport.js
- 📅 Advanced salon and service booking system
- 🏪 Comprehensive salon listings with search and filters
- 👤 User profiles and booking history
- 📱 Fully responsive design
- 🔄 Real-time updates with WebSocket support
- 📊 Admin dashboard for salon management
- ⭐ Review and rating system

## Translation System

The application implements a dual-approach translation system:

### 1. Database-Level Translations
- All content in the database (salons, services, etc.) is stored in both English and Arabic
- Each entity has dedicated fields for both languages:
  ```typescript
  {
    nameEn: "The Beauty Elegance Spa",
    nameAr: "ذا بيوتي للسبا الفاخر",
    descriptionEn: "Luxury spa and beauty salon...",
    descriptionAr: "صالون سبا وتجميل فاخر..."
  }
  ```
- This approach ensures data consistency and allows for easy content management

### 2. UI-Level Translations
- Uses `react-i18next` for UI text translations
- Organized into namespaces for better management:
  - `common`: Shared UI elements
  - `auth`: Authentication-related text
  - `salon`: Salon-specific content
  - `footer`: Footer content
- Supports RTL/LTR layout switching
- Provides fallback mechanisms for missing translations
- Integrated with the language context for dynamic language switching

### Language Context
- Uses a custom `useLanguage` hook to manage language state
- Provides `isLtr` and `isRtl` flags for conditional rendering
- Handles layout direction changes automatically
- Persists language preference across sessions

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- Shadcn/ui components for beautiful UI
- React Query for efficient data fetching
- i18next for internationalization
- Wouter for client-side routing
- React Hook Form with Zod validation
- Framer Motion for animations
- Recharts for data visualization

### Backend
- Express.js with TypeScript
- Drizzle ORM for database operations
- PostgreSQL (via NeonDB)
- Session-based authentication with Passport.js
- WebSocket support for real-time features
- CSV data import functionality
- Secure session management

## Project Structure

```
jamaalaki/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── contexts/          # React contexts
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility functions
│   │   └── App.tsx           # Main application component
├── server/                    # Backend Express application
│   ├── routes.ts             # API routes
│   ├── storage.ts            # Database operations
│   ├── auth.ts               # Authentication logic
│   ├── config.ts             # Configuration
│   └── index.ts              # Server entry point
├── shared/                    # Shared types and utilities
├── migrations/               # Database migrations
├── public/                   # Static assets
├── sample_salons.csv         # Sample salon data
├── sample_services.csv       # Sample service data
├── sample_reviews.csv        # Sample review data
├── netlify.toml             # Netlify deployment configuration
├── windsurf_deployment.yaml # Windsurf deployment configuration
└── package.json              # Project dependencies and scripts
```

## Getting Started

### Prerequisites
- Node.js (Latest LTS version)
- npm or yarn
- PostgreSQL database (or NeonDB account)

### Installation

1. Clone the repository
```bash
git clone [repository-url]
cd jamaalaki
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```env
DATABASE_URL=your_database_url
SESSION_SECRET=your_session_secret
NODE_ENV=development
```

4. Initialize the database
```bash
npm run db:push
```

5. Start the development server
```bash
npm run dev
```

### Development
- Frontend runs on `http://localhost:5173`
- Backend runs on `http://localhost:3000`

### Build
```bash
npm run build
```

### Production
```bash
npm start
```

## Database Setup

The application uses PostgreSQL with Drizzle ORM. You can use either:
- Local PostgreSQL instance
- NeonDB (serverless PostgreSQL)

To import sample data:
```bash
# Import salons from sample_salons.csv
npm run import-salons

# Import services from sample_services.csv
npm run import-services

# Import reviews from sample_reviews.csv
npm run import-reviews
```

## Deployment

The application can be deployed using:
- Netlify (frontend) - configured in `netlify.toml`
- Windsurf (backend) - configured in `windsurf_deployment.yaml`
- Any Node.js hosting service (backend)

### Netlify Deployment
1. Configure build settings in `netlify.toml`
2. Set up environment variables in Netlify dashboard
3. Deploy using Netlify CLI or GitHub integration

### Windsurf Deployment
1. Configure deployment settings in `windsurf_deployment.yaml`
2. Set up environment variables in Windsurf dashboard
3. Deploy using Windsurf CLI or GitHub integration

## Features in Detail

### Salon Management
- Browse salons with advanced filtering
- View detailed salon information
- Service categories and pricing
- Salon ratings and reviews
- Location-based search

### Booking System
- Select multiple services
- Choose preferred date and time
- Real-time availability checking
- Booking confirmation and reminders
- Booking history and management

### User Management
- Secure registration and login
- Profile customization
- Booking history tracking
- Review and rating system
- Admin dashboard for salon owners

### Admin Features
- Salon profile management
- Service management
- Booking management
- Review moderation
- Analytics and reporting

## Client-Side Pages and Functionality

### Home Page (`/`)
- **Design**: Modern, responsive layout with Islamic pattern background
- **Components**:
  - Hero section with call-to-action
  - Featured filters for quick salon discovery
  - Search bar with advanced filtering options
  - Featured salons carousel
  - Services showcase section
  - Booking process steps
  - Testimonials section
  - CTA section
- **Backend Integration**: Fetches featured salons and services via React Query
- **Features**:
  - RTL/LTR language support
  - Advanced search functionality
  - Dynamic content based on user preferences

### Salon Details Page (`/salon/:id`)
- **Design**: Clean, information-rich layout with image gallery
- **Components**:
  - Salon header with image and basic info
  - Feature tags (Ladies Only, Private Rooms, etc.)
  - Service listings with pricing
  - Reviews and ratings
  - Location and contact information
  - Booking CTA
- **Backend Integration**:
  - Fetches salon details via `/api/salons/:id`
  - Loads services via `/api/services/salon/:id`
  - Retrieves reviews via `/api/reviews/salon/:id`
- **Features**:
  - Real-time availability checking
  - Service filtering and sorting
  - Review system integration
  - Location-based features

### Booking Page (`/booking/:salonId/:serviceId`)
- **Design**: Step-by-step booking process with clear visual hierarchy
- **Components**:
  - Service details summary
  - Date picker with availability
  - Time slot selection
  - Additional notes input
  - Booking confirmation
- **Backend Integration**:
  - Fetches service details via `/api/services/:id`
  - Creates bookings via POST `/api/bookings`
  - Handles authentication and user session
- **Features**:
  - Real-time availability checking
  - Form validation with Zod
  - Secure payment integration
  - Booking confirmation and notifications

### User Profile Page (`/profile`)
- **Design**: Dashboard-style layout with personal information
- **Components**:
  - User information section
  - Booking history
  - Favorite salons
  - Account settings
  - Review history
- **Backend Integration**:
  - Fetches user data via `/api/users/:id`
  - Loads bookings via `/api/bookings/user/:id`
  - Manages user preferences
- **Features**:
  - Booking management
  - Profile customization
  - Review management
  - Account security settings

### Authentication Pages
#### Login (`/login`)
- **Design**: Clean, focused authentication interface
- **Components**:
  - Email/password form
  - Social login options
  - Password recovery
  - Registration link
- **Backend Integration**:
  - Authenticates via `/api/auth/login`
  - Handles session management
  - Manages redirects

#### Register (`/register`)
- **Design**: User-friendly registration form
- **Components**:
  - Multi-step registration process
  - Form validation
  - Terms and conditions
  - Email verification
- **Backend Integration**:
  - Creates user via `/api/auth/register`
  - Handles email verification
  - Manages user preferences

### Additional Pages
- **Services Page** (`/services`): Comprehensive service listings
- **About Page** (`/about`): Company information and mission
- **404 Page**: Custom not-found page with navigation options

### Backend Integration Details
- **API Communication**:
  - Uses React Query for data fetching and caching
  - Implements optimistic updates for better UX
  - Handles error states and loading indicators
- **Authentication**:
  - JWT-based authentication
  - Session management
  - Role-based access control
- **Real-time Features**:
  - WebSocket integration for live updates
  - Push notifications for booking confirmations
  - Real-time availability checking

## Design System

### Color Palette

#### Primary Colors
- Primary: `#7C3AED` (Violet-600)
- Primary Light: `#8B5CF6` (Violet-500)
- Primary Dark: `#6D28D9` (Violet-700)

#### Secondary Colors
- Secondary: `#F59E0B` (Amber-500)
- Secondary Light: `#FBBF24` (Amber-400)
- Secondary Dark: `#D97706` (Amber-600)

#### Neutral Colors
- Background: `#FFFFFF` (White)
- Surface: `#F9FAFB` (Gray-50)
- Border: `#E5E7EB` (Gray-200)
- Text Primary: `#111827` (Gray-900)
- Text Secondary: `#4B5563` (Gray-600)
- Text Disabled: `#9CA3AF` (Gray-400)

#### Semantic Colors
- Success: `#10B981` (Emerald-500)
- Error: `#EF4444` (Red-500)
- Warning: `#F59E0B` (Amber-500)
- Info: `#3B82F6` (Blue-500)

### Typography

#### Font Family
- Primary: `Inter` (Sans-serif)
- Secondary: `Noto Sans Arabic` (For Arabic text)

#### Font Sizes
- H1: `2.5rem` (40px)
- H2: `2rem` (32px)
- H3: `1.75rem` (28px)
- H4: `1.5rem` (24px)
- H5: `1.25rem` (20px)
- Body Large: `1.125rem` (18px)
- Body: `1rem` (16px)
- Body Small: `0.875rem` (14px)
- Caption: `0.75rem` (12px)

### Spacing System
- Base Unit: `4px`
- Spacing Scale:
  - xs: `4px`
  - sm: `8px`
  - md: `16px`
  - lg: `24px`
  - xl: `32px`
  - 2xl: `48px`
  - 3xl: `64px`

### Component Library

#### Layout Components
1. **Container**
   - Max-width: `1280px`
   - Padding: `md` (16px) on mobile, `lg` (24px) on desktop
   - Background: Surface color

2. **Grid System**
   - 12-column grid
   - Breakpoints:
     - Mobile: 1 column
     - Tablet: 2 columns
     - Desktop: 3-4 columns
   - Gap: `md` (16px)

#### Navigation Components
1. **Header**
   - Height: `64px`
   - Background: White
   - Shadow: Light elevation
   - Logo size: `40px`
   - Navigation links: Body size

2. **Footer**
   - Background: Surface color
   - Padding: `xl` (32px)
   - Links: Body Small size
   - Social icons: `24px`

#### Form Components
1. **Input Fields**
   - Height: `40px`
   - Border radius: `6px`
   - Border: 1px solid Border color
   - Focus state: Primary color border
   - Error state: Error color border

2. **Buttons**
   - Primary Button:
     - Background: Primary color
     - Text: White
     - Padding: `sm` (8px) `md` (16px)
     - Border radius: `6px`
   - Secondary Button:
     - Background: Transparent
     - Border: 1px solid Primary color
     - Text: Primary color
   - Text Button:
     - Background: Transparent
     - Text: Primary color
     - No border

#### Card Components
1. **Salon Card**
   - Width: `100%`
   - Border radius: `12px`
   - Shadow: Medium elevation
   - Image aspect ratio: 16:9
   - Content padding: `md` (16px)

2. **Service Card**
   - Width: `100%`
   - Border radius: `8px`
   - Shadow: Light elevation
   - Content padding: `md` (16px)

#### Modal Components
1. **Booking Modal**
   - Width: `90%` on mobile, `600px` on desktop
   - Border radius: `12px`
   - Shadow: High elevation
   - Close button: Top-right corner
   - Content padding: `lg` (24px)

### Page Layouts

#### Home Page
- Hero Section:
  - Full-width background
  - Height: `600px` on desktop, `400px` on mobile
  - Overlay gradient
  - Centered content
- Featured Salons:
  - Grid layout
  - Section padding: `xl` (32px)
- Categories:
  - Horizontal scroll on mobile
  - Grid on desktop
  - Card size: `200px` square

#### Salon Details Page
- Hero Image:
  - Full-width
  - Height: `400px`
  - Overlay gradient
- Content:
  - Two-column layout on desktop
  - Single column on mobile
  - Sidebar width: `300px`
- Reviews:
  - Card layout
  - Avatar size: `40px`
  - Rating stars: `20px`

#### Booking Page
- Form layout:
  - Two-column on desktop
  - Single column on mobile
  - Input spacing: `md` (16px)
- Calendar:
  - Width: `100%`
  - Day size: `40px`
  - Selected state: Primary color

### Responsive Design
- Breakpoints:
  - Mobile: `0px - 640px`
  - Tablet: `641px - 1024px`
  - Desktop: `1025px+`
- Mobile-first approach
- Fluid typography
- Flexible grid system

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Color contrast ratio: 4.5:1 minimum
- Focus states for all interactive elements

### Animation Guidelines
- Duration: `300ms` standard
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`
- Hover states: Scale transform
- Transitions: Smooth opacity changes
- Loading states: Skeleton animations

### RTL Support
- Automatic layout direction switching
- Mirroring of UI elements
- Arabic font fallbacks
- RTL-specific spacing adjustments
- Bidirectional text support

## Development Guidelines

### Component Development
1. Create components in `client/src/components`
2. Follow atomic design principles
3. Implement responsive design
4. Support RTL/LTR layouts
5. Include proper TypeScript types
6. Add Storybook documentation
7. Implement proper error handling
8. Include loading states
9. Add proper accessibility attributes
10. Follow the design system specifications

### State Management
1. Use React Query for server state
2. Implement proper loading states
3. Handle error states gracefully
4. Cache data appropriately
5. Implement optimistic updates
6. Use proper TypeScript types

### Performance Optimization
1. Implement code splitting
2. Optimize images
3. Use proper caching strategies
4. Minimize bundle size
5. Implement lazy loading
6. Use proper memoization
7. Optimize re-renders

### Testing Strategy
1. Unit tests for components
2. Integration tests for features
3. End-to-end tests for critical paths
4. Performance testing
5. Accessibility testing
6. Cross-browser testing

### Deployment
1. Use Vercel for frontend
2. Implement proper CI/CD
3. Use environment variables
4. Implement proper error tracking
5. Monitor performance
6. Implement proper logging

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## UI Components and Themes

### Language Toggle Button
- **Position**: Top-right corner of the header
- **Design**:
  - Circular button with language code (EN/AR)
  - Size: `40px` diameter
  - Background: Surface color
  - Border: 1px solid Border color
  - Hover effect: Scale transform (1.05)
  - Active state: Primary color background
- **Animation**:
  - Duration: `200ms`
  - Easing: `cubic-bezier(0.4, 0, 0.2, 1)`
  - Transition: Smooth rotation and color change
- **Accessibility**:
  - ARIA label: "Switch language"
  - Keyboard navigation support
  - Focus ring with Primary color

### Page-Specific Themes

#### Home Page Theme
- **Background**:
  - Primary: White
  - Secondary: Surface color
  - Pattern: Subtle Islamic geometric pattern
  - Opacity: 0.05
- **Hero Section**:
  - Gradient overlay: Primary to transparent
  - Text color: White
  - CTA button: Primary color with white text
- **Featured Salons**:
  - Card background: White
  - Shadow: Medium elevation
  - Hover effect: Scale transform (1.02)
- **Categories**:
  - Background: Surface color
  - Active state: Primary color
  - Text: Primary color (inactive), White (active)

#### Salon Details Page Theme
- **Hero Image**:
  - Overlay gradient: Black to transparent
  - Text color: White
  - Rating stars: Secondary color
- **Content Area**:
  - Background: White
  - Section dividers: Border color
  - Feature tags: Surface color with Primary text
- **Services Section**:
  - Card background: White
  - Price highlight: Primary color
  - Duration text: Text Secondary color
- **Reviews Section**:
  - Card background: Surface color
  - Rating stars: Secondary color
  - Date text: Text Secondary color

#### Booking Page Theme
- **Form Section**:
  - Background: White
  - Input borders: Border color
  - Focus state: Primary color
  - Error state: Error color
- **Calendar**:
  - Background: White
  - Selected date: Primary color
  - Available slots: Success color
  - Unavailable slots: Text Disabled color
- **Time Slots**:
  - Available: White with Primary border
  - Selected: Primary color with white text
  - Unavailable: Surface color with Text Disabled color

#### User Profile Page Theme
- **Header Section**:
  - Background: Primary color
  - Text: White
  - Avatar border: White
- **Content Area**:
  - Card background: White
  - Section titles: Text Primary color
  - Subtitles: Text Secondary color
- **Booking History**:
  - Active bookings: Success color background
  - Past bookings: Surface color
  - Cancelled bookings: Error color background

#### Authentication Pages Theme
- **Form Container**:
  - Background: White
  - Border radius: `12px`
  - Shadow: High elevation
- **Input Fields**:
  - Background: Surface color
  - Focus state: Primary color
  - Error state: Error color
- **Buttons**:
  - Primary: Primary color with white text
  - Secondary: Transparent with Primary border
  - Social login: Surface color with Primary text

### Common UI Elements

#### Loading States
- **Spinner**:
  - Color: Primary color
  - Size: `40px`
  - Animation: Rotate 360deg
  - Duration: `1s`
  - Timing: Linear
- **Skeleton**:
  - Background: Surface color
  - Animation: Pulse
  - Duration: `1.5s`
  - Timing: `cubic-bezier(0.4, 0, 0.6, 1)`

#### Toast Notifications
- **Success**:
  - Background: Success color
  - Text: White
  - Icon: Check circle
- **Error**:
  - Background: Error color
  - Text: White
  - Icon: X circle
- **Warning**:
  - Background: Warning color
  - Text: White
  - Icon: Alert triangle
- **Info**:
  - Background: Info color
  - Text: White
  - Icon: Info

#### Tooltips
- **Background**: Text Primary color
- **Text**: White
- **Arrow**: Text Primary color
- **Animation**: Fade in/out
- **Duration**: `200ms`

#### Dropdowns
- **Background**: White
- **Border**: Border color
- **Hover state**: Surface color
- **Selected state**: Primary color with white text
- **Animation**: Slide down
- **Duration**: `200ms`

### RTL-Specific Adjustments
- **Text Alignment**:
  - LTR: Left-aligned
  - RTL: Right-aligned
- **Icons**:
  - LTR: Standard orientation
  - RTL: Mirrored where appropriate
- **Spacing**:
  - LTR: Left margin/padding
  - RTL: Right margin/padding
- **Form Elements**:
  - LTR: Left-to-right input
  - RTL: Right-to-left input
- **Navigation**:
  - LTR: Left-to-right flow
  - RTL: Right-to-left flow

## Additional Design System Details

### 1. Component Interaction States

#### Button States
- **Default**:
  - Background: Primary color
  - Text: White
  - Border: None
- **Hover**:
  - Background: Primary Dark color
  - Scale: 1.02
  - Transition: 200ms
- **Active**:
  - Background: Primary Dark color
  - Scale: 0.98
  - Shadow: Inner shadow
- **Disabled**:
  - Background: Text Disabled color
  - Text: White
  - Opacity: 0.7
  - Cursor: Not-allowed

#### Form Field States
- **Default**:
  - Border: Border color
  - Background: White
- **Focus**:
  - Border: Primary color
  - Shadow: Light elevation
- **Error**:
  - Border: Error color
  - Text: Error color
  - Icon: Error icon
- **Success**:
  - Border: Success color
  - Text: Success color
  - Icon: Check icon

#### Touch Feedback
- **Tap Target Size**: Minimum 44x44px
- **Touch Ripple**: Primary color with 0.2 opacity
- **Long Press**: Scale 0.95
- **Swipe**: 20% threshold for action

### 2. Form Validation Patterns

#### Validation Rules
- **Email**:
  - Pattern: RFC 5322
  - Error: "Please enter a valid email address"
- **Password**:
  - Min Length: 8 characters
  - Requirements: 1 uppercase, 1 lowercase, 1 number
  - Error: "Password must meet requirements"
- **Phone**:
  - Format: +966 XX XXX XXXX
  - Error: "Please enter a valid phone number"

#### Error Display
- **Position**: Below input field
- **Style**: Error color text
- **Icon**: Error icon (16px)
- **Animation**: Slide down 200ms

#### Success Indicators
- **Checkmark**: Success color
- **Message**: Success color text
- **Animation**: Fade in 200ms

### 3. Image Guidelines

#### Sizes and Formats
- **Hero Images**: 1920x1080px, WebP format
- **Profile Images**: 400x400px, PNG format
- **Thumbnails**: 200x200px, WebP format
- **Icons**: 24x24px, SVG format

#### Aspect Ratios
- **Hero**: 16:9
- **Profile**: 1:1
- **Cards**: 4:3
- **Thumbnails**: 1:1

#### Loading Strategy
- **Lazy Loading**: Below fold
- **Blur Placeholder**: 20px blur
- **Progressive Loading**: Low to high quality
- **Skeleton**: Surface color

### 4. Micro-interactions

#### Button Clicks
- **Scale**: 0.95
- **Duration**: 150ms
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)

#### Form Focus
- **Border Color**: Primary
- **Shadow**: Light elevation
- **Duration**: 200ms

#### Page Transitions
- **Enter**: Slide right (LTR), Slide left (RTL)
- **Exit**: Fade out
- **Duration**: 300ms

#### Scroll Animations
- **Parallax**: 0.5 speed
- **Fade In**: 100px threshold
- **Stagger**: 50ms delay

### 5. Error Handling UI

#### 404 Page
- **Illustration**: Custom 404 image
- **Message**: "Page not found"
- **CTA**: "Return Home"
- **Animation**: Bounce effect

#### Network Errors
- **Icon**: Cloud Off (24px)
- **Message**: "Connection lost"
- **Retry Button**: Primary color
- **Timeout**: 30 seconds

#### Form Validation
- **Inline Errors**: Below fields
- **Summary**: Top of form
- **Focus**: First error field
- **Color**: Error color

### 6. Mobile-Specific Patterns

#### Bottom Navigation
- **Height**: 56px
- **Icons**: 24px
- **Active**: Primary color
- **Inactive**: Text Secondary
- **Background**: White
- **Shadow**: Light elevation

#### Pull-to-Refresh
- **Threshold**: 80px
- **Indicator**: Primary color
- **Animation**: Rotate 360deg
- **Duration**: 1s

#### Swipe Gestures
- **Threshold**: 20% of width
- **Feedback**: Scale 0.98
- **Animation**: Slide with spring
- **Cancel**: Return to original

### 7. Performance Guidelines

#### Image Optimization
- **Max Size**: 500KB
- **Format**: WebP preferred
- **Quality**: 80% for photos
- **Compression**: Lossless for icons

#### Bundle Size
- **Initial Load**: < 200KB
- **Total Size**: < 2MB
- **Chunk Size**: < 100KB
- **Lazy Load**: Below fold

#### Loading Targets
- **First Paint**: < 1s
- **Interactive**: < 3s
- **Complete**: < 5s
- **LCP**: < 2.5s

### 8. Accessibility Details

#### ARIA Labels
- **Buttons**: Action description
- **Forms**: Field purpose
- **Images**: Alt text
- **Landmarks**: Region purpose

#### Keyboard Navigation
- **Focus Order**: Logical flow
- **Focus Ring**: Primary color
- **Skip Links**: Visible on focus
- **Shortcuts**: Documented

#### Screen Reader
- **Announcements**: Live regions
- **States**: ARIA attributes
- **Navigation**: Landmarks
- **Forms**: Labels and hints

### 9. Theme Customization

#### Dark Mode
- **Background**: Gray-900
- **Surface**: Gray-800
- **Text**: Gray-100
- **Primary**: Violet-400
- **Secondary**: Amber-400

#### High Contrast
- **Background**: White
- **Text**: Black
- **Links**: Blue-600
- **Focus**: Orange-500

#### Custom Themes
- **Primary**: User defined
- **Secondary**: Complementary
- **Background**: Light/Dark
- **Text**: Contrasting

### 10. Component Documentation

#### Props
- **Required**: Marked with *
- **Types**: TypeScript interfaces
- **Defaults**: Specified values
- **Examples**: Code snippets

#### Usage
- **Basic**: Simple implementation
- **Advanced**: Complex patterns
- **Edge Cases**: Special handling
- **Best Practices**: Guidelines

### 11. Localization Details

#### Date/Time
- **Format**: DD/MM/YYYY (EN), YYYY/MM/DD (AR)
- **Time**: 12h (EN), 24h (AR)
- **Timezone**: AST (UTC+3)

#### Numbers
- **Format**: 1,234.56 (EN), ١٬٢٣٤٫٥٦ (AR)
- **Currency**: SAR
- **Decimals**: 2 places

#### Text Handling
- **Expansion**: 30% buffer
- **Contraction**: 20% buffer
- **Line Height**: 1.5x font size
- **Hyphenation**: Language specific

### 12. Animation System

#### Motion Tokens
- **Duration**: 100ms - 500ms
- **Easing**: cubic-bezier values
- **Delay**: 0ms - 200ms
- **Stagger**: 50ms steps

#### Effects
- **Fade**: Opacity 0-1
- **Slide**: Transform translate
- **Scale**: Transform scale
- **Rotate**: Transform rotate

### 13. Icon System

#### Sizes
- **Small**: 16px
- **Medium**: 24px
- **Large**: 32px
- **XLarge**: 48px

#### States
- **Default**: Text Primary
- **Hover**: Primary color
- **Active**: Primary Dark
- **Disabled**: Text Disabled

### 14. Grid System

#### Breakpoints
- **Mobile**: 0-640px
- **Tablet**: 641-1024px
- **Desktop**: 1025px+

#### Columns
- **Mobile**: 4 columns
- **Tablet**: 8 columns
- **Desktop**: 12 columns

#### Gutters
- **Mobile**: 16px
- **Tablet**: 24px
- **Desktop**: 32px

### 15. Typography System

#### Line Heights
- **Headings**: 1.2
- **Body**: 1.5
- **Small**: 1.4
- **Large**: 1.6

#### Spacing
- **Paragraph**: 1em
- **Headings**: 1.5em
- **Lists**: 0.5em
- **Blockquote**: 2em

### 16. Spacing System

#### Vertical Rhythm
- **Base**: 8px
- **Multiples**: 8, 16, 24, 32, 40, 48
- **Sections**: 64px
- **Pages**: 96px

#### Nested Rules
- **Parent**: 24px
- **Child**: 16px
- **Grandchild**: 8px
- **Siblings**: 16px

### 17. Component States

#### Empty States
- **Icon**: 48px
- **Message**: Text Secondary
- **CTA**: Primary button
- **Padding**: 48px

#### Loading States
- **Skeleton**: Surface color
- **Animation**: Pulse
- **Duration**: 1.5s
- **Opacity**: 0.5

### 18. Navigation Patterns

#### Breadcrumbs
- **Separator**: Chevron
- **Color**: Text Secondary
- **Active**: Text Primary
- **Hover**: Primary color

#### Pagination
- **Size**: 32px
- **Active**: Primary color
- **Hover**: Primary Light
- **Disabled**: Text Disabled

### 19. Data Visualization

#### Charts
- **Colors**: Primary palette
- **Grid**: Border color
- **Text**: Text Secondary
- **Legend**: Bottom/Right

#### Tables
- **Header**: Surface color
- **Rows**: Alternating
- **Hover**: Surface color
- **Border**: Border color

### 20. Print Styles

#### Layout
- **Width**: 100%
- **Margins**: 20mm
- **Font**: 12pt
- **Color**: Black

#### Elements
- **Hide**: Navigation, Footer
- **Show**: Content, Images
- **Links**: Underlined
- **Page Breaks**: Avoid orphans

## Advanced Development Guidelines

### 1. Component Architecture Patterns

#### Atomic Design Implementation
- **Atoms**: Basic building blocks (buttons, inputs, labels)
- **Molecules**: Simple combinations (search bar, form fields)
- **Organisms**: Complex components (header, footer, cards)
- **Templates**: Page layouts
- **Pages**: Complete views

#### State Management
- **Local State**: useState for component-specific data
- **Global State**: Context API for shared data
- **Server State**: React Query for API data
- **Form State**: React Hook Form
- **URL State**: URL parameters and search

#### Error Boundaries
- **Component Level**: Individual component error handling
- **Route Level**: Page-level error boundaries
- **Global Level**: App-wide error boundary
- **Fallback UI**: User-friendly error messages
- **Error Logging**: Sentry integration

### 2. Internationalization Deep Dive

#### Translation Structure
- **Namespaces**: Organized by feature
- **Keys**: Dot notation hierarchy
- **Fallbacks**: Default language
- **Missing Keys**: Warning system
- **Pluralization**: Language-specific rules

#### Date/Time Localization
- **Formats**: Culture-specific
- **Time Zones**: User preference
- **Relative Time**: "2 hours ago"
- **Calendars**: Gregorian/Hijri
- **Holidays**: Regional awareness

#### Number Formatting
- **Currency**: SAR with symbols
- **Decimals**: Culture-specific
- **Percentages**: Format rules
- **Phone Numbers**: Country codes
- **Addresses**: Regional formats

### 3. API Documentation

#### Endpoint Structure
- **Base URL**: `https://api.jamaalaki.com/v1`
- **Authentication**: Bearer token
- **Versioning**: URL path
- **Rate Limits**: 100 requests/minute
- **Pagination**: Cursor-based

#### Response Format
```typescript
{
  data: T,
  meta: {
    total: number,
    page: number,
    limit: number
  },
  error?: {
    code: string,
    message: string,
    details?: any
  }
}
```

#### Error Codes
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **429**: Too Many Requests
- **500**: Server Error

### 4. Security Guidelines

#### Authentication
- **JWT Tokens**: 24-hour expiry
- **Refresh Tokens**: 30-day expiry
- **Password Policy**: 8+ chars, mixed case
- **2FA**: Optional for users
- **Session Management**: Secure cookies

#### Data Protection
- **Encryption**: AES-256
- **SSL/TLS**: Required
- **Data Masking**: Sensitive fields
- **Audit Logs**: All changes
- **GDPR Compliance**: Data handling

### 5. Testing Framework

#### Unit Tests
- **Framework**: Jest
- **Coverage**: 80% minimum
- **Components**: React Testing Library
- **Hooks**: Custom test utilities
- **Mocking**: MSW for API

#### Integration Tests
- **Framework**: Cypress
- **Scenarios**: Critical paths
- **API**: Contract testing
- **Database**: Test fixtures
- **Performance**: Load testing

### 6. CI/CD Pipeline

#### Build Process
- **Environment**: Node.js 18
- **Dependencies**: Lock file
- **Type Checking**: TypeScript
- **Linting**: ESLint
- **Formatting**: Prettier

#### Deployment
- **Staging**: Preview deployments
- **Production**: Blue-green
- **Rollback**: Automatic
- **Monitoring**: Health checks
- **Logging**: Structured format

### 7. Performance Monitoring

#### Metrics
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1
- **TTFB**: < 200ms
- **Bundle Size**: < 200KB

#### Tools
- **Analytics**: Google Analytics
- **Monitoring**: Sentry
- **Profiling**: React Profiler
- **Logging**: ELK Stack
- **Alerting**: PagerDuty

### 8. Error Tracking

#### Logging
- **Levels**: Error, Warn, Info
- **Format**: JSON
- **Context**: User, Session, Request
- **Storage**: 30 days
- **Rotation**: Daily

#### Resolution
- **Triage**: Priority levels
- **Assignment**: Team rotation
- **Escalation**: Time-based
- **Documentation**: Root cause
- **Prevention**: Post-mortem

### 9. Analytics Integration

#### Event Tracking
- **User Actions**: Clicks, forms
- **Navigation**: Page views
- **Performance**: Load times
- **Errors**: Client-side
- **Custom**: Business metrics

#### Tools
- **Web Analytics**: Google Analytics
- **Heatmaps**: Hotjar
- **Session Recording**: FullStory
- **A/B Testing**: Optimizely
- **Custom**: Internal dashboards

### 10. Documentation Standards

#### Code Documentation
- **Comments**: JSDoc format
- **Types**: TypeScript interfaces
- **Examples**: Usage snippets
- **Deprecation**: Clear notices
- **Changelog**: Version history

#### Style Guide
- **Components**: Atomic design
- **Naming**: BEM methodology
- **Formatting**: Prettier rules
- **Imports**: Ordered groups
- **Exports**: Named/default

### 11. Development Workflow

#### Git Flow
- **Main**: Production
- **Develop**: Staging
- **Feature**: Feature branches
- **Release**: Version tags
- **Hotfix**: Emergency fixes

#### Code Review
- **Process**: Pull requests
- **Checklist**: Required items
- **Approval**: 2 reviewers
- **Automation**: CI checks
- **Documentation**: Required

### 12. Dependency Management

#### Updates
- **Schedule**: Weekly
- **Automation**: Dependabot
- **Testing**: Pre-merge
- **Breaking Changes**: Manual review
- **Lock File**: Required

#### Security
- **Audits**: Weekly scans
- **Patches**: Automatic
- **Vulnerabilities**: Immediate
- **Reporting**: Security team
- **Compliance**: Regular checks

### 13. Browser Support

#### Compatibility
- **Chrome**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions
- **Edge**: Latest 2 versions
- **Mobile**: iOS/Android latest

#### Polyfills
- **Core-js**: ES features
- **Intersection Observer**: Lazy loading
- **Fetch**: API requests
- **Custom Elements**: Web components
- **CSS Variables**: Theme support

### 14. SEO Optimization

#### Meta Tags
- **Title**: Dynamic per page
- **Description**: Unique content
- **Keywords**: Relevant terms
- **Open Graph**: Social sharing
- **Twitter Cards**: Twitter sharing

#### Technical SEO
- **Sitemap**: Dynamic generation
- **Robots.txt**: Custom rules
- **Canonical URLs**: Duplicate content
- **Structured Data**: Schema.org
- **Performance**: Core Web Vitals

### 15. Social Media Integration

#### Sharing
- **Platforms**: Facebook, Twitter, WhatsApp
- **Content**: Dynamic previews
- **Tracking**: UTM parameters
- **Analytics**: Share counts
- **Custom**: Platform-specific

#### Authentication
- **Providers**: Google, Facebook
- **Data**: Minimal scope
- **Security**: OAuth 2.0
- **User Experience**: Seamless
- **Fallback**: Email/password

### 16. Payment Integration

#### Gateway
- **Provider**: Stripe
- **Currency**: SAR
- **Methods**: Card, Apple Pay
- **Security**: PCI compliance
- **Testing**: Test cards

#### Flow
- **Checkout**: One-page
- **Validation**: Real-time
- **Confirmation**: Email/SMS
- **Refunds**: Partial/full
- **Disputes**: Resolution process

### 17. Notification System

#### Channels
- **Email**: Transactional
- **SMS**: Important updates
- **Push**: Real-time
- **In-App**: User actions
- **Webhook**: Third-party

#### Templates
- **Booking**: Confirmation
- **Reminder**: Upcoming
- **Payment**: Receipt
- **Review**: Request
- **System**: Updates

### 18. Search Implementation

#### Features
- **Full-text**: Content search
- **Filters**: Dynamic
- **Sorting**: Multiple options
- **Suggestions**: Auto-complete
- **History**: Recent searches

#### Performance
- **Indexing**: Real-time
- **Caching**: Results
- **Debouncing**: Input
- **Pagination**: Infinite scroll
- **Analytics**: Search terms

### 19. Caching Strategy

#### Levels
- **Browser**: Static assets
- **CDN**: Global content
- **API**: Response cache
- **Database**: Query cache
- **Application**: State cache

#### Configuration
- **TTL**: 24 hours
- **Invalidation**: Manual/auto
- **Storage**: Redis
- **Monitoring**: Cache hits
- **Fallback**: Stale-while-revalidate

### 20. Backup and Recovery

#### Schedule
- **Database**: Hourly
- **Files**: Daily
- **Configuration**: Weekly
- **Logs**: Monthly
- **Full**: Quarterly

#### Procedures
- **Testing**: Monthly
- **Storage**: Multiple locations
- **Encryption**: At rest
- **Retention**: 1 year
- **Documentation**: Step-by-step
