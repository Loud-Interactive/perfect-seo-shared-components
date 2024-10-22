import { getPlanStatus, getPostStatus } from "@/perfect-seo-shared-components/services/services";
import { useEffect, useState } from "react";
import TypeWriterText from "../TypeWriterText/TypeWriterText";

const ContentStatusItem = ({ guid, deleteContent }) => {
  const [status, setStatus] = useState('Processing');
  const [item, setItem] = useState<any>(null);
  const [error, setError] = useState(null)

  const pullStatus = () => {
    getPlanStatus(guid).then(res => {
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
    if (guid && !error && status !== "Finished") {
      pullStatus()
      interval = setInterval(() => {
        pullStatus()
      }, 5000)
    }
    return () => clearInterval(interval)

  }, [guid, error, status])

  return (
    <li key={guid} className="card p-3 bg-secondary">
      <div className="d-flex align-items-center justify-content-between">
        <div className="row d-flex align-items-center justify-content-between">
          {error ?
            <div className="text-capitalize text-warning col-12"><TypeWriterText withBlink string={error} /></div>
            :
            <>
              <div className="text-capitalize col-12 col-md-4"><span className="d-md-none text-primary me-1"><strong>Keyword</strong></span> {item?.target_keyword}</div>
              <div className="text-capitalize col-12 col-md-4"><span className="d-md-none text-primary me-1"><strong>Domain</strong></span> {item?.domain_name}</div>
              <div className="col-12 col-md-4 d-flex align-items-center">
                <div className="text-capitalize text-primary"><span className="d-md-none text-primary me-1"><strong>Status</strong></span><TypeWriterText withBlink string={status} /></div>
              </div></>}
        </div>
        <div>
          <button className="btn btn-primary" onClick={e => {
            e.preventDefault();
            deleteContent(guid)
          }}>
            <i className="bi bi-trash pt-1" />
          </button>
        </div>
      </div>
    </li>
  )
}

export default ContentStatusItem