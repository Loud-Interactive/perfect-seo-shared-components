import React, { useState } from 'react';
import axios from 'axios';
import TypeWriterText from '../TypeWriterText/TypeWriterText';
import { ProcessTsvUrlResponse } from '@/perfect-seo-shared-components/data/requestTypes';

interface IncomingPlanItemResponse {
  guid: string;
  domain_name: string;
  brand_name: string;
  target_keyword: string;
  email: string;
  status?: string;
}

const BulkPostGenerator = () => {
  const [tsvUrl, setTsvUrl] = useState<string>('');
  const [items, setItems] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);


    try {
      const response = await axios.post<ProcessTsvUrlResponse>('/process-tsv-url', { url: tsvUrl }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(response.data.guids);
      setItems(response.data.guids);
      startPollingStatus(response.data);
    } catch (err) {
      setError('Error processing TSV file');
    } finally {
      setLoading(false);
    }
  }

  const startPollingStatus = (data: ProcessTsvUrlResponse) => {
    data.guids.forEach(item => {
      pollItemStatus(item);
    });
  };

  const pollItemStatus = async (guid: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(`https://content-status.replit.app/content/status/${guid}`);
        const updatedItem = response.data;

        setItems(prevItems =>
          prevItems.map(item =>
            item.guid === guid ? { ...item, status: updatedItem.status } : item
          )
        );

        if (updatedItem.status === 'Finished' || updatedItem.status.startsWith('Error')) {
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error(`Error polling status for item ${guid}:`, err);
      }
    }, 5000); // Poll every 5 seconds
  };

  return (
    <div>
      <h3 className='my-3 text-primary'><TypeWriterText withBlink string="Bulk Post Generator" /></h3>
      <form onSubmit={handleSubmit}>
        <div className='input-group'>
          <input
            type="text"
            value={tsvUrl}
            onChange={(e) => setTsvUrl(e.target.value)}
            placeholder="Enter TSV file URL"
            required
            className='form-control'
          />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Generate Posts'}
          </button>
        </div>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {items?.length > 0 && items.map(item => (
          <li key={item.guid}>
            {item.domain_name} - {item.status || 'Processing'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BulkPostGenerator