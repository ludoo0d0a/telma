# Design & UX Review – Telma

**Scope:** Mobile-first, full-width, Material Design 3 principles, coherent navigation.

---

## 1. Current State Summary

### Layout Structure
- **PageHeader** (Skytrip): Orange gradient (#ff6f00), rounded bottom corners, white text. Not fixed – scrolls with content.
- **Sidebar**: Left drawer (280px), opens via "More" in bottom nav. Backdrop overlay.
- **BottomNavbar**: Fixed at bottom, 5 items (Home, Trajet, Horaires, More, Favoris). Pill-shaped, max-width 400px.
- **Footer**: Primary-colored bar, used on most pages.

### Issues Identified

| Issue | Severity | Details |
|-------|----------|---------|
| **No fixed top bar** | High | PageHeader scrolls away; no persistent navigation anchor on mobile |
| **Body padding mismatch** | Medium | `body { padding-top: 52px }` in _header.scss targets legacy navbar; current header is ~100px+ tall |
| **Content width constraint** | Medium | PageLayout uses `maxWidth: 'md'` (900px) – not full-width on large screens |
| **Bottom nav overlap** | High | Many pages lack `padding-bottom` for fixed bottom nav; content can be hidden |
| **Inconsistent page structure** | Medium | Home uses `Box` + `pb: 10`; others use PageLayout; City uses custom `.city` |
| **Theme not M3** | Medium | Custom orange palette; no M3 design tokens, surface tints, or tonal elevation |
| **Font mismatch** | Low | Open Sans in _settings.scss vs MUI default (Roboto); M3 typically uses system fonts |

---

## 2. Navigation Coherence

### Current Flow
```
App
├── Sidebar (drawer, left)
├── Routes (page content)
└── BottomNavbar (fixed bottom)
```

### Gaps
1. **Top bar**: No persistent top bar. Menu (☰) lives inside PageHeader, which scrolls away.
2. **Back behavior**: `leftAction: 'back'` exists but usage is inconsistent across pages.
3. **Drawer trigger**: Only via "More" in bottom nav; no hamburger in a fixed top bar.
4. **Bottom nav vs drawer**: Bottom nav = 4 main routes + More. Drawer = full list. Overlap (Home, Trajet, Horaires, Favoris) is correct; "More" as drawer entry point is clear.

### Recommendations
1. Add a **fixed top app bar** (MUI `AppBar`) that stays visible on scroll.
2. Put **menu** (☰) and **back** in the top bar; move PageHeader title/subtitle into the bar or a collapsible area.
3. Ensure **safe area** for top bar + bottom nav on all pages (e.g. `padding-top`, `padding-bottom`).

---

## 3. Mobile-First & Full Width

### Current
- Theme breakpoints: xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 ✓
- Touch targets: Button minHeight 44, IconButton 44×44 ✓
- PageLayout: `px: { xs: 2, sm: 3 }`, `maxWidth: 'md'` → content constrained to 900px

### Recommendations
1. **Full width**: Use `maxWidth: false` or `maxWidth: 'xl'` for main content; keep horizontal padding for readability.
2. **Mobile content**: Use `width: 100%` and `px` for safe area; avoid centering with max-width on small screens.
3. **Bottom nav**: Consider full-width bar on mobile (remove `max-width: 400px`) for easier tapping.

---

## 4. Material Design 3 Alignment

### M3 Principles (relevant)
- **Dynamic color**: Primary/secondary from user or brand; tonal palettes.
- **Typography**: Clear hierarchy; variable font support.
- **Shape**: Rounded corners, consistent radius.
- **Motion**: Meaningful transitions.
- **Layout**: Responsive, adaptive.

### Current vs M3
| Aspect | Current | M3 Target |
|--------|---------|-----------|
| Palette | Orange #f97316, emerald #10b981 | Use tonal palettes (primary container, on-primary, etc.) |
| Surfaces | Flat backgrounds | Surface tints, elevation |
| Components | MUI default | M3-style (e.g. filled buttons, tonal chips) |
| Shape | Mixed (PageHeader 25px radius, bottom nav 2rem) | Consistent radius scale (e.g. 0, 4, 8, 12, 16, 28) |

### Recommendations
1. Use MUI’s **experimental M3 theme** or define a custom theme with M3-like tokens.
2. Align **shape** (e.g. small: 8px, medium: 12px, large: 16px).
3. Use **surface containers** for cards/panels instead of flat white.

---

## 5. Implementation Priorities

### P0 – Critical (navigation & overlap)
1. **Fixed top app bar**: AppBar with menu, title, actions; always visible.
2. **Content safe area**: Ensure `padding-bottom` (e.g. 80–100px) on all pages for bottom nav.
3. **Remove body padding-top**: Replace with layout-driven spacing (e.g. main content `padding-top` = app bar height).

### P1 – High (consistency)
4. **Unified page shell**: Shared layout (AppBar + main + bottom nav) used by all pages.
5. **PageLayout full width**: `maxWidth: false` or responsive (full on mobile, constrained on desktop).
6. **Bottom nav full width on mobile**: Remove max-width on small screens.

### P2 – Medium (M3 polish)
7. **M3 theme**: Tonal palette, surface containers, consistent shape.
8. **Drawer as MUI Drawer**: Replace custom sidebar with `Drawer` for better behavior and a11y.

### P3 – Low
9. **Footer placement**: Consider moving footer above bottom nav or making it part of the main scroll.
10. **Font**: Align with M3 typography (e.g. Roboto or system font stack).

---

## 6. Proposed App Shell Structure

```
┌─────────────────────────────────────┐
│  AppBar (fixed)                     │
│  [☰] Title          [🔔] [Avatar]   │
├─────────────────────────────────────┤
│                                     │
│  Main content (scrollable)          │
│  - Full width with horizontal pad   │
│  - padding-bottom for bottom nav    │
│                                     │
├─────────────────────────────────────┤
│  BottomNavbar (fixed)                │
│  [Home] [Trajet] [Horaires] [More] [Favoris] │
└─────────────────────────────────────┘

Drawer (overlay, from left)
├── Home, Trajet, Horaires, Favoris (duplicate for quick access)
├── Places, Location, Dashboard, Stats...
└── About, API Docs
```

---

## 7. Files to Modify

| File | Changes |
|------|---------|
| `App.tsx` | Wrap routes in `AppShell` with fixed AppBar + main area |
| `theme.ts` | M3-style palette, shape, typography |
| `PageLayout.tsx` | `maxWidth: false` or responsive; add `pb` for bottom nav |
| `PageHeader.tsx` | Integrate into AppBar or simplify to title-only |
| `_header.scss` | Remove `body { padding-top }`; adjust for new layout |
| `_bottomNavbar.scss` | Full width on mobile; safe area insets |
| `_sidebar.scss` | Migrate to MUI Drawer or keep as overlay |
| All pages | Use shared layout; ensure `pb` for bottom nav |

---

## 8. Quick Wins

1. Add `paddingBottom: 10` (or 80–100px) to PageLayout for bottom nav clearance.
2. Set `PageLayout` `maxWidth={false}` for full-width content.
3. Add `position: sticky` to PageHeader so it stays at top while scrolling (short-term fix before full AppBar).
4. Remove `body { padding-top: 52px }` from _header.scss if no fixed navbar uses it.
