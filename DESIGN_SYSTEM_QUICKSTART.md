# 🚀 Design System Quick Start

## The Golden Rule

> **Change a style in ONE place → affects EVERYWHERE**

---

## 30-Second Overview

The Design System has **3 layers**:

### 1️⃣ Design Tokens (CSS Variables)

```css
/* src/styles/design-tokens.css */
:root {
  --color-primary: #1976d2;
  --spacing-md: 16px;
  --font-weight-bold: 700;
}
```

✅ Single source of truth for all values

### 2️⃣ Utility Classes

```html
<div class="p-md gap-lg flex">
  <button class="text-bold text-primary">Click</button>
</div>
```

✅ Pre-built classes for rapid development

### 3️⃣ Component Styling (Vuetify Overrides)

```css
/* src/styles/vuetify-override.css */
.v-btn {
  border-radius: var(--border-radius-md) !important;
  transition: all var(--transition-base) !important;
}
```

✅ Consistent Vuetify component appearance

---

## Common Tasks

### 🎨 Change Primary Color Everywhere

**1 file change = 100% application updated**

```css
/* src/styles/design-tokens.css */
:root {
  --color-primary: #ff6b6b; /* ← Changed from #1976d2 */
}
```

✅ All buttons, links, highlights, badges automatically update!

### 📐 Change Button Styling Everywhere

```css
/* src/styles/vuetify-override.css */
.v-btn {
  border-radius: var(--border-radius-lg) !important; /* ← Changed from md */
  padding: 12px 32px !important; /* ← New padding */
  box-shadow: var(--shadow-lg) !important; /* ← New shadow */
}
```

✅ All 50+ buttons in app instantly updated!

### 📏 Change Spacing System

```css
/* src/styles/design-tokens.css */
:root {
  --spacing-md: 18px; /* ← Changed from 16px */
  --spacing-lg: 28px; /* ← Changed from 24px */
}
```

✅ All classes using `p-md`, `m-lg`, `gap-md` etc. update!

### 🌙 Enable Dark Mode

Add to ANY element:

```html
<div data-theme="dark">
  <!-- Everything inside automatically uses dark colors -->
</div>
```

Automatic color switching:

```css
[data-theme="dark"] {
  --color-text-primary: rgba(255, 255, 255, 0.87);
  --color-bg-primary: #121212;
  /* All colors automatically switch */
}
```

---

## Most-Used Utility Classes

### Spacing (Padding/Margin)

| Class     | Value           | Use                 |
| --------- | --------------- | ------------------- |
| `p-sm`    | 8px             | Small padding       |
| `p-md`    | 16px            | Default padding     |
| `p-lg`    | 24px            | Card padding        |
| `px-md`   | 16px left+right | Horizontal padding  |
| `py-lg`   | 24px top+bottom | Vertical padding    |
| `m-md`    | 16px            | Default margin      |
| `mx-auto` | Auto            | Center horizontally |
| `gap-md`  | 16px            | Flexbox gap         |

### Layout (Flexbox)

| Class              | Effect              |
| ------------------ | ------------------- |
| `flex`             | Flex row            |
| `flex flex-column` | Flex column         |
| `flex-center`      | Center both axes    |
| `flex-between`     | Space between items |
| `flex gap-md`      | Flex with gap       |

### Text

| Class          | Effect            |
| -------------- | ----------------- |
| `text-xl`      | 20px font         |
| `text-bold`    | Font weight 700   |
| `text-primary` | Primary color     |
| `text-center`  | Text center align |

### Shadows & Radius

| Class          | Effect        |
| -------------- | ------------- |
| `shadow-md`    | Medium shadow |
| `shadow-lg`    | Large shadow  |
| `rounded-md`   | 8px radius    |
| `rounded-lg`   | 12px radius   |
| `rounded-full` | Fully rounded |

---

## Real-World Examples

### Example 1: Button with Styling

```vue
<template>
  <v-btn color="primary" size="large" class="transition-all"> Click me </v-btn>
</template>
```

✅ Uses:

- `color="primary"` → `--color-primary` CSS variable
- `size="large"` → `var(--spacing-lg)` padding
- `class="transition-all"` → Smooth transitions via `--transition-base`

### Example 2: Card Layout

```vue
<template>
  <v-card class="p-lg shadow-md rounded-lg mb-lg">
    <h2 class="text-2xl text-bold mb-md">Title</h2>
    <p class="text-base text-muted">Description</p>

    <div class="flex gap-md mt-lg">
      <v-btn color="primary">Action 1</v-btn>
      <v-btn variant="outlined">Action 2</v-btn>
    </div>
  </v-card>
</template>
```

