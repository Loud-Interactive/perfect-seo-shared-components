import React, { useEffect, useState } from 'react';
import TypeWriterText from '../TypeWriterText/TypeWriterText';
import axiosInstance from '@/perfect-seo-shared-components/utils/axiosInstance';
import { createClient } from '@/perfect-seo-shared-components/utils/supabase/client';
import { useSelector } from 'react-redux';
import { RootState } from '@/perfect-seo-shared-components/lib/store';

interface IncomingPlanItemResponse {
  guid: string;
  domain_name: string;
  brand_name: string;
  target_keyword: string;
  email: string;
  status?: string;
}

const BulkContentPlanGenerator: React.FC = () => {
  const [tsvUrl, setTsvUrl] = useState<string>('');
  const [items, setItems] = useState<IncomingPlanItemResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useSelector((state: RootState) => state);
  const supabase = createClient()
  const [showItems, setShowItems] = useState<boolean>(true);

  useEffect(() => {
    if (profile?.bulk_content_guids) {
      setItems(profile.bulk_content_guids)
    }
  }, [profile?.bulk_content_guids])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    axiosInstance.post<IncomingPlanItemResponse[]>(
      `https://planperfectapi.replit.app/process_tsv_from_url?url=${tsvUrl.replaceAll("&", "%26")}`, {}
    ).then(response => {
      setItems(response.data);
      startPollingStatus(response.data);
      supabase
        .from('profiles')
        .update({ bulk_content_guids: response.data.map(item => item.guid) })
        .eq('email', user?.email)
        .select('*')
        .then(res => {
          console.log(res)
        })
      setLoading(false)
    })

      .catch((err) => {
        setLoading(false);
        setError(err?.response?.data?.detail || 'Error processing TSV file');
      })
  };

  const startPollingStatus = (items: IncomingPlanItemResponse[]) => {
    items.forEach(item => {
      pollItemStatus(item.guid);
    });
  };

  const pollItemStatus = async (guid: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await axiosInstance.get(`https://planperfectapi.replit.app/get_status/${guid}`);
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

  const toggleShowItems = (e) => {
    e.preventDefault();
    setShowItems(!showItems);
  }

  return (
    <div>
      <div className='d-flex justify-content-between align-items-center my-3'>
        <h3 className='text-primary'><TypeWriterText withBlink string="Bulk Content Plan Generator" /></h3>
        {items?.length > 0 && <div className='d-flex align-items-center'>
          <p className='mb-0'>
            <a className='text-white' onClick={toggleShowItems}>{showItems ? 'Hide Items' : 'Show Items'}</a>
            <span className='badge rounded-pill text-bg-primary ms-3 mb-1'>{items.length}</span>
          </p>
        </div>}
      </div>
      <form>
        <div className='input-group'>
          <input
            type="text"
            value={tsvUrl}
            onChange={(e) => setTsvUrl(e.target.value)}
            placeholder="Enter TSV file URL"
            required
            className='form-control'
          />
          <button onClick={handleSubmit} className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Generate Content Plans'}
          </button>
        </div>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {showItems && items?.length > 0 && <ul>
        {items.map(item => (
          <li key={item.guid}>
            {item.domain_name} - {item.status || 'Processing'}
          </li>
        ))}
      </ul>}
    </div >
  );
};

export default BulkContentPlanGenerator;