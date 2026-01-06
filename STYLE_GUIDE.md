# 🎨 Design System & Style Guide

## Overview

This is a **centralized, scalable Design System** built with:

- ✅ **CSS Variables (Design Tokens)** - Single source of truth for all styling
- ✅ **Utility Classes** - DRY spacing, layout, typography helpers
- ✅ **Composables** - Reusable styling logic for components
- ✅ **Vuetify Overrides** - Consistent component appearance

**Key Principle**: Change a style in ONE place → affects EVERYWHERE

---

## 📁 File Structure

```
src/
├── styles/
│   ├── design-tokens.css      # CSS variables (colors, spacing, typography)
│   ├── global-styles.css      # Utility classes & resets
│   ├── vuetify-override.css   # Vuetify component styling
│   └── animations.css         # Animations (future)
├── composables/
│   └── useComponentStyles.ts  # Styling logic & helpers
└── [rest of project]
```

---

## 🎯 Design Tokens

All styling is controlled via **CSS Custom Properties** (variables). Located in `src/styles/design-tokens.css`.

### Color Tokens

```css
/* Primary Palette */
--color-primary: #1976d2;
--color-primary-light: #42a5f5;
--color-primary-lighter: #bbdefb;
--color-primary-dark: #1565c0;
--color-primary-darker: #0d47a1;

/* Secondary, Status Colors (success, warning, error, info) */
--color-secondary: #424242;
--color-success: #4caf50;
--color-warning: #ffc107;
--color-error: #f44336;
--color-info: #2196f3;

/* Text & Background */
--color-text-primary: rgba(0, 0, 0, 0.87);
--color-text-secondary: rgba(0, 0, 0, 0.6);
--color-bg-primary: #ffffff;
--color-bg-secondary: #f5f5f5;
```

### Spacing Tokens

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
--spacing-3xl: 64px;
```

### Typography Tokens

```css
/* Font sizes */
--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-base: 16px;
--font-size-lg: 18px;
--font-size-xl: 20px;
--font-size-2xl: 24px;

/* Font weights */
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Other Tokens

```css
/* Border Radius */
--border-radius-sm: 4px;
--border-radius-md: 8px;
--border-radius-lg: 12px;
--border-radius-xl: 16px;
--border-radius-full: 9999px;

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

/* Transitions */
--transition-fast: 150ms ease-in-out;
--transition-base: 200ms ease-in-out;
--transition-slow: 300ms ease-in-out;
```

---

## 🎨 Utility Classes

Pre-built classes for rapid development. Located in `src/styles/global-styles.css`.

### Spacing Utilities

```html
<!-- Padding -->
<div class="p-md">Padding medium</div>
<div class="px-lg">Padding horizontal large</div>
<div class="py-sm">Padding vertical small</div>

<!-- Margin -->
<div class="m-md">Margin medium</div>
<div class="mx-auto">Margin auto (centered)</div>
<div class="mt-lg">Margin top large</div>
<div class="mb-md">Margin bottom medium</div>
```

### Flexbox Utilities

```html
<!-- Flex containers -->
<div class="flex">Normal flex row</div>
<div class="flex flex-column">Flex column</div>
<div class="flex-center">Center both axes</div>
<div class="flex-between">Space between</div>
<div class="flex gap-md">Flex with gap</div>
```

### Text Utilities

```html
<!-- Font size -->
<p class="text-xs">Extra small text</p>
<p class="text-base">Base text</p>
<p class="text-2xl">Large text</p>

<!-- Font weight -->
<p class="text-light">Light weight</p>
<p class="text-bold">Bold weight</p>

<!-- Text color -->
<p class="text-primary">Primary color</p>
<p class="text-error">Error color</p>
<p class="text-muted">Muted text</p>

<!-- Text align -->
<p class="text-center">Centered text</p>
<p class="text-right">Right aligned</p>
```

### Layout Utilities

