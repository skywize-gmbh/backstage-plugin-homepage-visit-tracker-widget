import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useApi } from '@backstage/core-plugin-api';
import {
  catalogApiRef,
  EntityRefLink,
  type CatalogApi,
} from '@backstage/plugin-catalog-react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
} from '@material-ui/core';
import { parseEntityRef, type Entity } from '@backstage/catalog-model';
import { readAll } from './EntityVisitStorage';

type CommonProps = {
  limit?: number;
  allowedKinds?: string[];
};

type Row = {
  ref: string;
  kind: string;
  count?: number;
  lastVisited: string;
};

const useStyles = makeStyles(theme => ({
  list: { paddingTop: 0, paddingBottom: 0 },
  item: { paddingTop: 1, paddingBottom: 1 },
  secondaryAction: {
    right: theme.spacing(2),
    top: '50%',
    transform: 'translateY(-50%)',
  },
  empty: { padding: theme.spacing(2), color: theme.palette.text.secondary },
}));

async function fetchEntitiesByRefs(
  api: CatalogApi,
  refs: string[],
): Promise<(Entity | undefined)[]> {
  if (refs.length === 0) return [];
  const res = await api.getEntitiesByRefs({ entityRefs: refs });
  return res.items;
}

const displayKind = (k?: string) => {
  const s = (k ?? '').trim();
  return s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : 'Entity';
};

const kindFromRef = (ref: string): string => {
  try {
    const { kind } = parseEntityRef(ref);
    return displayKind(kind);
  } catch {
    const m = ref.match(/^([^:]+):/);
    return displayKind(m?.[1] ?? 'Entity');
  }
};

function buildRows(
  visits: { ref: string; count: number; lastVisited: string }[],
  entities: (Entity | undefined)[],
  allowedKinds?: string[],
): Row[] {
  const allowed = allowedKinds?.map(k => k.toLowerCase());
  const rows: Row[] = [];

  visits.forEach((v, i) => {
    const entity = entities[i];
    const kind = entity ? displayKind(entity.kind) : kindFromRef(v.ref);

    if (allowed && !allowed.includes(kind.toLowerCase())) return;

    rows.push({
      ref: v.ref,
      kind,
      count: v.count,
      lastVisited: v.lastVisited,
    });
  });

  return rows;
}

/**
 * "Top Visited" — entities ordered by how often they have been opened, with the
 * most recent visit breaking ties.
 */
export const MostVisitedEntities = ({
  limit = 10,
  allowedKinds,
}: CommonProps) => {
  const classes = useStyles();
  const catalogApi = useApi(catalogApiRef);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const visits = readAll();
      const top = [...visits]
        .sort(
          (a, b) =>
            b.count - a.count || b.lastVisited.localeCompare(a.lastVisited),
        )
        .slice(0, Math.max(limit, 1));

      const entities = await fetchEntitiesByRefs(
        catalogApi,
        top.map(v => v.ref),
      );
      if (!cancelled) setRows(buildRows(top, entities, allowedKinds));
    })();
    return () => {
      cancelled = true;
    };
  }, [catalogApi, limit, allowedKinds]);

  if (rows.length === 0) {
    return (
      <Typography variant="body2" className={classes.empty}>
        No entity visits recorded yet.
      </Typography>
    );
  }

  return (
    <List dense className={classes.list}>
      {rows.map(r => (
        <ListItem key={`${r.ref}-most`} dense classes={{ root: classes.item }}>
          <ListItemText
            primary={<EntityRefLink entityRef={r.ref} />}
            secondary={`${r.kind} • last: ${new Date(r.lastVisited).toLocaleString()}`}
            primaryTypographyProps={{ variant: 'body2' }}
            secondaryTypographyProps={{
              variant: 'caption',
              color: 'textSecondary',
            }}
          />
          <ListItemSecondaryAction className={classes.secondaryAction}>
            <Typography variant="caption" aria-label="Visits">
              {r.count ?? 0}×
            </Typography>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
};

/**
 * "Recently Visited" — the same entities ordered by most-recent visit time.
 */
export const RecentVisitedEntities = ({
  limit = 10,
  allowedKinds,
}: CommonProps) => {
  const classes = useStyles();
  const catalogApi = useApi(catalogApiRef);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const visits = readAll();
      const recent = [...visits]
        .sort((a, b) => b.lastVisited.localeCompare(a.lastVisited))
        .slice(0, Math.max(limit, 1));

      const entities = await fetchEntitiesByRefs(
        catalogApi,
        recent.map(v => v.ref),
      );
      if (!cancelled) setRows(buildRows(recent, entities, allowedKinds));
    })();
    return () => {
      cancelled = true;
    };
  }, [catalogApi, limit, allowedKinds]);

  if (rows.length === 0) {
    return (
      <Typography variant="body2" className={classes.empty}>
        No entity visits recorded yet.
      </Typography>
    );
  }

  return (
    <List dense className={classes.list}>
      {rows.map(r => (
        <ListItem
          key={`${r.ref}-recent`}
          dense
          classes={{ root: classes.item }}
        >
          <ListItemText
            primary={<EntityRefLink entityRef={r.ref} />}
            secondary={`${r.kind} • visits: ${r.count ?? 0}`}
            primaryTypographyProps={{ variant: 'body2' }}
            secondaryTypographyProps={{
              variant: 'caption',
              color: 'textSecondary',
            }}
          />
          <ListItemSecondaryAction className={classes.secondaryAction}>
            <Typography variant="caption">
              {new Date(r.lastVisited).toLocaleString()}
            </Typography>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
};
