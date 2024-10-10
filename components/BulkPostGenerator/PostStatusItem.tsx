import { getPostStatus } from "@/perfect-seo-shared-components/services/services";
import { useEffect, useState } from "react";
import TypeWriterText from "../TypeWriterText/TypeWriterText";

const PostStatusItem = ({ guid }) => {
  const [status, setStatus] = useState('Processing');
  const [item, setItem] = useState<any>(null);

  const pullStatus = () => {
    getPostStatus(guid).then(res => {
      setStatus(res.data.status)
      console.log(res.data)
      setItem(res.data)
    })
  }

  useEffect(() => {
    let interval;
    if (guid) {
      pullStatus()
      interval = setInterval(() => {
        pullStatus()
      }, 5000)
    }
    return () => clearInterval(interval)

  }, [guid])

  return (
    <li key={guid} className="card p-3 bg-secondary">
      <div className="row d-flex align-items-center justify-content-between">
        <div className="capitalize col-12 col-md-4"> {item?.title}</div>
        <div className="capitalize col-12 col-md-4"> {item?.client_domain}</div>  <div className="capitalize col-12 col-md-4 text-primary"><TypeWriterText withBlink string={status} /></div>
      </div>
    </li>
  )
}

export default PostStatusItem