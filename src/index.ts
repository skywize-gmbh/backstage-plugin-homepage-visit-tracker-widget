/**
 * @skywize-gmbh/backstage-plugin-visited
 *
 * "Top Visited" and "Recently Visited" homepage widgets plus a shared,
 * extensible "Local data" settings tab — all backed by browser-local storage.
 *
 * This is the classic (legacy) frontend-system entry point. For the New
 * Frontend System, import from `@skywize-gmbh/backstage-plugin-visited/alpha`.
 */

// Plugin + homepage cards (legacy).
export {
  visitedPlugin,
  MostVisitedCard,
  RecentlyVisitedCard,
} from './plugin';

// Settings tab content — mount inside your `SettingsLayout.Route`.
export { LocalDataSettingsContent } from './components/LocalDataSettingsContent';

// Reusable list components, if you want to compose your own cards.
export {
  MostVisitedEntities,
  RecentVisitedEntities,
} from './visits/EntityVisitCards';

// Visit tracking — mount `<VisitTracker />` on your entity page.
export { VisitTracker, useRecordEntityVisit } from './visits/VisitTracker';

// Storage primitives.
export {
  recordVisit,
  readAll as readEntityVisits,
  clearAll as clearEntityVisits,
} from './visits/EntityVisitStorage';
export type { EntityVisitEntry } from './visits/EntityVisitStorage';

// Shared "Local data" contribution API — used by this and future plugins.
export {
  registerLocalDataReset,
  getLocalDataResets,
  useLocalDataResets,
} from './localData/registry';
export type { LocalDataResetEntry } from './localData/registry';

// Defaults, exported so consumers can extend rather than re-declare them.
export { DEFAULT_KINDS, DEFAULT_LIMIT } from './constants';
