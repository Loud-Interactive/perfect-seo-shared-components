'use client'
import { useEffect, useState } from 'react';
import { ContentType, OutlineRowProps, PostProps } from '../data/types';
import { fetchOutlineStatus, getPostStatus } from '../services/services';
import { createClient } from '../utils/supabase/client';

export interface StatusController {
  status: {
    outline: string,
    post: string,
    factcheck: string,
  },
  isComplete: {
    outline: boolean,
    post: boolean,
    factcheck: boolean,
  },
  error: {
    outline: string,
    post: string,
    factcheck: string,
  },
  resetStatus: (type: ContentType) => void,
  data: any
}
export default function useStatus(guid: string): StatusController {

  const supabase = createClient()

  const [status, setStatus] = useState({
    outline: undefined,
    post: undefined,
    factcheck: undefined,
  });

  const [error, setError] = useState({
    outline: undefined,
    post: undefined,
    factcheck: undefined,
  });

  const [isComplete, setIsComplete] = useState({
    outline: false,
    post: false,
    factcheck: false,
  });

  const [data, setData] = useState<any>({});

  const resetStatus = (type: ContentType) => {
    switch (type) {
      case ContentType.OUTLINE:
        setStatus({
          outline: 'pending',
          post: undefined,
          factcheck: undefined,
        });
        setIsComplete({
          outline: false,
          post: false,
          factcheck: false,
        });
    }
  };

  const getOutlineStatus = () => {
    supabase
      .from('content_plan_outlines')
      .select('*', { count: 'planned' })
      .eq('guid', guid)
      .then(res => {
        if (res.data) {
          const sortedData = res.data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setData(sortedData[0]);
          if (sortedData[0].status === 'completed') {
            setIsComplete((prev) => ({
              ...prev, outline: true,

            }));
          }
          if (sortedData[0].status === 'error') {
            setError((prev) => ({
              ...prev, outline: sortedData[0].status
            }));
          } else {
            setStatus({
              outline: res.data[0].status,
              post: undefined,
              factcheck: undefined,
            });
          }

        }
        else {
          console.log(res)
        }
      })
  }
  // setOutlineComplete(outlineStatus === 'completed');
  // setPostComplete(postStatus === 'Complete');
  // setFactcheckComplete(factcheckStatus === 'completed');

  useEffect(() => {
    let contentPlanOutlines;

    if (guid) {
      getOutlineStatus()
      contentPlanOutlines = supabase.channel(`status-${guid}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'content_plan_outlines', filter: `guid=eq.${guid}` },
          (payload) => {
            console.log('Change received!', payload)
          }
        )
        .subscribe()
    }
    return () => {
      contentPlanOutlines.unsubscribe()
    }
  }, [guid])
  useEffect(() => {
    if (isComplete?.outline) {
      getPostStatus(guid)
        .then(res => {
          console.log(res.data)
        })
    }
  }, [isComplete?.outline])

  return {
    status,
    isComplete,
    error,
    resetStatus,
    data
  };
}
