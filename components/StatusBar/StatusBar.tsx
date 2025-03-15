'use client'
import { ContentType } from "@/perfect-seo-shared-components/data/types";
import { fetchOutlineStatus, getFactCheckStatus, getPost, getPostStatus } from "@/perfect-seo-shared-components/services/services";
import { useEffect, useState } from "react";
import TypeWriterText from "../TypeWriterText/TypeWriterText";
import { keyToLabel } from "@/perfect-seo-shared-components/utils/conversion-utilities";
import { createClient } from "@/perfect-seo-shared-components/utils/supabase/client";

interface StatusBarProps {
  content_plan_outline_guid?: string;
  content_plan_guid?: string
  content_plan_factcheck_guid?: string
  content_plan_social_guid?: string,
  live_post_url?: string,
  addLiveUrlHandler?: () => void
  onGeneratePost?: () => void
  indexHandler?: () => void,
  type: ContentType,
  index_status?: string
  post_status?: string,
  outline_status?: string,
  task_id?: string;
}

const StatusBar = ({
  post_status,
  outline_status,
  content_plan_outline_guid,
  content_plan_guid,
  content_plan_factcheck_guid,
  content_plan_social_guid,
  addLiveUrlHandler,
  live_post_url,
  onGeneratePost,
  indexHandler,
  index_status,
  task_id,
  type
}: StatusBarProps) => {
  const [outlineStatus, setOutlineStatus] = useState<string>('');
  const [postStatus, setPostStatus] = useState<string>('');
  const [factcheckStatus, setFactcheckStatus] = useState<string>('');

  const [outlineLoading, setOutlineLoading] = useState<boolean>(false);
  const [postLoading, setPostLoading] = useState<boolean>(false);
  const [factcheckLoading, setFactcheckLoading] = useState<boolean>(false);

  const [outlineError, setOutlineError] = useState<string>('');
  const [postError, setPostError] = useState<string>('');
  const [factcheckError, setFactcheckError] = useState<string>('');


  const [outlineComplete, setOutlineComplete] = useState<boolean>(false);
  const [postComplete, setPostComplete] = useState<boolean>(false);
  const [factcheckComplete, setFactcheckComplete] = useState<boolean>(false);
  const supabase = createClient();


  const fetchOutlineStatusData = () => {
    if (content_plan_outline_guid) {
      setOutlineLoading(true);
      fetchOutlineStatus(content_plan_outline_guid)
        .then(res => {
          if (res.data[0]) {
            setOutlineLoading(false);
            setOutlineStatus(res.data[0]?.status);
          }
          else {
            setOutlineLoading(false);
            setOutlineStatus('')
          }

        })
    }
  };

  useEffect(() => {
    let contentPlanOutlines;
    if (content_plan_outline_guid && !outline_status) {
      fetchOutlineStatusData();
      contentPlanOutlines = supabase.channel(`statusbar-outline-status-${content_plan_outline_guid}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'content_plan_outline_statuses', filter: `outline_guid=eq.${content_plan_outline_guid}` },
          (payload) => {
            setOutlineStatus(payload.new.status)
          }
        )
        .subscribe()
    }
    else if (outline_status) {
      setOutlineStatus(outline_status)
    }
    if (contentPlanOutlines) {
      return () => {
        contentPlanOutlines.unsubscribe()
      }
    }
  }, [content_plan_outline_guid, outline_status])


  const fetchPostStatusData = () => {
    if (task_id) {
      setPostLoading(true);
      getPost(task_id)
        .then(res => {
          setPostLoading(false);
          setPostStatus(res.data[0].status);
        })
    }
  };


  useEffect(() => {
    let postInterval;
    if (task_id && !post_status) {
      fetchPostStatusData();
      postInterval = setInterval(() => {
        fetchPostStatusData();
      }, 60000);
    }
    else if (post_status) {
      setPostStatus(post_status)
    }
    return () => {
      if (postInterval) {
        clearInterval(postInterval);
      }
    };
  }, [task_id, post_status]);

  const fetchFactcheckStatusData = () => {
    if (content_plan_factcheck_guid) {
      setFactcheckLoading(true);
      getFactCheckStatus(content_plan_factcheck_guid)
        .then(res => {
          let status = res.data.status.replaceAll("_", " ").split(":")[0];
          setFactcheckLoading(false);
          setFactcheckStatus(status);
        })
        .catch(err => {
          setFactcheckLoading(false);
          setFactcheckError(err?.response?.data?.message || err?.message || 'An error occurred');
        });
    }
  };

  useEffect(() => {
    setOutlineComplete(outlineStatus === 'completed');
    setPostComplete(postStatus === 'Complete');
    setFactcheckComplete(factcheckStatus === 'completed');
  }, [outlineStatus, postStatus, factcheckStatus]);

  const addLiveUrlClickHandler = (e) => {
    e.preventDefault();
    if (addLiveUrlHandler) {
      addLiveUrlHandler();
    }
  }



  useEffect(() => {
    let factcheckInterval;
    if (!factcheckComplete) {
      fetchFactcheckStatusData();
      factcheckInterval = setInterval(() => {
        fetchFactcheckStatusData();
      }, 60000);
    }
    return () => {
      if (factcheckInterval) {
        clearInterval(factcheckInterval);
      }
    };
  }, [factcheckComplete]);



  const generatePostClickHandler = (e) => {
    e.preventDefault();
    onGeneratePost();
  }
  return (
    <div className="row d-flex align-items-center justify-content-end g-0 ">
      <div className="col-auto d-flex align-items-center">
        {outlineComplete ?
          <>
            <strong className="text-primary">Outline</strong>
            <span className="badge rounded-pill  ms-1 p-1 bg-success"><i className="bi bi-check-lg text-white"></i></span>
          </>
          : outlineError ?
            <>
              <strong className="text-primary me-2">Outline Generation Error</strong> {outlineError}
            </>
            : outlineStatus ?
              <>
                <strong className="text-primary me-2">Outline Status</strong> {keyToLabel(outlineStatus)}
              </>
              : <strong className="text-primary">Outline</strong>
        }
      </div>
      {
        postStatus ? <div className="col-auto d-flex align-items-center">
          <i className="bi bi-chevron-right mx-2" />
          {postComplete ?
            <>
              <strong className="text-primary">Post</strong>
              <span className="badge rounded-pill ms-1 p-1 bg-success"><i className="bi bi-check-lg text-white"></i></span>
            </>
            :
            <>
              <strong className="text-primary me-2">Post Status</strong> {keyToLabel(postStatus)}
            </>
          }
        </div>
          :
          onGeneratePost ?
            <div className="col-auto d-flex align-items-center">
              <i className="bi bi-chevron-right mx-2" />
              <div>
                <a title="Generate Post" className="text-warning my-0" onClick={generatePostClickHandler}>Generate Post</a>
              </div>
            </div>
            : null
      }
      {(type === ContentType.POST && !live_post_url && postComplete) && <div className="col-auto d-flex align-items-center">
        <i className="bi bi-chevron-right mx-2" />
        <>

          <a onClick={addLiveUrlClickHandler} className="text-warning my-0 py-0"><i className="bi bi-plus" />Add Live Url</a>
        </>
      </div>
      }
      {(type === ContentType.POST && live_post_url && postComplete) &&
        <div className="col-auto d-flex align-items-center">
          <i className="bi bi-chevron-right mx-2" />
          <strong className="text-primary">Live</strong>
          <span className="badge rounded-pill ms-1 p-1 bg-success"><i className="bi bi-check-lg text-white"></i></span>
        </div>
      }
      {
        factcheckStatus && <div className="col-auto d-flex align-items-center ">
          <i className="bi bi-chevron-right mx-2" />
          {factcheckComplete ?
            <>
              <strong className="text-primary">Fact Check</strong>
              <span className="badge rounded-pill ms-1 p-1 bg-success"><i className="bi bi-check-lg text-white"></i></span>
            </>
            :
            <>
              <strong className="text-primary me-2">Fact Check Status</strong> <TypeWriterText withBlink string={keyToLabel(factcheckStatus)} />
            </>
          }
        </div>
      }
      {live_post_url && <> {index_status ?
        <div className="col-auto d-flex align-items-center ">
          <i className="bi bi-chevron-right mx-2" />
          <strong className="text-primary">Indexed</strong>
          <span className="badge rounded-pill ms-1 p-1 bg-success"><i className="bi bi-check-lg text-white"></i></span>
        </div>
        :
        <div className="col-auto d-flex align-items-center ">
          <i className="bi bi-chevron-right mx-2" />
          <a onClick={indexHandler} className="text-warning my-0 py-0">Index Post</a>
        </div>}
      </>
      }
    </div>
  )
}
export default StatusBar