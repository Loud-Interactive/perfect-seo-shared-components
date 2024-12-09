'use client'
import { StatusType } from "@/perfect-seo-shared-components/data/types";
import { fetchOutlineStatus, getFactCheckStatus, getPostStatus } from "@/perfect-seo-shared-components/services/services";
import { useEffect, useState } from "react";

interface StatusBarProps {
  content_plan_outline_guid?: string;
  content_plan_guid?: string
  content_plan_post_guid?: string
  content_plan_factcheck_guid?: string
  content_plan_social_guid?: string
  onEditOutline?: () => void
  onGeneratePost?: () => void
  type: StatusType
}

const StatusBar = ({ content_plan_outline_guid, content_plan_guid, content_plan_post_guid, content_plan_factcheck_guid, content_plan_social_guid, onEditOutline, onGeneratePost, type
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

  let fetchStatus = () => {
    if (content_plan_outline_guid) {
      setOutlineLoading(true);
      fetchOutlineStatus(content_plan_outline_guid)
        .then(res => {
          setOutlineLoading(false);
          setOutlineStatus(res.data.status);
        })
        .catch(err => {
          setOutlineLoading(false);
          setOutlineError(err?.response?.data?.message || err?.message || 'An error occurred');
        });
    }
    if (content_plan_post_guid) {
      setPostLoading(true);
      getPostStatus(content_plan_post_guid)
        .then(res => {
          setPostLoading(false);
          setPostStatus(res.data.status);
        })
        .catch(err => {
          setPostLoading(false);
          setPostError(err?.response?.data?.message || err?.message || 'An error occurred');
        });
    }
    if (content_plan_factcheck_guid) {
      setFactcheckLoading(true);
      getFactCheckStatus(content_plan_factcheck_guid)
        .then(res => {
          setFactcheckLoading(false);
          setFactcheckStatus(res.data.status);
        }
        )
        .catch(err => {
          setFactcheckLoading(false);
          setFactcheckError(err?.response?.data?.message || err?.message || 'An error occurred');
        });
    }
  }

  useEffect(() => {
    if (outlineStatus === 'completed') {
      setOutlineComplete(true);
    }
    if (postStatus === 'Complete') {
      setPostComplete(true);
    }

  }, [outlineStatus, postStatus, factcheckStatus])

  useEffect(() => {
    let interval;
    if (!outlineComplete && !postComplete && !factcheckComplete) {
      fetchStatus();
      interval = setInterval(fetchStatus, 10000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    }
  }, [outlineComplete, postComplete, factcheckComplete, content_plan_factcheck_guid, content_plan_guid, content_plan_outline_guid, content_plan_post_guid, content_plan_social_guid]);

  const onEditOutlineHandler = (e) => {
    e.preventDefault();
    onEditOutline();
  }

  const generatePostClickHandler = (e) => {
    e.preventDefault();
    onGeneratePost();
  }
  return (
    <div className="row d-flex align-items-center justify-content-end g-0 hover-base">
      {(content_plan_outline_guid && onEditOutline) &&
        <div className="col-auto hover-only">
          <a className="text-warning me-2" onClick={onEditOutlineHandler}>
            <i className="bi bi-pencil-fill" /> Edit outline
          </a>
        </div>}
      {
        outlineStatus && <div className="col-auto d-flex align-items-center">
          {outlineComplete ?
            <>
              <strong className="text-primary">Outline</strong>
              <span className="badge rounded-pill  ms-1 p-1 bg-success"><i className="bi bi-check-lg text-white"></i></span>
            </>
            :
            <>
              <strong className="text-primary">Outline Status</strong> {outlineStatus}
            </>
          }
        </div>
      }
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
              <strong className="text-primary">Post Status</strong> {postStatus}
            </>
          }
        </div>
          :
          onGeneratePost ?
            <div className="col-auto d-flex align-items-center">
              <i className="bi bi-chevron-right mx-2" />
              <div>
                <a className="text-warning my-0" onClick={generatePostClickHandler}>Generate Post</a>
              </div>
            </div>
            : null
      }
      {
        factcheckStatus && <div className="col-auto d-flex align-items-center">
          <i className="bi bi-chevron-right mx-2" />
          {factcheckComplete ?
            <>
              <strong className="text-primary">Fact Check</strong>
              <span className="badge rounded-pill ms-1 p-1 bg-success"><i className="bi bi-check-lg text-white"></i></span>
            </>
            :
            <>
              <strong className="text-primary">Fact Check Status</strong> {factcheckStatus}
            </>
          }
        </div>
      }
    </div >
  )
}
export default StatusBar