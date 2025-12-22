# SkyTrip Design System - Agent Definition

## Overview

This document defines the design system for the SkyTrip flight booking application, based on the mockup designs provided in the sample screenshots (Sample1, Sample2, Sample3).

## Important Context: Flight Mockup → Train Application

**⚠️ CRITICAL ADAPTATION NOTE**: 

The mockup designs (Sample1, Sample2, Sample3) are **dedicated to flights**, but our application is **focused on trains**. This means we need to adapt:

1. **Screens**: Visual elements and layouts need to be adapted from flight terminology to train terminology
2. **Logic**: Business logic must be adapted from flight booking to train journey planning
3. **Semantics**: All terminology, labels, and data structures need to be converted:
   - "Flights" → "Trains" / "Journeys"
   - "Airports" → "Train Stations"
   - "Airlines" → "Train Operators" / "Transport Companies"
   - "Flight duration" → "Journey duration"
   - "Departure/Arrival gates" → "Platform numbers"
   - "Seat classes" → "Train classes" (First, Second, etc.)

**Adaptation Strategy**:
- Keep the visual design and component structure from the mockups
- Replace all flight-specific terminology with train-specific terminology
- Adapt icons: Use `Train` instead of `Plane` icons where appropriate
- Modify data models to reflect train journey structure (stations, lines, operators)
- Update search logic to work with train schedules and routes

## Design Principles

- **Modern & Clean**: Minimalist design with clear visual hierarchy
- **Mobile-First**: Responsive design optimized for mobile devices
- **Consistent Iconography**: Use Lucide React icons exclusively (no Font Awesome icons)
- **Accessible**: High contrast, readable typography, and clear interactive elements

## Screenshots Reference

The design is based on three main mockup screens:

- **Sample1** (`samples/sample1.png`): Home page with search card and flight results
- **Sample2** (`samples/sample2.png`): Saved flights page with tabs and flight cards
- **Sample3** (`samples/sample3.png`): Flight selection page with date picker and detailed flight list

## Color Palette

- **Background**: `#f4f4f8` (Light gray background)
- **Primary Text**: `#333` (Dark gray)
- **Secondary Text**: `#888` (Medium gray)
- **Primary Accent**: `#1a73e8` (Blue)
- **Warning/Orange**: `#ff8c00` (Orange)
- **White**: `#ffffff` (Cards and surfaces)
- **Status Active**: `#fff0e1` (Light orange background)

## Typography

- **Font Family**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
- **Headings**: Bold, various sizes (h1: large, h2: medium, h3: small)
- **Body Text**: Regular weight, 14-16px
- **Labels**: Smaller, lighter weight for form labels

## Icon System

**IMPORTANT**: Use **Lucide React icons only**. No Font Awesome icons should be used.

### Common Icon Mappings

- Navigation: `ArrowLeft`, `ArrowRight`, `ChevronRight`, `ChevronDown`, `ChevronUp`
- Actions: `Search`, `MoreVertical`, `MoreHorizontal`, `Bookmark`, `Bell`
- Transportation: `Train`, `TrainFront` (for train journeys - **preferred over Plane icons**), `Plane`, `PlaneTakeoff`, `PlaneLanding` (from mockup, to be adapted)
- UI Elements: `ArrowLeftRight` (for swap), `X` (close), `CheckCircle2` (success)

**Note**: While the mockup uses plane icons, we should use train icons (`Train`, `TrainFront`) for the actual train application.

### Icon Usage

Icons should be imported directly from `lucide-react`:

```tsx
import { ArrowLeft, Search, Plane, Bookmark } from 'lucide-react';
```

Size guidelines:
- Small icons: `16px` (default)
- Medium icons: `20px`
- Large icons: `24px`

## Component Library

### 1. Header Component

**Location**: `src/components/skytrip/Header.tsx`

**Features**:
- User avatar and greeting
- User name display
- Notification bell icon (Lucide `Bell`)

**Usage**:
```tsx
<Header 
  greeting="Good Morning!"
  userName="Andrew Ainsley"
  showNotification={true}
/>
```

### 2. PageHeader Component

**Location**: `src/components/skytrip/PageHeader.tsx`

**Variants**:
- `default`: Simple header with title and back button
- `with-route`: Header with flight route information

**Features**:
- Back button (Lucide `ArrowLeft`)
- Title
- Optional search button (Lucide `Search`)
- Optional menu button (Lucide `MoreVertical`)
- Route display with plane icon (Lucide `Plane`)
- Selected date display

