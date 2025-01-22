import { PostProps } from "@/perfect-seo-shared-components/data/types";
import axiosInstance from "@/perfect-seo-shared-components/utils/axiosInstance";
import { useEffect } from "react";

interface IndexModalProps {
  post: PostProps;
  onClose: () => void;
  setLocalPost: (post: PostProps) => void;
  refresh: () => void;
}

const IndexModal = ({ post, onClose, setLocalPost, refresh }: IndexModalProps) => {

  const clickHandler = (e) => {
    e.preventDefault();
    let access_token = sessionStorage.getItem('access_token')

    axiosInstance.post('/api/index-url', { url: post.live_post_url, access_token })
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