✅ No scoped styles needed! All from utility classes:

- `p-lg` → 24px padding
- `shadow-md` → Medium shadow
- `rounded-lg` → 12px border radius
- `mb-lg` → 24px bottom margin
- `text-2xl` → 24px font size
- `text-muted` → Secondary text color
- `gap-md` → 16px flexbox gap
- `mt-lg` → 24px top margin

### Example 3: Form with Error State

```vue
<template>
  <form class="flex flex-column gap-md p-lg">
    <v-text-field
      v-model="email"
      label="Email"
      :error="!!errors.email"
      :error-messages="errors.email"
      class="rounded-md"
    />

    <v-text-field
      v-model="password"
      label="Password"
      type="password"
      :error="!!errors.password"
      :error-messages="errors.password"
      class="rounded-md"
    />

    <div class="flex gap-md mt-lg">
      <v-btn type="submit" color="primary" size="large" block> Sign In </v-btn>
    </div>
  </form>
</template>
```

✅ Features:

- Form layout with `flex flex-column gap-md`
- Consistent input styling with `rounded-md`
- Error states automatically styled
- Responsive spacing via CSS variables

### Example 4: Responsive Grid

```vue
<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-lg p-lg">
    <div v-for="item in items" :key="item.id">
      <v-card class="h-full shadow-md hover:shadow-lg transition-all">
        <v-img :src="item.image" height="200" />
        <v-card-text class="p-md">
          <h3 class="text-lg text-bold mb-sm">{{ item.title }}</h3>
          <p class="text-sm text-muted">{{ item.description }}</p>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>
```

✅ Features:

- `grid grid-cols-1` → 1 column on mobile
- `md:grid-cols-3` → 3 columns on desktop
- `gap-lg` → 24px gap between items
- `shadow-md` → Default shadow
- `hover:shadow-lg` → Larger shadow on hover
- `transition-all` → Smooth transitions

---

## Composable API

For more complex styling logic, use the `useComponentStyles` composable:

```typescript
import {
  useButtonStyles,
  useCardStyles,
  useFlexLayout,
  useTextStyles,
  useAlertStyles,
} from "@/composables/useComponentStyles";

// Button styling
const { buttonClasses } = useButtonStyles({
  size: "large",
  variant: "solid",
  color: "primary",
});

// Flex layout
const { flexClasses } = useFlexLayout({
  direction: "row",
  align: "center",
  justify: "between",
  gap: "lg",
});

// Text styles
const { textClasses } = useTextStyles({
  size: "2xl",
  weight: "bold",
  color: "primary",
});

// Alert styles
const { alertClasses, alertColor } = useAlertStyles({
  type: "success",
  variant: "tonal",
});
```

---

## Color Reference Quick Guide

### Semantic Colors

```
Primary:    --color-primary: #1976d2 (main brand color)
Secondary:  --color-secondary: #424242 (secondary actions)
Success:    --color-success: #4caf50 (positive feedback)
Warning:    --color-warning: #ffc107 (caution)
Error:      --color-error: #f44336 (errors/destructive)
Info:       --color-info: #2196f3 (informational)
```

### Using Colors

```html
<!-- Text color -->
<p class="text-primary">Primary text</p>
<p class="text-success">Success text</p>

<!-- Background color -->
<div class="bg-primary">Primary background</div>
<div class="bg-error-lighter">Light error background</div>

<!-- In components -->
<v-btn color="primary">Action</v-btn>
<v-alert type="success">Success message</v-alert>
```

---

## Spacing Scale

```
xs:   4px   (tiny gaps)
sm:   8px   (small gaps)
md:   16px  (default)
lg:   24px  (cards, sections)
xl:   32px  (large sections)
2xl:  48px  (page margins)
```

**Usage:**

```html
<div class="p-md">16px padding</div>
<div class="gap-lg">24px flexbox gap</div>
<div class="mt-xl">32px top margin</div>
```

---

## Don'ts ❌

### ❌ DON'T: Use inline styles

```vue
<!-- BAD -->
<div style="padding: 16px; color: #1976d2; font-size: 20px;">
  Content
</div>

<!-- GOOD -->
<div class="p-md text-primary text-xl">
  Content
</div>
```

### ❌ DON'T: Hardcode colors

