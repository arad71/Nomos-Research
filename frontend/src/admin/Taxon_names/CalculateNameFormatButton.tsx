import * as React from 'react';
import { useState } from 'react';
import { useNotify, LinearProgress, Button } from 'react-admin';
import FunctionsIcon from '@mui/icons-material/Functions';

const CalculateNameFormatButton = () => {
  const notify = useNotify();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fetchData = () => {
    setLoading(true);
    const authHeader = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authHeader}`,
    };
    fetch('/api/v1/taxon_names_calculate', {
      headers: headers,
      method: 'POST',
      body: null,
    })
      .then((response) => {
        if (!response.body) {
          return;
        }
        const reader = response.body.getReader();
        const textDecoder = new TextDecoder();

        return reader
          .read()
          .then(function processStream({ done, value }): Promise<unknown> {
            if (done) {
              return Promise.resolve(null);
            }
            let chunk = textDecoder.decode(value);
            if (chunk.trim()) {
              let data = JSON.parse(chunk);
              let percentage = Math.floor((data.count / data.total) * 100);
              setProgress(percentage);
              if (percentage === 100) {
                notify('Processing completed.');
              }
            }

            return reader.read().then(processStream);
          });
      })
      .catch((error) => {
        notify(`Error: ${error.message}`, { type: 'warning' });
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div>
      <Button
        label="Calculate Name Formats"
        onClick={fetchData}
        disabled={loading}
      >
        <FunctionsIcon />
      </Button>
      {loading && <LinearProgress variant="determinate" value={progress} />}
    </div>
  );
};

export default CalculateNameFormatButton;
