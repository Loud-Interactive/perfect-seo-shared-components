import { PostProps } from "@/perfect-seo-shared-components/data/types";
import axiosInstance from "@/perfect-seo-shared-components/utils/axiosInstance";
import { useEffect, useState } from "react";

interface IndexModalProps {
  post: PostProps;
  onClose: () => void;
  setLocalPost: (post: PostProps) => void;
}

const IndexModal = ({ post, onClose, setLocalPost }: IndexModalProps) => {

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const clickHandler = (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false)

    axiosInstance.post('/api/index-url', { url: post.live_post_url, contentPlanOutlineGuid: post.content_plan_outline_guid })
      .then(res => {
        setSuccess(true)
        setLoading(false)
      })
      .catch(err => {
        setLoading(false)
      })
  }

  useEffect(() => {
    console.log(post)
  }, [post])

  return (
    <div className="card p-3">
      Index Modal
      <p>{post.live_post_url}</p>
      {success &&
        <p>
          Indexed Properly
        </p>
      }
      <div>
        <button className="btn btn-primary" disabled={loading} onClick={clickHandler}>{loading ? 'Indexing' : 'Index'}</button>
      </div>
    </div>
  )
}

export default IndexModal