**Icons Used**:
- `ArrowLeft` - Back navigation
- `Search` - Search action
- `MoreVertical` - Menu
- `Plane` - Route indicator (from mockup - **adapt to `Train` or `TrainFront` for train application**)

### 3. SearchCard Component

**Location**: `src/components/skytrip/SearchCard.tsx`

**Features**:
- Tab navigation (One-Way, Round Trip, Multi-City) - **Adapt to train journey types**
- From/To location inputs - **Adapt: "From Station" / "To Station"**
- Swap button (Lucide `ArrowLeftRight`)
- Departure date input - **Adapt: "Departure Date" for train schedules**
- Passengers and class selection - **Adapt: "Passengers" and "Train Class" (First/Second)**
- Search button - **Adapt: "Search Trains"**

**Icons Used**:
- `ArrowLeftRight` - Swap locations

### 4. FlightCard Component

**Location**: `src/components/skytrip/FlightCard.tsx`

**Variants**:
- `default`: Standard flight card
- `compact`: Condensed version
- `detailed`: Full details with timeline
- `saved`: Saved flight card with header/footer

**Features** (to be adapted for trains):
- Airport codes and city names → **Train station codes and station names**
- Departure and arrival times → **Train departure/arrival times**
- Flight duration → **Journey duration**
- Airline name → **Train operator / Transport company**
- Price display → **Ticket price**
- Flight timeline visualization → **Train journey timeline**
- Custom header/footer support

**Icons Used** (to be adapted):
- `Plane` - Flight path indicator → **Adapt to `Train` or `TrainFront`**
- `PlaneTakeoff` - Departure indicator → **Adapt to `Train` or `MapPin` for stations**
- `Bookmark` - Save indicator

### 5. FlightList Component

**Location**: `src/components/skytrip/FlightList.tsx`

**Features**:
- Section title
- "See All" link
- List of flight cards
- Multiple variants support

### 6. FlightTimeline Component

**Location**: `src/components/skytrip/FlightTimeline.tsx`

**Variants**:
- `default`: Simple timeline
- `compact`: Condensed timeline
- `detailed`: Full timeline with duration and type

**Features** (to be adapted for trains):
- Departure and arrival times → **Train departure/arrival times**
- Visual flight path with dots and line → **Train journey path visualization**
- Plane icon (Lucide `Plane`) → **Adapt to `Train` or `TrainFront`**
- Duration and flight type (for detailed variant) → **Duration and journey type (Direct/With transfers)**

**Icons Used** (to be adapted):
- `Plane` - Flight path indicator → **Adapt to `Train` or `TrainFront`**

### 7. Tabs Component

**Location**: `src/components/skytrip/Tabs.tsx`

**Variants**:
- `default`: Standard tabs
- `rounded`: Rounded tab buttons

**Features**:
- Tab navigation
- Active state styling
- Click handlers

### 8. DateSelector Component

**Location**: `src/components/skytrip/DateSelector.tsx`

**Features**:
- Horizontal scrollable date cards
- Day and date display
- Active state highlighting
- "See All" option

## Page Layouts

### Sample1: Home Page

**File**: `src/pages/Sample1.tsx`

**Layout**:
1. Header with user greeting
2. SearchCard with tabs and form
3. FlightList with results

**Key Features** (to be adapted):
- One-way flight search → **One-way train journey search**
- Flight results display → **Train journey results display**
- Clean, centered layout

### Sample2: Saved Flights

**File**: `src/pages/Sample2.tsx`

**Layout**:
1. PageHeader with back button and search
2. Tabs (Active/Expired)
3. List of saved flight cards

**Key Features** (to be adapted):
- Tab navigation
- Saved flight cards → **Saved train journey cards** with:
  - Airline header with plane icon → **Train operator header with train icon** (Lucide `Train` or `TrainFront`)
  - Bookmark icon (Lucide `Bookmark`)
  - Date and status footer
- Rounded tab variant

**Icons Used** (to be adapted):
- `PlaneTakeoff` - Airline indicator → **Adapt to `Train` or `TrainFront` for train operator**
- `Bookmark` - Saved indicator

### Sample3: Flight Selection

**File**: `src/pages/Sample3.tsx`

**Layout**:
1. PageHeader with route information
2. DateSelector for date picking
3. FlightList with detailed flight cards

