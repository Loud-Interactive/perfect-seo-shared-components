import { getPostStatus } from "@/perfect-seo-shared-components/services/services";
import { useEffect, useState } from "react";
import TypeWriterText from "../TypeWriterText/TypeWriterText";
import { IncomingPlanItemResponse } from "../BulkContentGenerator/BulkContentGenerator";

const PostStatusItem = ({ guid, data, deletePost, idx }) => {
  const [status, setStatus] = useState();
  const [item, setItem] = useState<any>(null);
  const [error, setError] = useState(null)

  const pullStatus = () => {
    getPostStatus(guid).then(res => {
      setStatus(res.data.status)
      setItem(res.data)
    })
      .catch(err => {
        console.log(err)
        setError(err.response.data.message)
      })
  }

  useEffect(() => {
    let interval;
    if (guid && !error) {
      console.log
      pullStatus()
      interval = setInterval(() => {
        pullStatus()
      }, 5000)
    }
    return () => clearInterval(interval)

  }, [guid, error, status])

  useEffect(() => {
    if (data?.status) {
      setStatus(data?.status)
    }
  }, [data?.status])

  if (status === 'draft') return (
    <li key={guid} className="card p-3 bg-secondary">
      <div className="d-flex align-items-center justify-content-between">
        <div className="row d-flex align-items-center justify-content-between">
          {error ?
            <div className="text-capitalize text-warning col-12"><TypeWriterText withBlink string={error} /></div>
            :
            <>
              <div className="text-capitalize col-12 col-md-4"><span className="d-md-none text-primary me-1"><strong>Title</strong></span> {item?.title}</div>
              <div className="text-capitalize col-12 col-md-4"><span className="d-md-none text-primary me-1"><strong>Domain</strong></span> {item?.client_domain}</div>
              <div className="col-12 col-md-4 d-flex align-items-center">
                <div className="text-capitalize text-primary"><span className="d-md-none text-primary me-1"><strong>Status</strong></span><TypeWriterText withBlink string={status} /></div>
              </div></>}
        </div>
        <div>
          <button className="btn btn-primary" onClick={e => {
            e.preventDefault();
            deletePost(idx)
          }}>
            <i className="bi bi-trash pt-1" />
          </button>
        </div>
      </div>
    </li>
  )

  return (
    <li key={guid} className="card p-3 bg-secondary">
      <div className="d-flex align-items-center justify-content-between">
        <div className="row d-flex align-items-center justify-content-between">
          {error ?
            <div className="text-capitalize text-warning col-12"><TypeWriterText withBlink string={error} /></div>
            :
            <>
              <div className="text-capitalize col-12 col-md-4"><span className="d-md-none text-primary me-1"><strong>Title</strong></span> {item?.title}</div>
              <div className="text-capitalize col-12 col-md-4"><span className="d-md-none text-primary me-1"><strong>Domain</strong></span> {item?.client_domain}</div>
              <div className="col-12 col-md-4 d-flex align-items-center">
                <div className="text-capitalize text-primary"><span className="d-md-none text-primary me-1"><strong>Status</strong></span><TypeWriterText withBlink string={status} /></div>
              </div></>}
        </div>
        <div>
          <button className="btn btn-primary" onClick={e => {
            e.preventDefault();
            deletePost(idx)
          }}>
            <i className="bi bi-trash pt-1" />
          </button>
        </div>
      </div>
    </li>
  )
}

export default PostStatusItem