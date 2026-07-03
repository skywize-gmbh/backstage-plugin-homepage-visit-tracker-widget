# @skywize-gmbh/backstage-plugin-visited

A small, self-contained [Backstage](https://backstage.io) frontend plugin that
tracks the catalog entities a user opens and surfaces them again:

- **Top Visited** — a homepage widget listing entities by how often they are opened.
- **Recently Visited** — a homepage widget listing entities by most recent visit.
- **Local data** — a user-settings tab for clearing the browser-local data the
  plugin stores. The tab is an **extensible surface**: every plugin that keeps
  per-browser data contributes one row to it (this plugin contributes the
  "Visited entities" row).

Everything is stored in the browser (`localStorage`) per user — **no backend,
database, or API is required.**

The plugin ships for **both** frontend systems:

| Frontend system | Import from |
| --- | --- |
| Classic (legacy) | `@skywize-gmbh/backstage-plugin-visited` |
| New Frontend System | `@skywize-gmbh/backstage-plugin-visited/alpha` |

Verified against Backstage `1.50.x` (`@backstage/frontend-plugin-api` `^0.16`,
`@backstage/plugin-home-react` `^0.1.37`).

---

## Installation

From your Backstage repo root:

```bash
yarn --cwd packages/app add @skywize-gmbh/backstage-plugin-visited
```

---

## New Frontend System (recommended)

### 1. Install the plugin

```ts
// packages/app/src/App.tsx
import { createApp } from '@backstage/frontend-defaults';
import visitedPlugin from '@skywize-gmbh/backstage-plugin-visited/alpha';

export const app = createApp({
  features: [
    visitedPlugin,
    // ...your other features
  ],
});
```

This registers, out of the box:

- two home-page widgets (**Top Visited**, **Recently Visited**) available in the
  home page widget catalog, and
- a **Local data** tab under **Settings**, pre-populated with the
  "Visited entities" row.

### 2. Record visits

Mount the tracker on your entity page so visits are recorded as users browse.
In the New Frontend System this is typically done with an entity-page card or
content extension that renders `<VisitTracker />` (it renders nothing):

```tsx
import { VisitTracker } from '@skywize-gmbh/backstage-plugin-visited';
```

If you keep a custom `EntityPage`, simply render `<VisitTracker />` once inside
it (see the legacy example below).

---

## Classic (legacy) frontend system

### 1. Homepage widgets

Add the cards to your custom home page:

```tsx
// packages/app/src/components/home/HomePage.tsx
import { MostVisitedCard, RecentlyVisitedCard } from '@skywize-gmbh/backstage-plugin-visited';

// inside your <HomePageGrid> / layout:
<MostVisitedCard />
<RecentlyVisitedCard />
```

### 2. Local data settings tab

```tsx
// packages/app/src/App.tsx
import { SettingsLayout } from '@backstage/plugin-user-settings';
import { LocalDataSettingsContent } from '@skywize-gmbh/backstage-plugin-visited';

const settingsPage = (
  <SettingsLayout>
    {/* ...existing routes... */}
    <SettingsLayout.Route path="local-data" title="Local data">
      <LocalDataSettingsContent />
    </SettingsLayout.Route>
  </SettingsLayout>
);
```

### 3. Record visits

Drop the tracker into your entity page:

```tsx
// packages/app/src/components/catalog/EntityPage.tsx
import { VisitTracker } from '@skywize-gmbh/backstage-plugin-visited';

const entityPage = (
  <>
    <VisitTracker />
    <EntitySwitch>{/* ... */}</EntitySwitch>
  </>
);
```

---

## The "Local data" tab is shared and extensible

The tab does not hard-code its rows. Each row is a `LocalDataResetEntry`
registered through a small, framework-agnostic API. This plugin registers its
own row on import:

```ts
import { registerLocalDataReset } from '@skywize-gmbh/backstage-plugin-visited';

registerLocalDataReset({
  id: 'visited-entities',
  title: 'Visited entities',
  description: 'The data behind the “Top Visited” and “Recently Visited” widgets.',
  action: () => clearEntityVisits(),
});
```

**Any other plugin can add its own row the same way** — for example a future
homepage-layout plugin or feeds plugin:

```ts
import { registerLocalDataReset } from '@skywize-gmbh/backstage-plugin-visited';

registerLocalDataReset({
  id: 'homepage-layout',
  title: 'My homepage layout',
  description: 'Your personal homepage arrangement.',
  buttonLabel: 'Reset to default',
  action: () => storageApi.forBucket('home.customHomepage').remove('home'),
});
```

The `LocalDataSettingsContent` component renders every registered row plus a
"Reset all local data" action, and reacts live as rows register.

> The registry lives in this package for now. As the number of contributing
> plugins grows it can be lifted into a shared `*-local-data-common` package
> without any change to the contribution API.

### `LocalDataResetEntry`

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Stable unique id (also the React key / de-dupe key). |
| `title` | `string` | Row heading, e.g. `"Visited entities"`. |
| `description` | `string` | One-line explanation of what gets cleared. |
| `action` | `() => void \| Promise<void>` | Runs on click. |
| `successMessage` | `string?` | Toast text. Defaults to `` `${title} cleared.` ``. |
| `buttonLabel` | `string?` | Defaults to `"Clear"`. |
| `order` | `number?` | Ascending sort hint. |

---

## Public API

| Export | Available from | Purpose |
| --- | --- | --- |
| `default` (frontend plugin) | `/alpha` | NFS plugin with both widgets + settings tab. |
| `visitedPlugin` | root | Legacy plugin instance. |
| `MostVisitedCard`, `RecentlyVisitedCard` | root | Legacy homepage cards. |
| `LocalDataSettingsContent` | root | The Local data tab UI. |
| `VisitTracker`, `useRecordEntityVisit` | root | Record visits from an entity page. |
| `MostVisitedEntities`, `RecentVisitedEntities` | root | Raw list components. |
| `recordVisit`, `readEntityVisits`, `clearEntityVisits` | root | Storage primitives. |
| `registerLocalDataReset`, `useLocalDataResets`, `getLocalDataResets` | root & `/alpha` | Local data contribution API. |
| `DEFAULT_KINDS`, `DEFAULT_LIMIT` | root | Widget defaults. |

---

## Data & privacy

All state is kept in the visitor's browser under the `entity-visits:v1`
`localStorage` key (capped at 500 entries). Nothing is sent to a server. Users
can clear it at any time from the **Local data** settings tab.

---

## Development

```bash
yarn install
yarn tsc      # type-check
yarn lint
yarn test
yarn build    # produces dist/ (root + alpha entry points)
```

## License

Apache-2.0
