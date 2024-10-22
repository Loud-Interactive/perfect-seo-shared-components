import { getPostStatus } from "@/perfect-seo-shared-components/services/services";
import { useEffect, useState } from "react";
import TypeWriterText from "../TypeWriterText/TypeWriterText";
import { IncomingPlanItemResponse } from "../BulkContentGenerator/BulkContentGenerator";

const PostStatusItem = ({ guid, item, deletePost, idx, loading }) => {
  const [status, setStatus] = useState();
  const [error, setError] = useState(null)


  useEffect(() => {
    if (item?.status) {
      setStatus(item?.status)
    }
  }, [item?.status])


  return (
    <li key={guid} className="card p-3 bg-secondary">
      <div className="row d-flex align-items-center justify-content-between">
        <div className="text-capitalize col-12 col-md-3"><span className="d-md-none text-primary me-1"><strong>Title</strong></span> {item?.title}</div>
        <div className="col-12 col-md-3"><span className="d-md-none text-primary me-1"><strong>Domain</strong></span> {item?.client_domain}</div>
        <div className="col-10 col-md-6 d-flex align-items-center justify-content-end">
          <div className="text-capitalize text-primary text-end"><span className="d-md-none text-primary me-1"><strong>Status</strong></span><TypeWriterText withBlink string={status} /></div>
          {status === 'Complete' && <button disabled={loading} className="btn btn-primary ms-3" onClick={e => {
            e.preventDefault();
            deletePost(idx)
          }}>
            <i className="bi bi-x" /> Remove from Queue
          </button>}
        </div>

      </div>
    </li>
  )
}

export default PostStatusItem