```html
<!-- Display -->
<div class="flex">Display flex</div>
<div class="grid grid-cols-3">3 column grid</div>
<div class="hidden">Hidden</div>

<!-- Width/Height -->
<div class="w-full">Full width</div>
<div class="h-full">Full height</div>

<!-- Overflow -->
<div class="overflow-auto">Auto scroll</div>
<div class="truncate">Truncate text</div>
```

### Border & Shadow Utilities

```html
<!-- Borders -->
<div class="border">All borders</div>
<div class="border-t">Top border</div>
<div class="rounded-md">Rounded medium</div>
<div class="rounded-full">Fully rounded</div>

<!-- Shadows -->
<div class="shadow-sm">Small shadow</div>
<div class="shadow-lg">Large shadow</div>

<!-- Background -->
<div class="bg-primary">Primary background</div>
<div class="bg-grey-100">Light grey background</div>
```

### Transition Utilities

```html
<!-- Transitions -->
<button class="transition-fast">Fast transition</button>
<div class="transition-colors">Color transition</div>
```

---

## 🧩 Composables for Styling

The `useComponentStyles.ts` composable provides **typed, reusable styling logic**.

### Button Styles

```typescript
import { useButtonStyles } from "@/composables/useComponentStyles";

export default {
  setup() {
    const { buttonClasses } = useButtonStyles({
      size: "large",
      variant: "solid",
      color: "primary",
      disabled: false,
    });

    return { buttonClasses };
  },
};
```

```html
<v-btn :class="buttonClasses">Click me</v-btn>
```

### Card Styles

```typescript
const { cardClasses } = useCardStyles({
  elevation: 'lg',
  interactive: true,
  outlined: false,
});

// Template
<v-card :class="cardClasses">...</v-card>
```

### Flex Layout

```typescript
const { flexClasses } = useFlexLayout({
  direction: 'row',
  align: 'center',
  justify: 'between',
  gap: 'md',
});

// Template
<div :class="flexClasses">
  <span>Left</span>
  <span>Right</span>
</div>
```

### Text Styles

```typescript
const { textClasses } = useTextStyles({
  size: '2xl',
  weight: 'bold',
  color: 'primary',
  align: 'center',
});

// Template
<h1 :class="textClasses">Heading</h1>
```

### Form Field Styles

```typescript
const { fieldClasses, showRequired, showError } = useFormFieldStyles({
  required: true,
  error: !!errors.email,
  size: 'large',
  disabled: false,
});

// Template
<v-text-field
  v-model="email"
  :class="fieldClasses"
  :rules="[required]"
/>
```

### Alert Styles

```typescript
const { alertClasses, alertColor } = useAlertStyles({
  type: 'success',
  variant: 'tonal',
  dismissible: true,
});

// Template
<v-alert :class="alertClasses" :color="alertColor">
  Success message!
</v-alert>
```

### Animation Styles

```typescript
const { animationClasses } = useAnimationStyles({
  transition: 'base',
  type: 'all',
  hover: true,
});

// Template
<button :class="animationClasses">Hover me</button>
```

---

## 🔧 Vuetify Component Overrides

All Vuetify components are styled consistently via `vuetify-override.css`. Examples:

### Buttons

```css
.v-btn {
  text-transform: none !important;
  font-weight: var(--font-weight-medium);
  border-radius: var(--border-radius-md) !important;
  transition: all var(--transition-base) !important;
  padding: 8px 16px !important;
}

.v-btn:hover:not(:disabled) {
  box-shadow: var(--shadow-md) !important;
  transform: translateY(-2px);
}
```

### Cards

```css
.v-card {
  border-radius: var(--border-radius-lg) !important;
  box-shadow: var(--shadow-md) !important;
  transition: all var(--transition-base) !important;
}

.v-card:hover {
  box-shadow: var(--shadow-lg) !important;
}
```

### Text Fields

```css
.v-field__outline {
  border-radius: var(--border-radius-md) !important;
}

.v-field--focused .v-field__outline {
  box-shadow: 0 0 0 3px var(--color-primary-lighter) !important;
}
```

