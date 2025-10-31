# Proposal: Mobile-First Redesign

## Change ID
`mobile-first-redesign`

## Summary
Redesign the CocoBu frontend with mobile-first approach, optimizing UI/UX for smartphone web browsing as the primary interaction method. This includes responsive layouts, touch-optimized interactions, mobile navigation patterns, and progressive web app (PWA) enhancements for better mobile experience.

## Motivation

### Problem
The current frontend (from `foundation-setup`) has basic responsive design but was not optimized for mobile-first usage. Given that:

1. **Target users will primarily access via mobile web** - Expense tracking happens on-the-go, at restaurants, shops, and during travel
2. **Current implementation has desktop-first bias** - Navigation, button sizes, and layouts prioritize large screens
3. **Touch interactions need optimization** - Current components don't consider thumb zones, tap targets, or swipe gestures
4. **Mobile context is ignored** - No consideration for one-handed usage, portrait orientation, or limited screen real estate
5. **PWA features are scaffolded but not implemented** - Offline capability, install prompts, and mobile-specific features are missing

### User Pain Points
- Small tap targets difficult to hit accurately (minimum 44x44px not enforced)
- Desktop-style navigation doesn't work well on mobile (hamburger menu patterns missing)
- Form inputs don't optimize for mobile keyboards (numeric, email, date pickers)
- No consideration for portrait vs. landscape orientation
- Cannot add app to home screen or use offline effectively
- Bottom navigation would be more thumb-friendly than top navigation

### Why Now
- **foundation-setup** (223/229 tasks) has established the technical baseline
- Before implementing features (personal books, split books), we should optimize the UI shell
- Early adoption of mobile-first prevents costly rework later
- PWA features need to be integrated now, not retrofitted

## Proposed Solution

### High-Level Approach

#### 1. Mobile-First Component Library
**Rebuild key components with mobile optimization:**
- Minimum touch target: 44x44px (WCAG 2.1 AAA)
- Thumb-friendly zones (bottom 1/3 of screen for primary actions)
- Larger font sizes for mobile (16px minimum to prevent zoom)
- Simplified navigation optimized for small screens
- Mobile-optimized form components with appropriate input types

#### 2. Navigation Redesign
**Replace current top navigation with mobile-first patterns:**
- Bottom tab bar for primary navigation (Dashboard, Books, Profile)
- Slide-out drawer for secondary navigation and settings
- Sticky action buttons (FAB pattern) for create operations
- Breadcrumbs for deep navigation on desktop
- Hide/show navigation on scroll for more content space

#### 3. Layout Optimization
**Responsive grid system improvements:**
- Single-column layouts as default (mobile)
- Progressive enhancement for tablet (2-column) and desktop (3-column)
- Card-based layouts with adequate spacing for touch
- Full-bleed mobile, contained desktop
- Optimize for portrait orientation first

#### 4. Touch Interactions
**Implement mobile-friendly interaction patterns:**
- Swipe gestures (swipe-to-delete entries, swipe between pages)
- Pull-to-refresh on lists
- Long-press for contextual actions
- Drawer panels for filters/options (replace dropdowns)
- Bottom sheets for forms and actions (easier thumb reach)

#### 5. Progressive Web App (PWA) Enhancement
**Implement full PWA capabilities:**
- App manifest with proper icons and theme colors
- Service worker for offline functionality
- Offline mode for viewing entries (read-only)
- Background sync for draft entries created offline
- Install prompts and add-to-home-screen banners
- Splash screens and app-like transitions

#### 6. Mobile-Optimized Forms
**Improve form usability on mobile:**
- Appropriate input types (tel, email, number, date)
- Native date/time pickers
- Auto-focus and field navigation
- Inline validation with clear error messages
- Floating action buttons for submit
- Minimize typing with smart defaults and quick actions

#### 7. Performance Optimization
**Mobile network and performance considerations:**
- Lazy load images and heavy components
- Code splitting for faster initial load
- Optimize bundle size (remove unused Tailwind classes)
- Compress images and use modern formats (WebP, AVIF)
- Implement skeleton screens for perceived performance

### What Changes
- **MODIFIED**: All page layouts (home, dashboard, auth pages) for mobile-first approach
- **ADDED**: Bottom navigation component with tab bar
- **ADDED**: Mobile drawer component for secondary navigation
- **ADDED**: Floating action button (FAB) component for create actions
- **ADDED**: Bottom sheet component for forms and actions
- **ADDED**: Swipe gesture handlers for common interactions
- **ADDED**: PWA manifest, service worker, and offline capabilities
- **ADDED**: Mobile-optimized form components
- **MODIFIED**: Button and touch target sizes (minimum 44x44px)
- **MODIFIED**: Typography scale for mobile readability
- **ADDED**: Pull-to-refresh functionality for lists
- **ADDED**: Install prompt for PWA

### What This Does NOT Include
- Native mobile app (iOS/Android) - This remains a web app
- Advanced gestures (pinch-to-zoom, multi-touch) - Keep it simple
- Mobile-specific features (camera, GPS, contacts) - Future consideration
- Animations beyond basic transitions - Performance first
- Dark mode - Separate change proposal

## Impact Analysis

