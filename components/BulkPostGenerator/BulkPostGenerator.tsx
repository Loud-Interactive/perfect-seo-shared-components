import React, { useState } from 'react';
import TypeWriterText from '../TypeWriterText/TypeWriterText';
import { ProcessTsvUrlResponse } from '@/perfect-seo-shared-components/data/requestTypes';
import PostStatusItem from './PostStatusItem';
import axiosInstance from '@/perfect-seo-shared-components/utils/axiosInstance';

interface IncomingPlanItemResponse {
  guid: string;
  domain_name: string;
  brand_name: string;
  target_keyword: string;
  email: string;
  status?: string;
}

const BulkPostGenerator = () => {
  // [
  //   "d22809ae-0c6f-40e7-b4cd-3c9d37fa7903",
  //   "0023b9a6-cf77-46e8-a47d-03f7bdb098e7",
  //   "947e9c5e-4401-4b4f-bafc-98d47f0071af",
  //   "2d26112d-4fd8-47a4-b5e0-2a82753caa70"
  // ]
  const [tsvUrl, setTsvUrl] = useState<string>('');
  const [items, setItems] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    axiosInstance.post<ProcessTsvUrlResponse>(`https://content-v5.replit.app/process-tsv-url?url=${tsvUrl.replaceAll("&", "%26")}`, {})
      .then(response => {
        setItems(response.data.guids);
        console.log(response.data.guids)
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