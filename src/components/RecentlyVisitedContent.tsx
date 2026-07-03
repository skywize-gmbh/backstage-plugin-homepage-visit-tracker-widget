import React from 'react';
import { RecentVisitedEntities } from '../visits/EntityVisitCards';
import { DEFAULT_KINDS, DEFAULT_LIMIT } from '../constants';

/** Content for the "Recently Visited" homepage card. */
export const RecentlyVisitedContent = () => (
  <RecentVisitedEntities limit={DEFAULT_LIMIT} allowedKinds={DEFAULT_KINDS} />
);
