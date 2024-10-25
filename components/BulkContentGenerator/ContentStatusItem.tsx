import { getPlanStatus, getPostStatus } from "@/perfect-seo-shared-components/services/services";
import { useEffect, useState } from "react";
import TypeWriterText from "../TypeWriterText/TypeWriterText";

const ContentStatusItem = ({ item, deleteContent, idx }) => {
  const [status, setStatus] = useState('Processing');
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { guid } = item;
  const pullStatus = () => {
    getPlanStatus(guid).then(res => {
      if (res.data?.status) {
        console.log(res.data)
        setStatus(res.data.status)
      } else {
        if (res.data[0]?.error) {
          setError(res.data[0]?.error)
        }
      }

    })
      .catch(err => {
        console.log(err)
        setError(err.response.data.message)
      })
  }

  useEffect(() => {
    let interval;
    if (guid && status !== "Finished") {
      pullStatus()
      interval = setInterval(() => {
        pullStatus()
      }, 5000)
    }
    return () => clearInterval(interval)

  }, [guid, status])

  return (
    <li className="card p-3 bg-secondary">
      <div className="row d-flex align-items-center justify-content-between">
        {error ?
          <div className="text-capitalize text-warning col-12"><TypeWriterText withBlink string={error} /></div>
          :
          <>
            <div className="text-capitalize col-12 col-md-4"><span className="d-md-none text-primary me-1"><strong>Keyword</strong></span> {item?.target_keyword}</div>
            <div className=" col-12 col-md-4"><span className="d-md-none text-primary me-1"><strong>Domain</strong></span> {item?.domain_name}</div>
            <div className="col-12 col-md-4 d-flex align-items-center justify-content-end">
              <div className="text-capitalize text-primary"><span className="d-md-none text-primary me-1"><strong>Status</strong></span><TypeWriterText withBlink string={status} /></div>
              {status === 'Complete' && <button disabled={loading} className="btn btn-primary ms-3" onClick={e => {
                e.preventDefault();
                deleteContent(idx)
              }}>
                <i className="bi bi-x" /> Remove from Queue
              </button>}
            </div></>}
      </div>
    </li>
  )
}

export default ContentStatusItem