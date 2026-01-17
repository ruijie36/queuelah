# Queuelah Design System - Apple Clean Aesthetic

## 🎨 5 Golden Rules for Consistent Design

### 1. **Typography Hierarchy**

Use SF Pro-style typography with precise weights and spacing:

```css
/* Headlines */
font-size: clamp(2.5rem, 5vw, 3.5rem);
font-weight: 600;
letter-spacing: -0.02em;
line-height: 1.1;
color: #1d1d1f;

/* Body Text */
font-size: 1.0625rem; /* 17px */
font-weight: 400;
line-height: 1.5;
color: #6e6e73;

/* Subheadings */
font-size: 1.375rem; /* 22px */
font-weight: 600;
letter-spacing: -0.01em;
color: #1d1d1f;
```

### 2. **Whitespace is Sacred**

Generous padding creates breathing room:

```css
/* Section Spacing */
padding: 8rem 2rem; /* Desktop */
padding: 5rem 1.5rem; /* Mobile */

/* Card Spacing */
padding: 3.5rem 3rem; /* Generous internal padding */
margin-bottom: 4rem; /* Space between sections */

/* Element Spacing */
margin-bottom: 1.5rem; /* Between related elements */
margin-bottom: 3rem; /* Between distinct groups */
```

### 3. **Restrained Color Palette**

Stick to neutral grays + one accent color:

```css
/* Core Colors */
--text-primary: #1d1d1f; /* Almost black */
--text-secondary: #6e6e73; /* Gray */
--text-tertiary: #86868b; /* Light gray */
--background: #ffffff; /* White */
--background-alt: #f5f5f7; /* Light gray */
--border: #d2d2d7; /* Subtle border */

/* Accent Color */
--accent-green: #5db075; /* Primary green */
--accent-green-hover: #4a9960; /* Darker green */

/* Use accent sparingly - only for CTAs and important actions */
```

### 4. **Subtle Interactions**

Gentle transitions and minimal shadows:

```css
/* Hover Effects */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
transform: translateY(-4px); /* Subtle lift */

/* Shadows - Light and layered */
box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04); /* Rest */
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); /* Hover */
box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12); /* Active */

/* Border Radius - Soft and consistent */
border-radius: 16px; /* Cards */
border-radius: 18px; /* Modals */
border-radius: 980px; /* Buttons (pill shape) */
```

### 5. **Minimal Visual Weight**

Reduce noise, increase clarity:

```css
/* Borders - Thin and subtle */
border: 1px solid #d2d2d7;

/* Icons - Simple, not busy */
font-size: 3rem;
opacity: 0.9;

/* Buttons - Clean with no outlines */
border: none;
font-weight: 500; /* Not bold */

/* Avoid gradients, drop shadows, and heavy effects */
/* Let content breathe with whitespace instead */
```

## 📐 Component Standards

### Buttons

```css
.btn-primary {
  background: #5db075;
  color: #ffffff;
  border-radius: 980px;
  padding: 0.875rem 2rem;
  font-size: 1.0625rem;
  font-weight: 500;
  border: none;
}
```

### Cards

```css
.card {
  background: #ffffff;
  border: 1px solid #d2d2d7;
  border-radius: 16px;
  padding: 2.5rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}
```

### Section Layout

```css
section {
  padding: 8rem 2rem;
  background: #ffffff; /* or #f5f5f7 for alternating */
}
```

## 🎯 Usage Examples

### Good ✅

- Large headings with negative letter-spacing
- 8rem padding between sections
- Subtle 1px borders in #d2d2d7
- Green accent only on primary CTAs
- Generous line-height (1.5) for readability

### Bad ❌

- Heavy font-weights (700+)
- Cramped spacing (< 2rem sections)
- Multiple bright colors
- Heavy shadows or gradients
- Tight line-height (< 1.3)

## 🔄 Applying to Other Pages

When styling new components, ask:

1. **Does it have enough whitespace?** (8rem section padding)
2. **Is the typography restrained?** (font-weight ≤ 600)
3. **Are colors limited?** (Black, gray, white + green accent only)
4. **Are interactions subtle?** (4-8px transforms, light shadows)
5. **Is visual weight minimal?** (1px borders, simple shapes)

If yes to all 5 → You're consistent with the Apple aesthetic ✨
