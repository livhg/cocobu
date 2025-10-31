# Design Document: Mobile-First Redesign

## Context

CocoBu is an expense tracking app where the primary use case is mobile web access. Users will record expenses on-the-go at restaurants, shops, and during travel. The current frontend (from `foundation-setup`) has basic responsive design but lacks mobile-first optimization.

### Background
- **Current state**: Next.js 14 with Tailwind CSS, basic responsive breakpoints
- **Tech stack**: React 18, TypeScript, Tailwind CSS, Zustand, React Query
- **Target devices**: Primarily smartphones (iOS Safari, Android Chrome)
- **Secondary devices**: Tablets and desktop browsers (progressive enhancement)

### Constraints
- **Must maintain**: Desktop usability (no regression)
- **Must preserve**: Type safety, existing component API contracts
- **Performance budget**: <100KB additional JavaScript (gzipped)
- **Browser support**: iOS Safari 14+, Chrome 90+, Firefox 88+

### Stakeholders
- **End users**: Need fast, intuitive mobile expense entry
- **Developers**: Need maintainable, reusable component patterns
- **Operations**: Need reliable PWA and offline capabilities

## Goals / Non-Goals

### Goals
1. **Mobile-first UI**: All interactions optimized for touch and small screens
2. **PWA capabilities**: Installable app with offline viewing
3. **Performance**: Lighthouse mobile score >90
4. **Accessibility**: WCAG 2.1 AA compliance, 44x44px touch targets
5. **Developer experience**: Clear patterns for future mobile-first features

### Non-Goals
- Native mobile apps (iOS/Android) - Web app only
- Desktop-only features (hover states, right-click menus)
- Advanced mobile features (camera, GPS, contacts integration)
- Dark mode (separate change proposal)
- Internationalization updates (already handled elsewhere)

## Key Decisions

### Decision 1: Navigation Pattern - Bottom Tabs + Drawer Hybrid

**Options Considered:**
1. **Top navigation bar (current)** - Desktop pattern, hard to reach on mobile
2. **Hamburger menu only** - Hides navigation, requires extra tap
3. **Bottom tabs only** - Limited to 3-5 items, no space for secondary nav
4. **Bottom tabs + drawer hybrid** ✅ **SELECTED**

**Rationale:**
- Bottom tabs for 3-4 primary sections (Dashboard, Books, Profile)
- Drawer for secondary navigation and settings
- Follows iOS and Android native app conventions
- Thumb-friendly zone (bottom 1/3 of screen)
- Scales to desktop with sidebar automatically

**Implementation:**
- `BottomNavigation` component with tab bar
- `MobileDrawer` component with slide-out animation
- Zustand store for navigation state
- CSS `@media (min-width: 768px)` switches to sidebar on tablet+

**Code Location:**
- `apps/web/src/components/navigation/BottomNavigation.tsx`
- `apps/web/src/components/navigation/MobileDrawer.tsx`
- `apps/web/src/stores/navigation-store.ts`

### Decision 2: PWA Service Worker Strategy - Stale-While-Revalidate

**Options Considered:**
1. **Network-first** - Fresh data but slow on poor connections
2. **Cache-first** - Fast but stale data
3. **Stale-while-revalidate** ✅ **SELECTED**
4. **Cache-then-network** - Complex, overkill for MVP

**Rationale:**
- Instant response from cache (stale)
- Background update for next visit (revalidate)
- Best balance of speed and freshness for expense tracking
- Workbox built-in strategy, minimal code

**Implementation:**
```javascript
// Service worker strategy
{
  urlPattern: /^https:\/\/api\.cocobu\.online\/books/,
  handler: 'StaleWhileRevalidate',
  options: {
    cacheName: 'api-cache',
    expiration: {
      maxEntries: 50,
      maxAgeSeconds: 86400, // 24 hours
    },
  },
}
```

**Offline Behavior:**
- **Read operations**: Serve from cache (books, entries)
- **Write operations**: Show "offline" message, queue for sync (future M2)
- **Authentication**: Fail gracefully, require online for login

**Code Location:**
- `apps/web/src/service-worker.ts`
- `apps/web/next.config.js` (PWA plugin configuration)

### Decision 3: Gesture Library - react-swipeable

**Options Considered:**
1. **Custom implementation** - Full control but high maintenance
2. **use-gesture** - Powerful but heavy (20KB+)
3. **react-swipeable** ✅ **SELECTED** - Lightweight (3KB), simple API
4. **framer-motion** - Animation-focused, overkill for swipes

**Rationale:**
- Bundle size: Only 3KB gzipped
- Simple API: `useSwipeable({ onSwipedLeft, onSwipedRight })`
- Touch and mouse support (desktop testing)
- No animation library needed (use CSS transitions)

**Use Cases:**
- Swipe-to-delete on entry cards
- Swipe between tabs (optional)
- Pull-to-refresh (combine with custom hook)

**Implementation:**
```tsx
import { useSwipeable } from 'react-swipeable';

const handlers = useSwipeable({
  onSwipedLeft: () => handleDelete(),
  onSwipedRight: () => handleEdit(),
  trackMouse: true, // Desktop testing
});

<div {...handlers}>Entry Card</div>
```

