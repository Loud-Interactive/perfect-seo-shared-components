import React, { useEffect, useState } from 'react';
import TypeWriterText from '../TypeWriterText/TypeWriterText';
import { ProcessTsvUrlResponse } from '@/perfect-seo-shared-components/data/requestTypes';
import PostStatusItem from './PostStatusItem';
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

const BulkPostGenerator = () => {
  const [tsvUrl, setTsvUrl] = useState<string>('');
  const [items, setItems] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useSelector((state: RootState) => state);
  const supabase = createClient();

  useEffect(() => {
    if (profile?.bulk_posts) {
      setItems(profile.bulk_posts)
    }

  }, [profile?.bulk_posts])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    axiosInstance.post<ProcessTsvUrlResponse>(`https://content-v5.replit.app/process-tsv-url?url=${tsvUrl.replaceAll("&", "%26")}`)
      .then(response => {
        setItems(response.data.guids);
        supabase
          .from('profiles')
          .update({ bulk_posts: response.data.guids })
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



  return (
    <div>
      <h3 className='my-3 text-primary'><TypeWriterText withBlink string="Bulk Post Generator" /></h3>
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
          <button className="btn btn-primary" onClick={handleSubmit} type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Generate Posts'}
          </button>
        </div>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {items?.length > 0 && <ul className='clear-list-properties row g-3 px-2'>
        <li className="card p-3 bg-primary">
          <div className="row d-flex align-items-center justify-content-between">
            <div className="capitalize col-12 col-md-4 ">Title</div>
            <div className="capitalize col-12 col-md-4">Domain</div>  <div className="capitalize col-12 col-md-4">Status</div>
          </div>
        </li>
        {items.map(item => (
          <PostStatusItem guid={item} key={item} />
        ))}
      </ul>}
    </div>
  );
};

export default BulkPostGenerator