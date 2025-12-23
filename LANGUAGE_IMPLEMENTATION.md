# Multi-Language Implementation Guide

## Overview
The Galero-UI application now supports English and Romanian languages using vue-i18n.

## Implementation Details

### 1. **Installation**
```bash
npm install vue-i18n@9
```

### 2. **File Structure**
```
src/
├── i18n.ts                 # i18n configuration and helpers
├── locales/
│   ├── en.json            # English translations
│   └── ro.json            # Romanian translations
├── components/
│   └── LanguageSwitcher.vue  # Language switcher component (optional)
├── main.ts                # Updated with i18n plugin
├── App.vue                # Updated with language switcher in navbar
├── pages/
│   ├── Login.vue          # Translations added
│   ├── Players.vue        # Translations added
│   ├── Profile.vue        # Translations added
│   ├── Champions.vue      # Translations added
│   └── Editions.vue       # Translations added (partial)
```

### 3. **Configuration Files**

#### `src/i18n.ts`
- Initializes i18n with English and Romanian locales
- Detects browser language on first load
- Persists language preference in localStorage
- Exports helper functions: `setLanguage()` and `getCurrentLanguage()`

#### `src/locales/en.json` & `src/locales/ro.json`
Translation keys organized by sections:
- **common**: Login, logout, language switching, loading states
- **nav**: Navigation menu items (Home, Players, Editions, etc.)
- **pages**: Page-specific translations with subsections for each page

### 4. **Usage in Components**

#### Basic Usage
```typescript
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// In template
<h1>{{ t('pages.profile.title') }}</h1>
```

#### Language Switching
```typescript
import { setLanguage, getCurrentLanguage } from './i18n';

// Change language
setLanguage('ro'); // Switch to Romanian

// Get current language
const lang = getCurrentLanguage(); // Returns 'en' or 'ro'
```

### 5. **Updated Components**

#### App.vue
- Added language switcher menu in top app bar (right side)
- Language selector in navigation drawer
- All menu items use i18n translations

#### Pages with Translations:
- **Login.vue**: Title and welcome message
- **Players.vue**: Table headers, button labels, search fields
- **Champions.vue**: Section titles and labels
- **Profile.vue**: Section titles, email, name, logout button
- **Editions.vue**: Header and button labels (partial - can be extended)

### 6. **Features**

✅ **Automatic Language Detection**: Detects browser language (Romanian/English) on first visit
✅ **Persistent Language Selection**: Selected language stored in localStorage
✅ **Easy Switching**: Language switcher in app bar (accessible from any page)
✅ **Fallback Support**: Falls back to English if translation key not found
✅ **Global Injection**: `t()` function available in all components without explicit import

### 7. **How Users Change Language**

Users can change language by:
1. Clicking the language icon (🌐) in the top app bar
2. Selecting their preferred language from the dropdown menu
3. The language persists across sessions (stored in localStorage)

### 8. **Adding More Translations**

To add translations for new features:

1. Add the key to both `en.json` and `ro.json`:
```json
{
  "newSection": {
    "newKey": "English text"
  }
}
```

2. Use in component:
```vue
<p>{{ t('newSection.newKey') }}</p>
```

### 9. **Current Language Coverage**

| Section | En | Ro | Status |
|---------|----|----|--------|
| Common | ✅ | ✅ | Complete |
| Navigation | ✅ | ✅ | Complete |
| Login | ✅ | ✅ | Complete |
| Players | ✅ | ✅ | Complete |
| Champions | ✅ | ✅ | Complete |
| Profile | ✅ | ✅ | Partial |
| Editions | ✅ | ✅ | Partial |
| Attendance | ⭕ | ⭕ | Not Started |
| Add Player | ⭕ | ⭕ | Not Started |

### 10. **Notes**

- The language preference is stored in localStorage under key `galero_language`
- All translation files are JSON format for easy editing
- The app automatically reacts to language changes without page reload
- Missing translations won't break the app - it will use the key as fallback

## Testing Language Switching

1. Visit the app at `http://localhost:5173/`
2. Click the language icon (🌐) in the top right
3. Select a language
4. All visible text should switch to the selected language
5. Refresh the page - language preference should persist

