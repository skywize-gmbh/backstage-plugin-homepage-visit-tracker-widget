import React from 'react';
import { MostVisitedEntities } from '../visits/EntityVisitCards';
import { DEFAULT_KINDS, DEFAULT_LIMIT } from '../constants';

/** Content for the "Top Visited" homepage card. */
export const MostVisitedContent = () => (
  <MostVisitedEntities limit={DEFAULT_LIMIT} allowedKinds={DEFAULT_KINDS} />
);
