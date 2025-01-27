import { PostProps } from "@/perfect-seo-shared-components/data/types";
import axiosInstance from "@/perfect-seo-shared-components/utils/axiosInstance";
import { useEffect } from "react";

interface IndexModalProps {
  post: PostProps;
  onClose: () => void;
  setLocalPost: (post: PostProps) => void;
}

const IndexModal = ({ post, onClose, setLocalPost }: IndexModalProps) => {

  const clickHandler = (e) => {
    e.preventDefault();

    axiosInstance.post('/api/index-url', { url: post.live_post_url })
      .then(res => console.log(res))
      .catch(err => {
        alert(err.message)
      })
  }

  return (
    <div className="card p-3">
      Index Modal
      <p>{post.live_post_url}</p>
      <button className="btn btn-primary" onClick={clickHandler}>Index</button>
    </div>
  )
}

export default IndexModal