import React, { useState, type ReactNode } from 'react';
import {
  Box,
  Button,
  Divider,
  Snackbar,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { InfoCard } from '@backstage/core-components';
import {
  useLocalDataResets,
  type LocalDataResetEntry,
} from '../localData/registry';

const useStyles = makeStyles(theme => ({
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(1.5, 0),
  },
  info: { flex: 1, minWidth: 0 },
  title: { fontWeight: 500 },
  desc: { color: theme.palette.text.secondary },
  empty: { padding: theme.spacing(2), color: theme.palette.text.secondary },
}));

/**
 * The shared "Local data" settings tab. Renders one row per registered
 * {@link LocalDataResetEntry}, plus a "Reset all" action. Plugins contribute
 * rows via `registerLocalDataReset` — this component owns no data itself.
 */
export const LocalDataSettingsContent = () => {
  const classes = useStyles();
  const entries = useLocalDataResets();
  const [toast, setToast] = useState<string | undefined>();

  const run =
    (entry: Pick<LocalDataResetEntry, 'title' | 'action' | 'successMessage'>) =>
    async () => {
      await entry.action();
      setToast(entry.successMessage ?? `${entry.title} cleared.`);
    };

  const resetAll = async () => {
    for (const entry of entries) {
      // eslint-disable-next-line no-await-in-loop
      await entry.action();
    }
    setToast('All local data reset.');
  };

  const renderRow = (entry: LocalDataResetEntry): ReactNode => (
    <Box key={entry.id} className={classes.row}>
      <Box className={classes.info}>
        <Typography variant="body1" className={classes.title}>
          {entry.title}
        </Typography>
        <Typography variant="body2" className={classes.desc}>
          {entry.description}
        </Typography>
      </Box>
      <Button
        variant="outlined"
        size="small"
        onClick={run(entry)}
      >
        {entry.buttonLabel ?? 'Clear'}
      </Button>
    </Box>
  );

  return (
    <Box>
      <InfoCard
        title="Local data"
        subheader="Stored in this browser for your account only. Reload the page to see the effect."
      >
        {entries.length === 0 ? (
          <Typography variant="body2" className={classes.empty}>
            No local data is registered by any installed plugin.
          </Typography>
        ) : (
          <>
            {entries.map(renderRow)}
            <Divider />
            <Box className={classes.row}>
              <Box className={classes.info}>
                <Typography variant="body1" className={classes.title}>
                  Reset everything
                </Typography>
                <Typography variant="body2" className={classes.desc}>
                  Clear all of the above at once.
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="small"
                color="secondary"
                onClick={resetAll}
              >
                Reset all local data
              </Button>
            </Box>
          </>
        )}
      </InfoCard>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={() => setToast(undefined)}
        message={toast}
      />
    </Box>
  );
};
