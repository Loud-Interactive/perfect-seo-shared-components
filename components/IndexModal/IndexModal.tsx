import { PostProps } from "@/perfect-seo-shared-components/data/types";
import axiosInstance from "@/perfect-seo-shared-components/utils/axiosInstance";
import { useEffect, useState } from "react";

interface IndexModalProps {
  post: PostProps;
  onClose: () => void;
}

const IndexModal = ({ post, onClose }: IndexModalProps) => {

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const clickHandler = (e) => {
    setErrorMessage(undefined)
    e.preventDefault();
    setLoading(true);
    setSuccess(false)
    let reqObj = { url: post.live_post_url, contentPlanOutlineGuid: post.content_plan_outline_guid, reindex: false }
    if (post?.index_status) {
      reqObj.reindex = true
    }
    axiosInstance.post('/api/index-url', reqObj)
      .then(res => {
        setSuccess(true)
        setLoading(false)
      })
      .catch(err => {
        setErrorMessage(err.response.data.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    setSuccess(false)
  }, [post])

  return (
    <div className="card p-5">
      <h3 className="mb-3">Index Modal</h3>
      <div>
        {!success ? <>
          <p>{post?.index_status ? 'Post has already been indexed. Would you like to reindex?' : 'Would you like to index this post?'}
          </p>
          <p>
            <strong>URL</strong><br />
            <a href={post.live_post_url} target="_blank">{post.live_post_url}</a>
          </p>
        </>
          :
          <p>Your post has been succesfully indexed!
          </p>
        }
        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
        {success ?
          <div className="mt-3">
            <button className="btn btn-primary" disabled={loading} onClick={onClose}>close</button>
          </div>
          : <div className="mt-3">
            <button className="btn btn-primary" disabled={loading} onClick={clickHandler}>{loading ? 'Indexing...' : 'Index'}</button>
          </div>}
      </div>
    </div>
  )
}

export default IndexModal