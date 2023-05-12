import React from 'react';
import {
  Button,
  Loading,
  useDataProvider,
  useListContext,
  useNotify,
} from 'react-admin';

import DownloadIcon from '@material-ui/icons/GetApp';

type BatchExportButtonProps = {
  batchSize?: number;
  label?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
};

const BatchExportButton: React.FC<BatchExportButtonProps> = (
  props: BatchExportButtonProps
) => {
  const {
    batchSize = 1000,
    onClick,
    label = 'ra.action.export',
    icon = defaultIcon,
    ...rest
  } = props;
  const [isExporting, setIsExporting] = React.useState(false);
  const context = useListContext();
  const dataProvider = useDataProvider();
  const notify = useNotify();

  /**
   * Handles the export process.
   */
  const handleExport = async () => {
    setIsExporting((isExporting) => true);
    let current: number = 0;
    let allRecords: any[] = [];
    let currentPage = context.page;

    // Notify the user about the download and fetching process
    notify(
      `Downloading %{defaultTitle}\n` +
        ` Fetching %{total} records in the background.` +
        ` You will be notified when the download completes.\n` +
        `You can keep using the application in the meantime.`,
      {
        messageArgs: context,
        multiLine: true,
        autoHideDuration: 10000,
      }
    );

    /**
     * Handles the error and notifies the user.
     * @param error - The error object or string.
     */
    const errorHandler = (error: Error | string | unknown) => {
      const messageArgs: { page: number; error: Error | string | unknown } = {
        page: currentPage,
        error: error,
      };
      notify('Failed to fetch page %{page}. Error was: \n%{error}', {
        type: 'error',
        messageArgs: messageArgs,
        multiLine: true,
        autoHideDuration: 2000,
      });
      console.error('Failed to fetch page.', messageArgs);
    };

    // Fetch data in batches and accumulate all records
    while (current < context.total) {
      try {
        const { data, loading, error } = await dataProvider.getList(
          context.resource,
          {
            filter: context.filterValues,
            sort: context.currentSort,
            pagination: {
              page: currentPage,
              perPage: batchSize,
            },
          }
        );

        if (loading) {
          return <Loading />;
        }

        if (error) {
          errorHandler(error);
        }
        allRecords = [...allRecords, ...data];
      } catch (error) {
        errorHandler(error);
      }

      current += batchSize;
      currentPage += 1;
    }

    const baseName = [
      context.defaultTitle,
      JSON.stringify(context.filterValues).replace(/[^a-zA-Z0-9_.-]+/g, '_'),
      new Date().toISOString(),
    ]
      .join(' ')
      .replace(/[^a-zA-Z0-9_.-]/g, '_');
    // Use the default exporter from the list context to export as CSV
    context.exporter(allRecords, null, dataProvider, baseName);
    // Notify the user about the completion and provide the filename.
    notify(`Download complete.\n Look for a file called %{baseName}.csv.`, {
      type: 'success',
      messageArgs: { baseName: baseName },
      multiLine: true,
      autoHideDuration: 10000,
    });
    setIsExporting(false);
  };

  return (
    <div>
      <Button label="Export" disabled={isExporting} onClick={handleExport}>
        <DownloadIcon />
      </Button>
    </div>
  );
};
const defaultIcon = <DownloadIcon />;

export default BatchExportButton;
