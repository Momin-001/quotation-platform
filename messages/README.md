# Internationalization (i18n)

This app uses [next-intl](https://next-intl-docs.vercel.app/) for UI copy and URL-based locales.

## Locales and URLs

| Locale | URL prefix | Example |
|--------|------------|---------|
| English (`en`) | none (default) | `/products`, `/leditor` |
| German (`de`) | `/de` | `/de/products`, `/de/leditor` |

Configuration lives in `i18n/routing.js`, `i18n/request.js`, and `proxy.js` (middleware). Guest routes live under `app/[locale]/`. Admin (`/admin`) and API (`/api`) are not localized.

Use locale-aware navigation from `@/i18n/navigation` (`Link`, `useRouter`, `redirect`) instead of `next/link` for in-app links.

## Two kinds of translated content

### 1. Static UI — `messages/*.json`

Fixed strings (buttons, labels, validation, page chrome) live in JSON catalogs:

- `messages/en.json` — English (base catalog)
- `messages/de.json` — German

**Partial files** (merged in `i18n/request.js`):

- `messages/becomePartner.{locale}.json` → namespace `BecomePartner`
- `messages/legal/imprint.{locale}.json` and `terms.{locale}.json` → `LegalPages.imprint` / `LegalPages.terms`

**In components:**

```jsx
import { useTranslations } from "next-intl";

const t = useTranslations("Auth.login");
return <h1>{t("title")}</h1>;
```

Nested keys use dot paths: `useTranslations("Home.footer")` + `t("newsletterTitle")`.

Arrays/objects: `t.raw("someKey")` when the value is a JSON array or object.

Server metadata: `getTranslations({ locale, namespace: "Metadata" })` (see `lib/i18n/metadata.js`).

### 2. CMS / API content — `cmsField()`

Homepage, footer, FAQs, products, etc. store bilingual fields in the database as `fieldEn` / `fieldDe` (e.g. `heroTitleEn`, `heroTitleDe`).

```js
import { cmsField } from "@/lib/i18n/cms";

const title = cmsField(homepageData, "heroTitle", locale);
```

`cmsField` picks `*De` for `de`, otherwise `*En`, with fallback to English if German is missing.

Do **not** duplicate CMS strings in `messages/*.json` unless they are static fallbacks in the UI.

## Namespace convention

Top-level keys in `en.json` / `de.json` are namespaces, for example:

- `Common` — shared actions (Save, Cancel, …)
- `Auth`, `Home`, `Products`, `Leditor`, `User.cart`, …

Add the same key to **both** `en.json` and `de.json` when introducing UI copy.

## LEDitor form options

Checkbox/radio **labels** are translated via `Leditor.opt*` keys. **Values** sent to the API stay in English (defined in `lib/leditor/form-options.js`) so admin and enquiries stay consistent.

## Adding a new string

1. Add the key under the right namespace in `messages/en.json` and `messages/de.json`.
2. In the component: `const t = useTranslations("YourNamespace");` then `t("yourKey")`.
3. For links, import from `@/i18n/navigation`.
4. Run `npm run build` to verify.

## Quick reference

| Need | Use |
|------|-----|
| Button / label / error message | `useTranslations` + JSON |
| Homepage hero title from admin | `cmsField(record, "heroTitle", locale)` |
| Legal page body (large HTML blocks) | `LegalPages` partial JSON |
| Current locale | `useLocale()` from `next-intl` |
