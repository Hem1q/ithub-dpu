# Tech Education Portal Design Guidelines

## Design Approach
**Selected Framework**: Material Design foundation customized for education, drawing inspiration from Coursera, Pluralsight, and modern learning platforms. Focus on clarity, progressive disclosure, and learning-friendly hierarchy.

## Typography System
- **Primary Font**: Inter (Google Fonts) - clean, highly legible for educational content
- **Headings**: 
  - H1: 3.5rem (56px), font-weight 700, tracking tight
  - H2: 2.5rem (40px), font-weight 600
  - H3: 1.75rem (28px), font-weight 600
  - H4: 1.25rem (20px), font-weight 600
- **Body**: 1rem (16px), font-weight 400, line-height 1.6 for comfortable reading
- **Small Text**: 0.875rem (14px) for metadata, captions

## Layout System
**Spacing Primitives**: Use Tailwind units of 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
- Section padding: py-20 desktop, py-12 mobile
- Card padding: p-6
- Element gaps: gap-6 for cards, gap-4 for form elements
- Container: max-w-7xl with px-6

## Component Architecture

### Navigation Header
- Sticky top navigation with subtle shadow on scroll
- Logo left, navigation center (Home, Courses, About, Contact), CTA button right ("Start Learning")
- Mobile: Hamburger menu with slide-in overlay
- Height: h-20, backdrop blur effect

### Hero Section
**Layout**: Full-width section with large background image showing students collaborating with technology/laptops in modern learning environment
- Content overlay: Dark gradient overlay (top to bottom, 60% opacity) for text contrast
- Centered content with max-w-4xl
- Headline + subtitle + dual CTAs ("Explore Courses" primary, "Watch Demo" secondary with blurred background)
- Height: 85vh minimum
- Include trust indicators below CTAs: "Join 50,000+ learners" with partner logos (Oracle, AWS, Cisco certification badges)

### Topic Cards Grid
**3-Column Layout** (desktop: grid-cols-3, tablet: grid-cols-2, mobile: grid-cols-1)
- Card structure: Image top (16:9 aspect), content section with icon, title, description, progress indicator, "Continue Learning" link
- Hover: Subtle lift (shadow-lg transition)
- Each card: rounded-xl, border, shadow-md
- Icons: Use Font Awesome for technology icons (fa-database for Oracle, fa-aws, fa-network-wired for Cisco)
- Include 6 cards minimum showcasing different course paths

### Course Detail Page Layout

**Split Layout**:
- Sidebar (left, w-80): Course navigation tree, progress tracking module, related courses widget
- Main content (flex-1): 
  - Course header with breadcrumb navigation
  - Large course thumbnail image
  - Stats row (duration, difficulty, enrolled students) with icons
  - Tabbed content (Overview, Curriculum, Reviews, FAQs)
  - Content sections with clear hierarchy
  - Sticky enrollment CTA card on right rail

### Additional Components
- **Progress Cards**: Circular progress indicators with percentage, completion status
- **Feature List**: Check-circle icons with benefit statements (6 items in 2-column grid)
- **Testimonial Section**: 3-card slider with student photos, quotes, names, roles
- **Stats Banner**: 4-column metrics (Courses, Students, Certifications, Partners) with large numbers
- **Footer**: 4-column mega footer (About, Courses, Resources, Contact) with newsletter signup and social links

## Images Strategy

### Required Images:
1. **Hero Background**: Wide shot of diverse students working on laptops in bright, modern learning space - professional photography style, soft natural lighting (1920x1080)
2. **Course Cards**: Technology-specific imagery - server rooms for Oracle, cloud infrastructure for AWS, network diagrams for Cisco (600x400 each)
3. **Detail Page Header**: Course-specific illustrations or screenshots (1200x600)
4. **Testimonials**: Professional headshots (200x200, circular crop)
5. **Partner Logos**: Oracle, AWS, Cisco certification badges (SVG preferred)

## Visual Hierarchy & Spacing
- Section breaks: mb-20 between major sections
- Card grids: gap-6
- Whitespace is generous but purposeful - breathing room around key CTAs
- Use shadow elevation to establish hierarchy: shadow-sm (cards), shadow-md (modals), shadow-lg (hover states)

## Special Treatments
- **Glassmorphism**: Apply to buttons over images (backdrop-blur-md, bg-white/20)
- **Gradient Accents**: Subtle blue-to-teal gradients for section dividers or card borders
- **Loading States**: Skeleton screens for course cards with shimmer animation
- **Micro-interactions**: Progress ring animations, smooth tab transitions, card hover lifts

## Page Structure Completeness
- **Homepage**: Hero + Trust Bar + Featured Courses Grid (6 cards) + Stats Banner + Testimonials (3) + Newsletter CTA + Footer
- **Course Page**: Header + Sidebar Navigation + Content Tabs + Related Courses (3 cards) + Sticky CTA
- All sections fully designed, no placeholders