### User Impact
- **Mobile users**: Significantly improved experience with touch-optimized UI
- **Desktop users**: Still functional with progressive enhancement, no regression
- **All users**: Faster load times and offline capability

### System Impact
- **New dependencies**:
  - `framer-motion` or `react-spring` (optional, for animations)
  - `workbox` (service worker toolkit)
  - `react-swipeable` or similar for gesture handling
- **Bundle size**: May increase by 20-30KB (PWA runtime), but lazy loading offsets this
- **Build process**: Add PWA manifest generation and service worker compilation

### Migration Required
- None (visual changes only, no data model impact)

### Breaking Changes
- **Visual breaking changes**: Navigation and layout will change significantly
  - Users may need brief onboarding to discover new navigation patterns
  - Mitigation: Add subtle hints/tooltips on first visit

### Performance Considerations
- **Positive**: Lazy loading and code splitting reduce initial bundle
- **Positive**: Service worker caching speeds up repeat visits
- **Positive**: Touch-optimized UI reduces interaction latency
- **Neutral**: Gesture libraries add minimal overhead

### Security Considerations
- Service worker has access to network requests - must not cache sensitive data
- PWA offline storage must respect data privacy rules
- No impact on authentication or authorization flows

## Alternatives Considered

### Alternative 1: Keep Current Desktop-First Design
**Pros**: No work required, users adapt eventually
**Cons**: Poor mobile experience, high bounce rate, user frustration
**Decision**: Rejected - Primary use case is mobile

### Alternative 2: Build Separate Mobile and Desktop UIs
**Pros**: Optimal for each platform
**Cons**: Doubles maintenance, code duplication, inconsistent experience
**Decision**: Rejected - Responsive design is proven and maintainable

### Alternative 3: Use Mobile UI Framework (React Native Web, Ionic)
**Pros**: Mobile-optimized out of the box
**Cons**: Requires rewrite, vendor lock-in, limited customization
**Decision**: Rejected - Current stack (Next.js + Tailwind) is sufficient

### Alternative 4: Mobile-First Without PWA
**Pros**: Simpler implementation
**Cons**: Misses key benefits (offline, install, performance)
**Decision**: Rejected - PWA is expected feature for expense tracking apps

### Alternative 5: Implement After Feature Development
**Pros**: Ship features faster
**Cons**: Costly rework, inconsistent patterns, user experience debt
**Decision**: Rejected - Mobile-first is foundational, do it early

## Open Questions

### Resolved
None yet.

### Unresolved
1. **Navigation pattern**: Bottom tabs vs. hamburger menu vs. hybrid?
   - Recommendation: **Hybrid** - Bottom tabs for 3-4 primary sections, hamburger for overflow

2. **Gesture library**: Build custom vs. use library (react-swipeable, use-gesture)?
   - Recommendation: **react-swipeable** for simplicity and smaller bundle

3. **Service worker strategy**: Cache-first vs. network-first vs. stale-while-revalidate?
   - Recommendation: **Stale-while-revalidate** for balance of speed and freshness

4. **Animation approach**: CSS transitions vs. Framer Motion vs. none?
   - Recommendation: **CSS transitions** for simplicity, add Framer Motion later if needed

5. **Offline data strategy**: Read-only cache vs. full sync?
   - Recommendation: **Read-only cache** for MVP, full sync in M2

## Success Criteria

### Acceptance Criteria
1. All pages render correctly on mobile viewport (375x667px minimum)
2. All interactive elements meet 44x44px minimum touch target size
3. Bottom navigation implemented with 3-4 primary tabs
4. PWA manifest and service worker functional
5. App installable on mobile devices
6. Offline mode works for viewing cached data
7. All forms use appropriate mobile input types
8. Typography readable without zoom (16px minimum)
9. Performance: Lighthouse mobile score >90
10. Accessibility: WCAG 2.1 AA compliant

### Testing & Validation
- Manual testing on iPhone (Safari) and Android (Chrome)
- Responsive design testing in Chrome DevTools
- Lighthouse audit: Performance, PWA, Accessibility all >90
- Touch target size audit passes
- Install prompt appears and works correctly
- Offline mode tested by disabling network

### Rollback Plan
- Revert PR and redeploy previous version
- No database changes involved, clean rollback

## Timeline Estimate
**Effort**: 3-5 days for experienced frontend developer

- **Day 1**: Navigation redesign (bottom tabs, drawer)
- **Day 2**: Layout and component touch target optimization
- **Day 3**: PWA implementation (manifest, service worker)
- **Day 4**: Gesture handlers and mobile interactions
- **Day 5**: Testing, performance optimization, documentation

## Related Changes
- **Depends on**: `foundation-setup` (provides Next.js frontend baseline)
- **Blocks**: Future feature changes should inherit mobile-first patterns
- **Related**: `define-launch-strategy` (PWA affects deployment and monitoring)

## References
- `openspec/project.md` - Tech stack and PWA mention
- [WCAG 2.1 Touch Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Google Mobile-First Indexing](https://developers.google.com/search/mobile-sites/mobile-first-indexing)
- [Next.js PWA](https://github.com/shadowwalker/next-pwa)
- [Workbox Service Worker Library](https://developers.google.com/web/tools/workbox)
- [Material Design Mobile Navigation](https://m3.material.io/components/navigation-bar)