**Code Location:**
- `apps/web/src/hooks/useSwipeActions.ts` (custom wrapper)
- Applied to: `EntryCard`, `BookCard` components

### Decision 4: Touch Target Minimum - 44x44px via Tailwind Plugin

**Standard:**
- WCAG 2.1 Level AAA: 44x44px minimum
- iOS Human Interface Guidelines: 44pt (44px @1x)
- Material Design: 48dp (48px)

**Decision:**
- Enforce 44x44px minimum across all interactive elements
- Create Tailwind plugin to add `.touch-target` utility

**Implementation:**
```javascript
// tailwind.config.js
module.exports = {
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.touch-target': {
          'min-width': '44px',
          'min-height': '44px',
        },
      })
    }
  ]
}
```

**Component Updates:**
- `Button`: Default `h-11` (44px) instead of `h-10`
- `IconButton`: Fixed `w-11 h-11`
- `Input`: Height `h-11` for touch-friendly form fields
- `Card` actions: Ensure interactive areas meet minimum

**Audit Strategy:**
- Add ESLint rule to warn on `h-` or `w-` values <44px for interactive elements
- Manual testing with Chrome DevTools touch emulation

**Code Location:**
- `apps/web/tailwind.config.js`
- `apps/web/src/components/ui/*` (all interactive components)

### Decision 5: Form Input Types - Native Mobile Keyboards

**Decision:**
- Use HTML5 input types to trigger appropriate mobile keyboards
- Avoid custom datepickers (use native `<input type="date">`)

**Mappings:**
```tsx
// Email input
<input type="email" inputMode="email" />

// Amount input
<input type="number" inputMode="decimal" pattern="[0-9]*" />

// Date input
<input type="date" /> // Native picker on iOS/Android

// Phone input
<input type="tel" inputMode="tel" />
```

**Benefits:**
- Native keyboard automatically (numeric for amounts, email keyboard for email)
- Browser validation built-in
- Better UX than custom implementations
- No additional JavaScript required

**Exceptions:**
- Currency picker: Custom select with search (no native equivalent)
- Category picker: Custom modal with icons (better UX than select)

**Code Location:**
- `apps/web/src/components/ui/Input.tsx` (add `inputMode` prop)
- `apps/web/src/components/forms/AmountInput.tsx`
- `apps/web/src/components/forms/DateInput.tsx`

## Architecture Changes

### Component Hierarchy (New)

```
RootLayout (apps/web/src/app/layout.tsx)
├─ QueryProvider (React Query)
├─ MobileNavigation (Bottom tabs + drawer)
│  ├─ BottomTabBar (Dashboard, Books, Profile)
│  └─ MobileDrawer (Settings, Help, Logout)
└─ PageContent
   ├─ DashboardPage
   ├─ BooksPage
   └─ ProfilePage
```

### State Management (New Stores)

```typescript
// apps/web/src/stores/navigation-store.ts
interface NavigationStore {
  currentTab: 'dashboard' | 'books' | 'profile';
  drawerOpen: boolean;
  setTab: (tab: string) => void;
  toggleDrawer: () => void;
}

// apps/web/src/stores/pwa-store.ts
interface PWAStore {
  isInstalled: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
  showInstallPrompt: () => void;
  dismissInstallPrompt: () => void;
}
```

### File Structure (New Components)

```
apps/web/src/
├── components/
│   ├── navigation/
│   │   ├── BottomNavigation.tsx     # Bottom tab bar
│   │   ├── MobileDrawer.tsx         # Slide-out drawer
│   │   └── FloatingActionButton.tsx # FAB for create actions
│   ├── mobile/
│   │   ├── BottomSheet.tsx          # Bottom sheet for forms
│   │   ├── PullToRefresh.tsx        # Pull-to-refresh wrapper
│   │   └── SwipeableCard.tsx        # Card with swipe actions
│   └── pwa/
│       ├── InstallPrompt.tsx        # PWA install banner
│       ├── OfflineBanner.tsx        # Offline mode indicator
│       └── UpdatePrompt.tsx         # Service worker update
├── hooks/
│   ├── useSwipeActions.ts           # Swipe gesture hook
│   ├── usePWA.ts                    # PWA install/update hook
│   └── useBottomSheet.ts            # Bottom sheet state
├── service-worker.ts                # Workbox service worker
└── manifest.json                    # PWA manifest
```

## Risks / Trade-offs

### Risk 1: Service Worker Cache Staleness
**Risk**: Users see outdated data when offline cache is stale
**Mitigation**:
- Stale-while-revalidate ensures background updates
- Cache expiry after 24 hours
- Manual refresh option in UI
- Show "last updated" timestamp on cached data

### Risk 2: Breaking Changes to Navigation UX
**Risk**: Users confused by new bottom navigation, don't find features
**Mitigation**:
- Add first-visit tooltips explaining new navigation
- Maintain URL structure (no routing changes)
- Provide feedback link prominently in drawer
- A/B test with small user group before full rollout (post-launch)

