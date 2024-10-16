import { getPostStatus } from "@/perfect-seo-shared-components/services/services";
import { useEffect, useState } from "react";
import TypeWriterText from "../TypeWriterText/TypeWriterText";
import { IncomingPlanItemResponse } from "../BulkContentGenerator/BulkContentGenerator";

interface PostUploadItem {
  additional_data_URL?: string;
  brand_name?: string
  custom_outline?: string
  domain_name: string
  email: string;
  excluded_topics?: string;
  outline_post_title?: string
  outline_section1_headline?: string
  outline_section1_subheadline1?: string
  outline_section1_subheadline2?: string
  outline_section1_subheadline3?: string
  outline_section1_subheadline4?: string
  outline_section2_headline?: string
  outline_section2_subheadline1?: string
  outline_section2_subheadline2?: string
  outline_section2_subheadline3?: string
  outline_section2_subheadline4?: string
  outline_section3_headline?: string
  outline_section3_subheadline1?: string
  outline_section3_subheadline2?: string
  outline_section3_subheadline3?: string
  outline_section3_subheadline4?: string
  outline_section4_headline?: string
  outline_section4_subheadline1?: string
  outline_section4_subheadline2?: string
  outline_section4_subheadline3?: string
  outline_section4_subheadline4?: string
  outline_section5_headline?: string
  outline_section5_subheadline1?: string
  outline_section5_subheadline2?: string
  outline_section5_subheadline3?: string
  outline_section5_subheadline4?: string
  outline_section6_headline?: string
  outline_section6_subheadline1?: string
  outline_section6_subheadline2?: string
  outline_section6_subheadline3?: string
  outline_section6_subheadline4?: string
  outline_url?: string
  target_keyword?: string
  voice_url?: string;
  writing_language?: string
  status?: string;
  guid?: string;
}

const PostStatusItem = ({ guid, data, deletePost }) => {
  const [status, setStatus] = useState('Processing');
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
              <div className="text-capitalize col-12 col-md-4"><span className="d-md-none text-primary me-1"><strong>Title</strong></span> {item?.title}</div>
              <div className="text-capitalize col-12 col-md-4"><span className="d-md-none text-primary me-1"><strong>Domain</strong></span> {item?.client_domain}</div>
              <div className="col-12 col-md-4 d-flex align-items-center">
                <div className="text-capitalize text-primary"><span className="d-md-none text-primary me-1"><strong>Status</strong></span><TypeWriterText withBlink string={status} /></div>
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