```vue
<!-- BAD -->
<p style="color: #1976d2">Primary text</p>
<p style="color: #f44336">Error text</p>

<!-- GOOD -->
<p class="text-primary">Primary text</p>
<p class="text-error">Error text</p>
```

### ❌ DON'T: Create scoped component styles

```vue
<!-- BAD -->
<style scoped>
.container {
  padding: 24px;
  gap: 16px;
}
.title {
  font-size: 24px;
  font-weight: bold;
}
</style>

<!-- GOOD -->
<template>
  <div class="flex flex-column gap-md p-lg">
    <h1 class="text-2xl text-bold">Title</h1>
  </div>
</template>
```

### ❌ DON'T: Duplicate styling patterns

```vue
<!-- BAD - duplicated across components -->
<!-- In Players.vue -->
<v-btn class="custom-btn">Add</v-btn>

<!-- In Attendance.vue -->
<v-btn class="custom-btn-2">Add</v-btn>

<!-- GOOD - centralized styling -->
<v-btn color="primary" size="large" class="rounded-md">Add</v-btn>
<!-- Same in both components -->
```

---

## Do's ✅

### ✅ DO: Use utility classes

```html
<div class="flex gap-md p-lg shadow-md rounded-lg mb-lg">Content</div>
```

### ✅ DO: Reference design tokens

```css
.custom-thing {
  color: var(--color-primary);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
}
```

### ✅ DO: Use composables for complex logic

```typescript
const { buttonClasses } = useButtonStyles({
  size: "large",
  color: "primary",
});
```

### ✅ DO: Leverage Vuetify integrations

```html
<v-btn color="primary" size="large">
  <!-- Automatic styling from vuetify-override.css -->
</v-btn>
```

---

## Quick Reference Table

| Task                    | How                     | Example                                          |
| ----------------------- | ----------------------- | ------------------------------------------------ |
| **Add padding**         | Use `p-*` classes       | `class="p-md"`                                   |
| **Add margin**          | Use `m-*` classes       | `class="mb-lg"`                                  |
| **Create flex layout**  | Use `flex` + direction  | `class="flex gap-md"`                            |
| **Change text color**   | Use `text-*` classes    | `class="text-primary"`                           |
| **Add shadow**          | Use `shadow-*` classes  | `class="shadow-lg"`                              |
| **Round corners**       | Use `rounded-*` classes | `class="rounded-md"`                             |
| **Complex styling**     | Use composables         | `const { buttonClasses } = useButtonStyles(...)` |
| **Change global style** | Edit design-tokens.css  | Update `--color-primary`                         |
| **Enable dark mode**    | Add attribute           | `<div data-theme="dark">`                        |

---

## File Locations

| File                                    | Purpose                                   |
| --------------------------------------- | ----------------------------------------- |
| `src/styles/design-tokens.css`          | All CSS variables (colors, spacing, etc.) |
| `src/styles/global-styles.css`          | Utility classes                           |
| `src/styles/vuetify-override.css`       | Vuetify component styling                 |
| `src/composables/useComponentStyles.ts` | Reusable styling logic                    |
| `STYLE_GUIDE.md`                        | Detailed documentation                    |
| `DESIGN_SYSTEM_IMPLEMENTATION.md`       | Before/after examples                     |

---

## When to Modify

### When to change design-tokens.css:

- ✅ Brand color changes
- ✅ Spacing system adjustment
- ✅ Typography scale changes
- ✅ Shadow/radius adjustments

### When to change global-styles.css:

- ✅ Adding new utility classes
- ✅ Modifying utility behavior
- ✅ Typography resets

### When to change vuetify-override.css:

- ✅ Vuetify component styling
- ✅ Component-wide behavior (buttons, cards, inputs)
- ✅ Hover/focus states

### When to create component styles:

- ❌ Almost never - use utility classes instead!
- ✅ ONLY if truly unique, one-off styling

---

## Need Help?

📖 **Detailed Docs**: See [STYLE_GUIDE.md](./STYLE_GUIDE.md)  
📝 **Examples**: See [DESIGN_SYSTEM_IMPLEMENTATION.md](./DESIGN_SYSTEM_IMPLEMENTATION.md)  
🎨 **Colors**: View [design-tokens.css](./src/styles/design-tokens.css#L1)  
🛠️ **Utilities**: View [global-styles.css](./src/styles/global-styles.css)

---

**✨ Happy styling! Change styles in one place, update everywhere.**
