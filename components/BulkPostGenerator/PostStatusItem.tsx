import { getPostStatus } from "@/perfect-seo-shared-components/services/services";
import { useEffect, useState } from "react";
import TypeWriterText from "../TypeWriterText/TypeWriterText";

const PostStatusItem = ({ guid, deletePost }) => {
  const [status, setStatus] = useState('Processing');
  const [item, setItem] = useState<any>(null);
  const [error, setError] = useState(null)

  const pullStatus = () => {
    getPostStatus(guid).then(res => {
      setStatus(res.data.status)
      console.log(res.data)
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
      pullStatus()
      interval = setInterval(() => {
        pullStatus()
      }, 5000)
    }
    return () => clearInterval(interval)

  }, [guid, error])

  return (
    <li key={guid} className="card p-3 bg-secondary">
      <div className="d-flex align-items-center justify-content-between">
        <div className="row d-flex align-items-center justify-content-between">
          {error ?
            <div className="text-capitalize text-warning col-12"><TypeWriterText withBlink string={error} /></div>
            :
            <>
              <div className="text-capitalize col-12 col-md-4"> {item?.title}</div>
              <div className="text-capitalize col-12 col-md-4"> {item?.client_domain}</div>
              <div className="col-12 col-md-4 d-flex align-items-center">
                <div className="text-capitalize text-primary"><TypeWriterText withBlink string={status} /></div>
              </div></>}
        </div>
        <div>
          <button className="btn btn-primary" onClick={e => {
            e.preventDefault();
            deletePost(guid)
          }}>
            <i className="bi bi-trash pt-1" />
          </button>
        </div>
      </div>
    </li>
  )
}

export default PostStatusItem