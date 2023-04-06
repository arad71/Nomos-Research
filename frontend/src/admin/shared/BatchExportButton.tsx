import React from 'react';
import {
  Button,
  downloadCSV,
  useDataProvider,
  useListContext,
} from 'react-admin';

const BatchExportButton = ({ resource, ids }) => {
  console.log(resource);
  console.log(ids);
  const [isExporting, setIsExporting] = React.useState(false);
  const formatDataAsCSV = (data) => {
    const csvRows = [];

    // Get the headers from the first record
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(','));

    // Loop over the data and format each record as CSV
    for (const record of data) {
      const values = headers.map((header) => {
        const value = record[header];
        if (typeof value === 'string') {
          // Escape double quotes with double quotes
          return `"${value.replace(/"/g, '""')}"`;
        } else {
          return value;
        }
      });
      csvRows.push(values.join(','));
    }

    // Join all rows into a single string
    return csvRows.join('\n');
  };
  const context = useListContext();
  const dataProvider = useDataProvider();
  const handleExport = async () => {
    setIsExporting(true);
    // set the batch size to a value that works for your API
    const batch_size = 100;
    let current = 0;
    let allRecords = [];
    debugger;
    let currentPage = context.page;
    // Fetch data in batches and accumulate all records
    while (current < context.total) {
      const { data } = await dataProvider.getList(resource, {
        filter: context.filterValues,
        pagination: { page: currentPage, perPage: context.perPage },
      });
      allRecords = [...allRecords, ...data];
      current += context.perPage;
      currentPage += 1;
    }

    // Format and download the data as CSV
    const csv = formatDataAsCSV(allRecords);
    downloadCSV(csv);

    setIsExporting(false);
  };

  return (
    <Button label="Export" disabled={isExporting} onClick={handleExport} />
  );
};

export default BatchExportButton;