### Risk 3: Bundle Size Increase
**Risk**: Additional PWA and gesture libraries increase load time
**Mitigation**:
- Lazy load PWA components (only show install prompt after 10s)
- Code split navigation components (load after initial render)
- Optimize Tailwind (PurgeCSS removes unused classes)
- Monitor bundle size in CI (<100KB increase limit)

### Risk 4: iOS Safari PWA Limitations
**Risk**: iOS Safari has limited PWA support (no push notifications, limited storage)
**Mitigation**:
- Document limitations in user-facing help
- Use progressive enhancement (features work without PWA)
- Prioritize features supported on iOS (offline cache, install)
- Consider future native iOS app if limitations are blocking

### Risk 5: Touch Gesture False Positives
**Risk**: Swipe gestures trigger accidentally (e.g., during scrolling)
**Mitigation**:
- Require minimum swipe distance (>50px)
- Require minimum swipe velocity
- Add visual feedback (card moves with finger)
- Allow undo for destructive actions (swipe-to-delete)
- Provide alternative action buttons (don't rely on gestures alone)

## Migration Plan

### Phase 1: Navigation (Week 1)
1. Build `BottomNavigation` and `MobileDrawer` components
2. Update `apps/web/src/app/layout.tsx` to use new navigation
3. Test on mobile devices
4. Deploy as feature flag (optional, or direct deploy given MVP status)

### Phase 2: Layouts (Week 1)
1. Update all page layouts for mobile-first
2. Ensure touch target minimums enforced
3. Test responsive breakpoints
4. Deploy

### Phase 3: PWA (Week 2)
1. Configure Next.js for PWA
2. Build service worker with workbox
3. Add install prompt component
4. Test offline functionality
5. Deploy

### Phase 4: Touch Interactions (Week 2)
1. Implement swipe gestures
2. Add pull-to-refresh
3. Build bottom sheet component
4. Test gesture accuracy
5. Deploy

### Phase 5: Polish (Week 3)
1. Performance optimization
2. Accessibility audit
3. Documentation
4. Final testing
5. Deploy

### Rollback Strategy
- Each phase deployed independently
- Feature flags for navigation changes (optional)
- Revert PR if critical issues found
- No database migrations involved - clean rollback

## Open Questions

### Q1: Animation Library - CSS vs. Framer Motion?
**Status**: Open
**Options**:
- CSS transitions only (lightweight, sufficient for MVP)
- Framer Motion (better animations, 40KB bundle increase)

**Recommendation**: Start with CSS transitions, add Framer Motion later if needed

### Q2: Offline Write Queue - Implement in MVP or M2?
**Status**: Open
**Options**:
- MVP: Read-only offline mode (simpler)
- MVP: Full offline with background sync (complex)

**Recommendation**: Read-only for MVP, full sync in M2 (aligns with project.md simplicity-first principle)

### Q3: Install Prompt Timing - Immediate or Delayed?
**Status**: Open
**Options**:
- Show immediately on first visit (might be annoying)
- Show after 10 seconds (less intrusive)
- Show after first successful action (e.g., add entry)

**Recommendation**: Show after 10 seconds on second visit (user has seen value, less spammy)

### Q4: Bottom Tabs - 3 tabs or 4 tabs?
**Status**: Open
**Options**:
- 3 tabs: Dashboard, Books, Profile
- 4 tabs: Dashboard, Books, Add, Profile (FAB alternative)

**Recommendation**: 3 tabs + FAB (cleaner, FAB is more discoverable for primary action)

## Success Metrics

### Performance
- Lighthouse mobile score: >90 (target 95+)
- First Contentful Paint (FCP): <1.5s
- Time to Interactive (TTI): <3s
- Bundle size increase: <100KB gzipped

### PWA
- Install rate: Track via analytics (goal: >10% of returning users)
- Offline usage: Track cache hit rate (goal: >50% for books API)
- Return visit speed: <1s with service worker (vs. >2s without)

### Usability
- Touch target compliance: 100% of interactive elements ≥44x44px
- Accessibility audit: WCAG 2.1 AA passing (0 critical issues)
- Mobile usability: Google Search Console reports 0 mobile issues

### User Feedback (Post-Launch)
- Mobile satisfaction: Survey responses (goal: >4/5 stars)
- Navigation confusion: Support tickets about "can't find X" (goal: <5% of users)

## References

### Standards and Guidelines
- [WCAG 2.1 Touch Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [iOS Human Interface Guidelines - Layout](https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/adaptivity-and-layout/)
- [Material Design - Navigation](https://m3.material.io/components/navigation-bar)

### Technical Documentation
- [Next.js PWA Plugin](https://github.com/shadowwalker/next-pwa)
- [Workbox Strategies](https://developers.google.com/web/tools/workbox/modules/workbox-strategies)
- [react-swipeable](https://www.npmjs.com/package/react-swipeable)

### Inspiration
- Splitwise mobile web (bottom navigation pattern)
- YNAB mobile (offline-first approach)
- Notion mobile (bottom sheet for actions)