**Key Features** (to be adapted):
- Route display in header (from/to with plane icon) → **Route display with train icon** (from/to stations)
- Selected date display
- Horizontal date selector
- Detailed flight cards with timeline → **Detailed train journey cards with timeline**

**Icons Used** (to be adapted):
- `Plane` - Route indicator → **Adapt to `Train` or `TrainFront`**
- `MoreVertical` - Menu button

## Spacing & Layout

- **Page Padding**: `20px` or `15-20px` for mobile
- **Card Spacing**: `20px` margin between cards
- **Section Spacing**: `30px` top margin for sections
- **Card Border Radius**: Varies by component (typically `8-15px`)

## Interactive Elements

### Buttons

- **Primary Button**: Full width, prominent background, white text
- **Secondary Button**: Outlined or light background
- **Icon Buttons**: Circular or square, icon-only
- **Status Buttons**: Rounded, colored background (e.g., Active status: `#fff0e1` background, `#ff8c00` text)

### Input Fields

- Label above input
- Placeholder text
- Clear visual hierarchy
- Optional helper text below

### Cards

- White background
- Subtle shadows
- Rounded corners
- Padding: `15-20px`

## Responsive Behavior

- Mobile-first approach
- Cards stack vertically
- Horizontal scrolling for date selector
- Full-width buttons on mobile
- Touch-friendly tap targets (minimum 44x44px)

## Accessibility

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- High contrast text
- Focus states for interactive elements

## Implementation Notes

1. **Icon Migration**: All Font Awesome icon references should use the `Icon` component from `src/utils/iconMapping.tsx`, which maps to Lucide icons
2. **Train Adaptation**: Replace all flight-related icons (`Plane`, `PlaneTakeoff`) with train icons (`Train`, `TrainFront`) where appropriate
3. **Terminology Adaptation**: Update all text labels, variable names, and component props to use train terminology
4. **Data Model Adaptation**: Adapt data structures from flight-based to train-based (stations instead of airports, operators instead of airlines, etc.)
5. **Styling**: Use SCSS modules for component-specific styles
6. **TypeScript**: All components should be typed with proper interfaces
7. **State Management**: Use React hooks for local state management
8. **Date Management**: All date formatting and parsing utilities are centralized in `src/utils/dateUtils.ts`. Use functions like `formatDateString()`, `formatDateTimeString()`, `parseUTCDate()`, `formatDate()`, and `formatTime()` from this module instead of creating duplicate date handling code.

## API Client Architecture

**IMPORTANT**: The API client is generated from an OpenAPI specification.

1. **API Contract Definition**: `openapi.json` defines the API contract first
2. **Client Generation**: `src/client` is automatically generated from the OpenAPI specification
3. **Update Workflow**: If you need to update the API:
   - **First**: Modify `openapi.json` to reflect the API changes
   - **Then**: Regenerate the client (the client code in `src/client` should not be manually edited as it will be overwritten during regeneration)

## Example Component Structure

```tsx
import React from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import './ComponentName.scss';

interface ComponentNameProps {
  // Props definition
}

const ComponentName: React.FC<ComponentNameProps> = ({
  // Destructured props
}) => {
  return (
    <div className="skytrip-component-name">
      {/* Component content */}
    </div>
  );
};

export default ComponentName;
```

## Design Tokens Summary

- **Background**: `#f4f4f8`
- **Card Background**: `#ffffff`
- **Primary Text**: `#333`
- **Secondary Text**: `#888`
- **Primary Accent**: `#1a73e8`
- **Warning/Orange**: `#ff8c00`
- **Active Status BG**: `#fff0e1`
- **Border Radius**: `8-15px` (varies)
- **Font**: System font stack
- **Icon Library**: Lucide React only

---

## Adaptation Checklist

When implementing components based on the mockups, ensure:

- [ ] Replace "Flight" terminology with "Train" / "Journey"
- [ ] Replace "Airport" with "Train Station"
- [ ] Replace "Airline" with "Train Operator" / "Transport Company"
- [ ] Replace `Plane` icons with `Train` or `TrainFront` icons
- [ ] Update search logic for train schedules and routes
- [ ] Adapt data models to train journey structure
- [ ] Update form labels and placeholders
- [ ] Modify timeline components to show train journey path
- [ ] Update status indicators for train-specific states

---

**Last Updated**: Based on Sample1, Sample2, and Sample3 mockups (flight-focused, to be adapted for trains)
**Icon Policy**: Lucide React icons only - no Font Awesome icons. Use train icons (`Train`, `TrainFront`) instead of plane icons for the train application.

