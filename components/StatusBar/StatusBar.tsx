'use client'
import { ContentType } from "@/perfect-seo-shared-components/data/types";
import { fetchOutlineStatus, getFactCheckStatus, getPostStatus } from "@/perfect-seo-shared-components/services/services";
import { useEffect, useState } from "react";
import TypeWriterText from "../TypeWriterText/TypeWriterText";
import { keyToLabel } from "@/perfect-seo-shared-components/utils/conversion-utilities";
import useStatus from "@/perfect-seo-shared-components/hooks/useStatus";
// import useStatus from "@/perfect-seo-shared-components/hooks/useStatus";

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
}

const StatusBar = ({
  content_plan_outline_guid,
  addLiveUrlHandler,
  live_post_url,
  onGeneratePost,
  indexHandler,
  index_status,
  type
}: StatusBarProps) => {


  const { status, isComplete, resetStatus, data, error } = useStatus(content_plan_outline_guid);
  const { outline: outlineStatus, post: postStatus, factcheck: factcheckStatus } = status;
  const { outline: outlineComplete, post: postComplete, factcheck: factcheckComplete } = isComplete;
  const { outline: outlineError, post: postError, factcheck: factcheckError } = error;


  const addLiveUrlClickHandler = (e) => {
    e.preventDefault();
    if (addLiveUrlHandler) {
      addLiveUrlHandler();
    }
  }


  const generatePostClickHandler = (e) => {
    e.preventDefault();
    onGeneratePost();
  }
  return (
    <div className="row d-flex align-items-center justify-content-end g-0 ">
      {outlineStatus && <div className="col-auto d-flex align-items-center">
        {outlineComplete ?
          <>
            <strong className="text-primary">Outline</strong>
            <span className="badge rounded-pill  ms-1 p-1 bg-success"><i className="bi bi-check-lg text-white"></i></span>
          </>
          : outlineError ?
            <>
              <strong className="text-primary me-2">Outline Generation Error</strong> {outlineError}
            </>
            :
            <>
              <strong className="text-primary me-2">Outline Status</strong> {keyToLabel(outlineStatus)}
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