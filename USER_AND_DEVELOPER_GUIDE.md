# 🌍 User Guide - Language Support

## For Users

### How to Change Language

#### Method 1: Using the App Bar (Top Right)
1. Look for the 🌐 icon in the top-right corner of the app bar
2. Click on it to open the language menu
3. Select your preferred language:
   - 🇬🇧 English
   - 🇷🇴 Română (Romanian)
4. The app will instantly switch to your chosen language

#### Method 2: Using the Navigation Menu
1. Open the navigation menu by clicking the ☰ icon (top-left)
2. Scroll down to find the language selector
3. Select your language from the dropdown
4. Changes apply immediately

### What Gets Translated?
- ✅ Menu items and navigation
- ✅ Page titles and headings
- ✅ Button labels
- ✅ Form labels and placeholders
- ✅ Table headers
- ✅ Messages and alerts

### Will My Language Choice Be Remembered?
**Yes!** Your language preference is saved automatically. When you:
- Refresh the page
- Close and reopen the browser
- Come back tomorrow

Your chosen language will be automatically restored.

---

## For Developers

### Basic Usage in Components

#### 1. Import the hook
```typescript
import { useI18n } from 'vue-i18n';
```

#### 2. Call the hook in setup
```typescript
const { t } = useI18n();
```

#### 3. Use in template
```vue
<h1>{{ t('pages.profile.title') }}</h1>
<v-btn>{{ t('common.logout') }}</v-btn>
```

### Available Translation Keys

#### Common Keys
```typescript
t('common.language')      // "Language" / "Limba"
t('common.logout')        // "Logout" / "Delogare"
t('common.login')         // "Login" / "Autentificare"
t('common.loading')       // "Loading..." / "Se încarcă..."
```

#### Navigation Keys
```typescript
t('nav.home')             // "Home" / "Acasă"
t('nav.players')          // "Players" / "Jucători"
t('nav.champions')        // "Champions" / "Campioni"
t('nav.profile')          // "Profile" / "Profil"
```

#### Page Keys
```typescript
t('pages.login.title')
t('pages.profile.title')
t('pages.players.title')
t('pages.champions.title')
// ... and many more
```

### Changing Language Programmatically

```typescript
import { setLanguage, getCurrentLanguage } from './i18n';

// Switch to Romanian
setLanguage('ro');

// Switch to English
setLanguage('en');

// Get current language
const current = getCurrentLanguage();
console.log(current); // 'en' or 'ro'
```

### Adding New Translations

#### Step 1: Open translation files
- `src/locales/en.json` - English
- `src/locales/ro.json` - Romanian

#### Step 2: Add your keys (in both files)
```json
{
  "pages": {
    "myPage": {
      "title": "My Page Title",
      "description": "My description text"
    }
  }
}
```

#### Step 3: Use in your component
```vue
<template>
  <div>
    <h1>{{ t('pages.myPage.title') }}</h1>
    <p>{{ t('pages.myPage.description') }}</p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>
```

### Best Practices

#### ✅ DO
```typescript
// Good: Clear, organized keys
t('pages.profile.title')
t('common.logout')
t('nav.home')
```

#### ❌ DON'T
```typescript
// Bad: Unclear key structure
t('profile_title')
t('logout_btn')
t('home_menu')
```

### Organizing New Translation Keys

Follow the existing structure:
```json
{
  "sectionName": {
    "subsectionName": {
      "featureName": "Text"
    }
  }
}
```

**Example**:
```json
{
  "pages": {
    "attendance": {
      "title": "Attendance",
      "date": "Date",
      "present": "Present",
      "absent": "Absent"
    }
  }
}
```

---

## Advanced Features

### Conditional Language-Based Rendering
```vue
<template>
  <v-alert v-if="currentLanguage === 'ro'" type="info">
    Aceasta este o alertă doar pentru limba română
  </v-alert>
</template>

<script setup lang="ts">
import { getCurrentLanguage } from './i18n';

const currentLanguage = getCurrentLanguage();
</script>
```

### Language-Based Formatting
```typescript
const { t, locale } = useI18n();

// Format date based on current language
const dateFormatter = new Intl.DateTimeFormat(locale.value);
const formattedDate = dateFormatter.format(new Date());
```

### Adding More Languages

#### 1. Create new translation file
```bash
src/locales/fr.json  # For French
src/locales/de.json  # For German
```

#### 2. Update i18n.ts
```typescript
import fr from './locales/fr.json';

const messages = {
  en,
  ro,
  fr,  // Add new language
};
```

#### 3. Test
- Language automatically appears in switcher
- All translations available immediately

---

## Troubleshooting

### Issue: Translation keys showing instead of text
**Solution**: 
- Check if key exists in both en.json and ro.json
- Verify the key path is correct
- Check for typos: `pages.profile.title` not `pages_profile_title`

### Issue: Language not changing
**Solution**:
- Clear localStorage: `localStorage.removeItem('galero_language')`
- Hard refresh page: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- Check browser console for errors

### Issue: Missing translations after adding new text
**Solution**:
- Make sure you added the key to BOTH en.json AND ro.json
- Restart dev server: Stop and run `npm run dev` again
- Clear browser cache

### Issue: Can't find language switcher
**Solution**:
- Look for 🌐 icon in top-right corner of app bar
- Try opening navigation drawer (☰ button) and scrolling down
- If still not visible, check browser console for errors

---

## FAQ

**Q: How many languages are supported?**
A: Currently English and Romanian. More can be added easily.

**Q: Is there a limit to translation keys?**
A: No, you can have unlimited keys. Just follow the JSON structure.

**Q: Can I use HTML in translations?**
A: Not recommended in JSON strings. Use Vue components instead.

**Q: What happens if a translation is missing?**
A: The key path will be displayed instead (e.g., "pages.profile.title"). App won't crash.

**Q: Can I have different translations for different pages?**
A: Yes, use the page structure: `pages.pageName.keyName`

**Q: Is the language preference synced across tabs?**
A: No, each browser tab is independent. But localStorage is shared.

**Q: Can I change language without page reload?**
A: Yes! The app updates instantly without reload.

**Q: What if user hasn't selected a language?**
A: The app auto-detects browser language or defaults to English.

---

## Performance Tips

### 1. Keep Translation Keys Short
```typescript
// Good: Concise but clear
t('pages.profile.name')

// Avoid: Too verbose
t('pages.profile.user.personal.information.fullname')
```

### 2. Organize by Section
Group related translations together for easier management.

### 3. Reuse Common Keys
```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel"
  }
}
// Reuse: t('common.save'), t('common.cancel')
```

### 4. Don't Translate
Keep these untranslated:
- Proper nouns (team names, player names)
- Dates in specific formats (unless locale-specific)
- IDs and technical values

---

## Completion Checklist

- [x] Language switcher implemented
- [x] English translations added
- [x] Romanian translations added
- [x] Browser language detection working
- [x] localStorage persistence working
- [x] Documentation complete
- [x] Testing verified
- [x] Production ready

---

**Last Updated**: December 23, 2025  
**Supported Languages**: English (en), Romanian (ro)  
**Status**: ✅ Production Ready

