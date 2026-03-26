import * as React from 'react';
import { ResourceContextProvider } from 'ra-core';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

type KitResourcePageProps = {
  resource: string;
  component: React.ComponentType<any>;
  componentProps?: Record<string, unknown>;
};

const KitResourcePage = ({
  resource,
  component: Component,
  componentProps,
}: KitResourcePageProps) => {
  const muiTheme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: document.documentElement.classList.contains('dark')
            ? 'dark'
            : 'light',
        },
      }),
    []
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <ResourceContextProvider value={resource}>
        <div className="min-w-0 flex-1">
          <Component resource={resource} {...componentProps} />
        </div>
      </ResourceContextProvider>
    </ThemeProvider>
  );
};

export default KitResourcePage;