---

## 🌈 Dark Mode

Dark mode is built-in via `data-theme="dark"`:

```html
<!-- Enable dark mode -->
<div data-theme="dark">
  <!-- All children use dark theme tokens -->
</div>
```

```css
/* In design-tokens.css */
[data-theme="dark"] {
  --color-text-primary: rgba(255, 255, 255, 0.87);
  --color-bg-primary: #121212;
  --color-bg-secondary: #1e1e1e;
  /* ... more overrides ... */
}
```

---

## 📋 Usage Examples

### Example 1: Button with Custom Styling

**BEFORE (Without Design System):**

```vue
<template>
  <div>
    <button
      style="padding: 12px 24px; background: #1976d2; color: white; border-radius: 8px; font-weight: 500;"
    >
      Click me
    </button>
  </div>
</template>
```

**AFTER (With Design System):**

```vue
<template>
  <div class="flex-center p-lg">
    <v-btn color="primary" size="large" :class="buttonClasses">
      Click me
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { useButtonStyles } from "@/composables/useComponentStyles";

const { buttonClasses } = useButtonStyles({
  size: "large",
  color: "primary",
});
</script>
```

### Example 2: Card with Spacing

**BEFORE:**

```vue
<template>
  <div
    style="padding: 24px; margin: 16px 0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
  >
    <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">
      Title
    </h2>
    <p style="color: rgba(0,0,0,0.6); margin-bottom: 16px;">Description</p>
  </div>
</template>
```

**AFTER:**

```vue
<template>
  <v-card :class="cardClasses" class="p-lg mb-lg">
    <h2 class="text-2xl text-bold mb-md">Title</h2>
    <p class="text-muted mb-md">Description</p>
  </v-card>
</template>

<script setup lang="ts">
import { useCardStyles } from "@/composables/useComponentStyles";

const { cardClasses } = useCardStyles({
  elevation: "md",
  interactive: true,
});
</script>
```

### Example 3: Form with Validation Styling

```vue
<template>
  <form class="flex flex-column gap-md p-lg">
    <v-text-field
      v-model="email"
      label="Email"
      :class="emailFieldClasses"
      :rules="[rules.required, rules.email]"
      :error="!!errors.email"
      :error-messages="errors.email"
    />

    <v-text-field
      v-model="password"
      label="Password"
      type="password"
      :class="passwordFieldClasses"
      :rules="[rules.required, rules.minLength]"
      :error="!!errors.password"
      :error-messages="errors.password"
    />

    <v-btn type="submit" color="primary" size="large" block class="mt-lg">
      Submit
    </v-btn>
  </form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useFormFieldStyles } from "@/composables/useComponentStyles";

const email = ref("");
const password = ref("");
const errors = ref({ email: "", password: "" });

const { fieldClasses: emailFieldClasses } = useFormFieldStyles({
  required: true,
  error: !!errors.value.email,
});

const { fieldClasses: passwordFieldClasses } = useFormFieldStyles({
  required: true,
  error: !!errors.value.password,
});

const rules = {
  required: (v: string) => !!v || "This field is required",
  email: (v: string) => /^\S+@\S+\.\S+$/.test(v) || "Invalid email",
  minLength: (v: string) => v.length >= 8 || "Minimum 8 characters",
};
</script>
```

### Example 4: Responsive Layout

```vue
<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-lg p-lg">
    <div v-for="item in items" :key="item.id" class="flex flex-column gap-md">
      <v-card class="shadow-md hover:shadow-lg transition-all">
        <v-img :src="item.image" height="200" />
        <v-card-text>
          <h3 class="text-lg text-bold mb-sm">{{ item.title }}</h3>
          <p class="text-sm text-muted">{{ item.description }}</p>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>
```

---

## 🎯 Best Practices

### ✅ DO

