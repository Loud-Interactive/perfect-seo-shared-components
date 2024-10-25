import React, { useEffect, useState } from 'react';
import TypeWriterText from '../TypeWriterText/TypeWriterText';
import axiosInstance from '@/perfect-seo-shared-components/utils/axiosInstance';
import { createClient } from '@/perfect-seo-shared-components/utils/supabase/client';
import { useSelector } from 'react-redux';
import { RootState } from '@/perfect-seo-shared-components/lib/store';
import ContentStatusItem from './ContentStatusItem';
import * as d3 from "d3";

export interface IncomingPlanItemResponse {
  guid: string;
  domain_name: string;
  brand_name: string;
  target_keyword: string;
  email: string;
  status?: string;
}

const BulkContentPlanGenerator: React.FC = () => {
  const [tsvUrl, setTsvUrl] = useState<string>('');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useSelector((state: RootState) => state);
  const supabase = createClient()
  const [showItems, setShowItems] = useState<boolean>(true);

  const updateContent = (objs: any[]) => {

  }
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
      setItems(response.data.map(item => item.guid));
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


  const updateBulkContent = (guids: string[]) => {
    supabase
      .from('profiles')
      .update({ bulk_content_guids: guids })
      .eq('email', user?.email)
      .select('*')
      .then(res => {
        setItems(res.data[0].bulk_content_guids)
      })
  }
  const deleteContent = (guid: string) => {
    console.log(items)
    let index = items.indexOf(guid)
    let newItems
    if (index > 1) {
      newItems = [
        ...items.slice(0, index),
        ...items.slice(index + 1),
      ]
    }
    else {
      newItems = items.slice(1)
    }
    updateBulkContent(newItems)
  }



  const toggleShowItems = (e) => {
    e.preventDefault();
    setShowItems(!showItems);
  }



  return (
    <div>
      <div className='d-flex justify-content-between align-items-center my-3'>

        <h3 className='text-white'><TypeWriterText withBlink string="Bulk Content Plan Generator" /></h3>
        {items?.length > 0 && <div className='d-flex align-items-center'>
          <p className='mb-0'>
            <a className='text-white' onClick={toggleShowItems}>{showItems ? 'Hide Items' : 'Show Items'}</a>
            <span className='badge rounded-pill text-bg-primary ms-3 mb-1'>{items.length}</span>
          </p>
        </div>}
      </div>
      <form>
        <div className='input-group mb-1'>
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
        <a className='text-primary' href="https://docs.google.com/spreadsheets/d/1sN9iTF8qL5NDUhQ9NIzLgByXdjLVRthoS5S7xhD0zg8/copy" target="_blank">
          <small>Get Google Sheets Template</small>
        </a>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {showItems && items?.length > 0 && <ul className='clear-list-properties row g-3 px-2'>
        {items.map((item, idx) => (
          <ContentStatusItem item={item} guid={item.guid} key={`status-item-${idx}`} deleteContent={deleteContent} />
        ))}
      </ul>}
    </div >
  );
};

export default BulkContentPlanGenerator;