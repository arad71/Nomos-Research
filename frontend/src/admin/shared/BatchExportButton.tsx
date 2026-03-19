import React from 'react';
import {
  Button,
  useDataProvider,
  useListContext,
  useNotify,
} from 'react-admin';

import DownloadIcon from '@mui/icons-material/GetApp';

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
    setIsExporting(true);
    let taxoninfo = [];
    let conscodeinfo = [];
    let allRecords: any[] = [];
    let currentPage = 1;

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

    const total = context.total || 0;
    if (total === 0) {
      notify('No records to export.', { type: 'warning' });
      setIsExporting(false);
      return;
    }
    const totalPages = Math.ceil(total / batchSize);

    // Fetch data in batches and accumulate all records
    while (currentPage <= totalPages) {
      try {
        let { data } = await dataProvider.getList(context.resource, {
          filter: context.filterValues,
          sort: context.sort || { field: 'id', order: 'ASC' },
          pagination: {
            page: currentPage,
            perPage: batchSize,
          },
        });

        if (!data || data.length === 0) {
          break;
        }

        if (data[0]?.taxon_name_id) {
          const taxonsForExport = await Promise.all(
            data.map(async (post: any) => {
              const { ...taxonForExport } = post;
              taxoninfo = await dataProvider.getOne('taxon_names', {
                id: post.taxon_name_id,
              });

              taxonForExport.formatted_scientific_name =
                taxoninfo.data.formatted_scientific_name;
              taxonForExport.scientific_name = taxoninfo.data.scientific_name;

              return taxonForExport;
            })
          );
          data = taxonsForExport;
        }

        if (data[0]?.conservation_code_id) {
          const conscodesForExport = await Promise.all(
            data.map(async (post: any) => {
              const { ...conscodeForExport } = post;
              conscodeinfo = await dataProvider.getOne('taxon_names', {
                id: post.taxon_name_id,
              });

              conscodeForExport.formatted_scientific_name =
                conscodeinfo.data.formatted_scientific_name;
              conscodeForExport.scientific_name =
                conscodeinfo.data.scientific_name;

              return conscodeForExport;
            })
          );
          data = conscodesForExport;
        }
        allRecords = [...allRecords, ...data];
      } catch (error) {
        errorHandler(error);
        setIsExporting(false);
        return;
      }

      currentPage += 1;
    }

    if (allRecords.length === 0) {
      notify('No records found to export.', { type: 'warning' });
      setIsExporting(false);
      return;
    }

    const exportRecords =
      context.resource === 'taxon_names'
        ? allRecords.map((record: any) => {
            const { id, taxon_name_id, ...rest } = record;
            return {
              NomosID: taxon_name_id ?? id ?? '',
              ...rest,
            };
          })
        : allRecords;

    const baseName = [
      context.defaultTitle,
      JSON.stringify(context.filterValues).replace(/[^a-zA-Z0-9_.-]+/g, '_'),
      new Date().toISOString(),
    ]
      .join(' ')
      .replace(/[^a-zA-Z0-9_.-]/g, '_');
    // Use the default exporter from the list context to export as CSV
    context.exporter(exportRecords, null, dataProvider, baseName);
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
