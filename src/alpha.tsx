/**
 * New Frontend System entry point for `@skywize-gmbh/backstage-plugin-visited`.
 *
 * Provides:
 *  - two home-page widgets ("Top Visited", "Recently Visited"), installable
 *    from the home page widget catalog;
 *  - a "Local data" tab under user settings, rendering the shared reset
 *    registry (see {@link registerLocalDataReset}).
 */
import React from 'react';
import {
  createFrontendPlugin,
  SubPageBlueprint,
} from '@backstage/frontend-plugin-api';
import { HomePageWidgetBlueprint } from '@backstage/plugin-home-react/alpha';

// Registers this plugin's "Visited entities" row in the shared Local data tab.
import './localData/registerVisitedReset';

const mostVisitedWidget = HomePageWidgetBlueprint.make({
  name: 'most-visited',
  params: {
    title: 'Top Visited',
    description: 'Entities you open most often.',
    components: async () => {
      const { MostVisitedContent } = await import(
        './components/MostVisitedContent'
      );
      return { Content: MostVisitedContent };
    },
    layout: {
      width: { minColumns: 4, defaultColumns: 6 },
      height: { minRows: 3, defaultRows: 6 },
    },
  },
});

const recentlyVisitedWidget = HomePageWidgetBlueprint.make({
  name: 'recently-visited',
  params: {
    title: 'Recently Visited',
    description: 'Entities you opened most recently.',
    components: async () => {
      const { RecentlyVisitedContent } = await import(
        './components/RecentlyVisitedContent'
      );
      return { Content: RecentlyVisitedContent };
    },
    layout: {
      width: { minColumns: 4, defaultColumns: 6 },
      height: { minRows: 3, defaultRows: 6 },
    },
  },
});

const localDataSettingsPage = SubPageBlueprint.make({
  name: 'local-data',
  // Attach as a tab of the built-in user settings page.
  attachTo: { id: 'page:user-settings', input: 'pages' },
  params: {
    path: 'local-data',
    title: 'Local data',
    loader: async () => {
      const { LocalDataSettingsContent } = await import(
        './components/LocalDataSettingsContent'
      );
      return <LocalDataSettingsContent />;
    },
  },
});

/**
 * The New Frontend System plugin. Install it in `packages/app/src/App.tsx`:
 *
 * ```ts
 * import visitedPlugin from '@skywize-gmbh/backstage-plugin-visited/alpha';
 * export const app = createApp({ features: [visitedPlugin] });
 * ```
 */
export default createFrontendPlugin({
  pluginId: 'visited',
  extensions: [mostVisitedWidget, recentlyVisitedWidget, localDataSettingsPage],
});

// Re-export the shared contribution API so NFS consumers can add their own
// reset rows without importing the legacy entry point.
export {
  registerLocalDataReset,
  getLocalDataResets,
  useLocalDataResets,
} from './localData/registry';
export type { LocalDataResetEntry } from './localData/registry';