1. **Use utility classes** for spacing, layout, and simple styling
2. **Use composables** for complex, reusable styling logic
3. **Reference CSS variables** when you need custom values
4. **Keep components clean** - styling logic in composables
5. **Update tokens** when changing global styles

### ❌ DON'T

1. ❌ Inline styles (`style="padding: 16px"`)
2. ❌ Hardcoded colors (`color: "#1976d2"`)
3. ❌ Scoped styles for global patterns
4. ❌ Component-specific spacing values
5. ❌ Duplicate styling logic across components

---

## 🔄 Changing Global Styles

### Example: Change Primary Color Everywhere

**File:** `src/styles/design-tokens.css`

```css
:root {
  --color-primary: #ff6b6b; /* Changed from #1976d2 */
  --color-primary-light: #ff8787;
  --color-primary-dark: #e53935;
  /* ... */
}
```

**Result:** ✅ All buttons, links, highlights, cards, etc. update automatically!

### Example: Change Button Styling Everywhere

**File:** `src/styles/vuetify-override.css`

```css
.v-btn {
  border-radius: var(--border-radius-lg) !important; /* Changed from md */
  padding: 12px 32px !important; /* Changed padding */
  box-shadow: var(--shadow-lg) !important; /* Changed shadow */
}
```

**Result:** ✅ All buttons across the app have new styling!

### Example: Change Spacing System

**File:** `src/styles/design-tokens.css`

```css
:root {
  --spacing-md: 18px; /* Changed from 16px */
  --spacing-lg: 28px; /* Changed from 24px */
}
```

**Result:** ✅ All `p-md`, `m-lg`, `gap-md` classes update!

---

## 📚 Token Reference Guide

### Quick Color Reference

| Token               | Value   | Use Case                       |
| ------------------- | ------- | ------------------------------ |
| `--color-primary`   | #1976d2 | Main action, links, highlights |
| `--color-secondary` | #424242 | Secondary actions, subtle text |
| `--color-success`   | #4caf50 | Success messages, valid states |
| `--color-warning`   | #ffc107 | Warnings, attention needed     |
| `--color-error`     | #f44336 | Errors, destructive actions    |
| `--color-info`      | #2196f3 | Informational content          |

### Quick Spacing Reference

| Token          | Value | Common Uses                   |
| -------------- | ----- | ----------------------------- |
| `--spacing-xs` | 4px   | Tiny gaps between elements    |
| `--spacing-sm` | 8px   | Small gaps, close items       |
| `--spacing-md` | 16px  | Default padding/margin        |
| `--spacing-lg` | 24px  | Card padding, section spacing |
| `--spacing-xl` | 32px  | Large sections, page margins  |

### Quick Radius Reference

| Token                  | Value  | Common Uses     |
| ---------------------- | ------ | --------------- |
| `--border-radius-sm`   | 4px    | Subtle rounding |
| `--border-radius-md`   | 8px    | Buttons, inputs |
| `--border-radius-lg`   | 12px   | Cards, panels   |
| `--border-radius-full` | 9999px | Badges, avatars |

---

## 🚀 Future Enhancements

- [ ] **Animations.css** - Pre-built animations (fade, slide, bounce, etc.)
- [ ] **Responsive Grid System** - Advanced grid utilities
- [ ] **Theme Switcher** - Built-in dark/light mode toggle
- [ ] **Component Library** - Pre-built component compositions
- [ ] **Accessibility** - Focus states, ARIA labels, contrast checker

---

## 📖 Summary

| Feature               | Location                | Use When                                    |
| --------------------- | ----------------------- | ------------------------------------------- |
| **Design Tokens**     | `design-tokens.css`     | Need a color, size, or spacing value        |
| **Utility Classes**   | `global-styles.css`     | Need simple styling (spacing, text, layout) |
| **Composables**       | `useComponentStyles.ts` | Need complex, reusable styling logic        |
| **Vuetify Overrides** | `vuetify-override.css`  | Need to style Vuetify components globally   |

---

**Happy styling! 🎨**
