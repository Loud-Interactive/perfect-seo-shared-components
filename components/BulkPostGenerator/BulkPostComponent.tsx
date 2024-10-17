import React, { useEffect, useMemo, useState } from 'react';
import TypeWriterText from '../TypeWriterText/TypeWriterText';
import { ProcessTsvUrlResponse } from '@/perfect-seo-shared-components/data/requestTypes';
import PostStatusItem from './PostStatusItem';
import axiosInstance from '@/perfect-seo-shared-components/utils/axiosInstance';
import { createClient } from '@/perfect-seo-shared-components/utils/supabase/client';
import { useSelector } from 'react-redux';
import { RootState } from '@/perfect-seo-shared-components/lib/store';
import * as d3 from "d3";
import useForm from '@/perfect-seo-shared-components/hooks/useForm';
import useArrayForm from '@/perfect-seo-shared-components/hooks/useArrayForm';
import { PostUploadItem } from '@/perfect-seo-shared-components/data/types';

interface IncomingPlanItemResponse {
  guid: string;
  domain_name: string;
  brand_name: string;
  target_keyword: string;
  email: string;
  status?: string;
}

const BulkPostComponent = () => {
  const [tsvUrl, setTsvUrl] = useState<string>('');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useSelector((state: RootState) => state);
  const supabase = createClient();
  const [tsv, setTsv] = useState(null)
  const [showItems, setShowItems] = useState<boolean>(true);
  const form = useForm();
  const arrayForm = useArrayForm(form)

  useEffect(() => {
    if (profile?.bulk_posts) {
      setItems(profile.bulk_posts[0])
    }

  }, [profile?.bulk_posts])

  const itemLists = useMemo(() => {
    let draft = [];
    let processing = [];
    if (items?.length > 0) {
      draft = items.filter((item: PostUploadItem) => item.status === 'draft')
      processing = items.filter((item: PostUploadItem) => item.status !== 'draft')
    }
    return { processing, draft }
  }, [items])


  const updateBulkPosts = (items: IncomingPlanItemResponse[]) => {
    supabase
      .from('profiles')
      .update({ bulk_posts: items })
      .eq('email', user?.email)
      .select('*')
      .then(res => {
        setItems(res.data[0].bulk_posts)
      })
  }

  const deletePost = (idx: number) => {
    let newItems = [
      ...items.slice(0, idx),
      ...items.slice(idx + 1),
    ];
    updateBulkPosts(newItems)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // setLoading(true);
    setError(null);

    axiosInstance.get(tsvUrl).then(response => {
      let tsv = d3.tsvParse(response.data)
      delete tsv.columns;
      arrayForm.setArrayState(tsv);
      setTsv(tsv)

    }
    )
    submitHandler()

  };
  // https://docs.google.com/spreadsheets/d/e/2PACX-1vSUZ44bbN_Hvn9LkjhU_BEr4dBh9vrQf6ppHQDCEIQntG0DaD8T6rOCeq3deUcmSq9IZ9u0XxgaSRd4/pub?gid=0&single=true&output=tsv
  const submitHandler = () => {
    setLoading(true)
    axiosInstance.post<ProcessTsvUrlResponse>(`https://content-v5.replit.app/process-tsv`, tsv)
      .then(response => {
        console.log(response)
        setItems(response.data.guids);
        supabase
          .from('profiles')
          .update({
            bulk_posts: [...items, tsv.map((post) => {
              return ({ ...post, status: 'draft' })
            })]
          })
          .eq('email', user?.email)
          .select('*')
        setLoading(false)
      })

      .catch((err) => {
        setLoading(false);
        setError(err?.response?.data?.detail || 'Error processing TSV file');
      })
  }
  const toggleShowItems = (e) => {
    e.preventDefault();
    setShowItems(!showItems);
  }

  return (
    <div>
      <div className='d-flex justify-content-between align-items-center my-3'>
        <h3 className='text-primary'><TypeWriterText withBlink string="Bulk Post Generator" /></h3>
        {itemLists?.processing?.length > 0 && <div className='d-flex align-items-center'>
          <p className='mb-0'>
            <a className='text-white' onClick={toggleShowItems}>{showItems ? 'Hide Items' : 'Show Items'}</a>
            <span className='badge rounded-pill text-bg-primary ms-3 mb-1'>{itemLists?.processing?.length}</span>
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
          <button className="btn btn-primary" onClick={handleSubmit} type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Check'}
          </button>
        </div>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {itemLists?.draft?.length > 0 && <ul className='clear-list-properties row g-1 px-1'>
        <li className="card px-3 bg-primary d-none d-md-block">
          <div className="row d-flex align-items-center justify-content-between">
            <div className="capitalize col-12 col-md-4 ">Keyword</div>
            <div className="capitalize col-12 col-md-4">Domain</div>  <div className="capitalize col-12 col-md-4">Status</div>
          </div>
        </li>
        {itemLists?.draft.map((item, idx) => (
          <PostStatusItem data={item} guid={item?.guid} key={item?.guid} deletePost={deletePost} idx={idx} />
        ))}
      </ul>}
      {
        showItems && itemLists?.processing?.length > 0 && <ul className='clear-list-properties row g-3 px-2'>
          <li className="card p-3 bg-primary d-none d-md-block">
            <div className="row d-flex align-items-center justify-content-between">
              <div className="capitalize col-12 col-md-4 ">Title</div>
              <div className="capitalize col-12 col-md-4">Domain</div>  <div className="capitalize col-12 col-md-4">Status</div>
            </div>
          </li>
          {itemLists?.processing.map((item, idx) => (
            <PostStatusItem data={item} guid={item?.guid} key={item?.guid} deletePost={deletePost} idx={idx} />
          ))}
        </ul>
      }
    </div >
  );
};

export default BulkPostComponent