import { useEffect, useState } from "react"
import TextInput from "../Form/TextInput"
import { emailValidator } from "@/perfect-seo-shared-components/utils/validators"
import { deleteContentOutline, updateLiveUrl } from "@/perfect-seo-shared-components/services/services"
import moment from "moment-timezone"
import TypeWriterText from "../TypeWriterText/TypeWriterText"
import Link from "next/link"
import * as Modal from '@/perfect-seo-shared-components/components/Modal/Modal'


const PostItem = ({ post, key }) => {
  const [liveUrl, setLiveUrl] = useState(post?.live_post_url)
  const [status, setStatus] = useState(post?.status)
  const [localPost, setLocalPost] = useState(post)
  const [urlError, setUrlError] = useState(null)
  const [deleteModal, setDeleteModal] = useState(false)
  const [showUrl, setShowUrl] = useState(false)
  const liveUrlUpdate = (e) => {
    if (new RegExp(emailValidator.toString()).test(e.target.value)) {
      if (localPost?.live_post_url !== e.target.value) {
        updateLiveUrl(localPost?.content_plan_outline_guid, e.target.value)
          .then(res => {
            console.log(res.data)
            let newData = { ...localPost }
            newData.live_post_url = e.target.value;
            setLocalPost(newData)
          })

      }
    }
    else {
      setUrlError("Please enter a valid url")
    }
  }

  useEffect(() => {
    if (post?.live_post_url !== liveUrl) {
      setLiveUrl(post?.live_post_url)
      setShowUrl(true)
    }
    if (post?.status !== status) {
      setStatus(post?.status)
    }
  }, [post])

  const docClickHandler = (e) => {
    e.preventDefault();
    window.open(localPost?.google_doc_link, '_blank')
  }
  const htmlClickHandler = (e) => {
    e.preventDefault();
    window.open(localPost?.html_link, '_blank')
  }
  const deleteClickHandler = (e) => {
    e.preventDefault()
    setDeleteModal(true)
  }


  const deleteHandler = () => {
    deleteContentOutline(localPost?.content_plan_outline_guid)
      .then(res => {
        console.log(res)
        setDeleteModal(false)
      })
      .catch(err => {
        console.log(err)
      })
  }
  return (
    <div className="card bg-secondary p-3" key={key} title={post?.title}>
      <div className="row d-flex g-3 align-items-center">
        <div className="col-12 col-lg-6">
          <div className="row g-3">
            <div className="col-12">
              {localPost?.title}
            </div>
            <div className="col-12">
              {showUrl || localPost?.live_post_url ?
                <><TextInput
                  bottomSpacing={false} fieldName="live-url" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} onBlur={liveUrlUpdate} label="Live Post Url" />
                  {urlError && <div className="text-danger">{urlError}</div>}
                </>
                :
                <a onClick={(e) => { e.preventDefault(); setShowUrl(true) }} className="text-primary">Add Live Post Url</a>
              }
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className='row g-0 d-flex justify-content-end'>
            <div className="col-12 d-flex justify-content-end mb-3">
              <strong className="text-primary me-2">Created on</strong> {moment(localPost?.created_at).format("MMMM Do, 'YY hA")}
            </div>
            {(post?.google_doc_link && post?.html_link) &&
              <>
                <div className="col-auto">
                  <a
                    onClick={htmlClickHandler}

                    className="btn btn-primary standard-button"

                  >
                    <i className="bi bi-filetype-html" /> HTML
                  </a>
                </div>
                <div className="col-auto pe-0">
                  <a
                    onClick={docClickHandler}

                    className="btn btn-primary standard-button ms-1"

                  >
                    <i className="bi bi-filetype-doc me-2" /> Google Docs
                  </a>
                </div>
              </>}
            <>
              <div className="col-auto text-end px-0">
                <Link
                  href={`https://contentPerfect.ai/dashboard/${localPost?.content_plan_guid}`}
                  className="btn btn-primary standard-button ms-1"
                >
                  View Content Plan
                </Link>
              </div>
              {localPost?.live_post_url && <div className="col-auto text-end px-0">
                <Link
                  href={localPost?.live_post_url}
                  className="btn btn-primary standard-button ms-1"
                  target="_blank"
                >
                  View Live Post
                </Link>
              </div>}
              <div className='col-auto'>
                <button className='btn btn-warning d-flex align-items-center justify-content-center ms-1 standard-button' onClick={deleteClickHandler} title={`View GUID: ${localPost?.guid}`}><i className="bi bi-trash pt-1" /></button>
              </div>
              {localPost?.status !== "Complete" && <div className='col-12 text-end text-primary px-0'>
                <TypeWriterText string={status} withBlink />
              </div>}
            </>
          </div>
        </div>
      </div>
      <Modal.Overlay open={deleteModal} onClose={() => { setDeleteModal(null) }}>
        <Modal.Title title="Delete Plan" />
        <Modal.Description>
          Are you sure you want to delete this post?
          <div className='d-flex justify-content-between mt-5'>
            <button onClick={() => { setDeleteModal(null) }} className="btn btn-warning">Cancel</button>
            <button onClick={(e) => { e.preventDefault(); deleteHandler() }} className="btn btn-primary">Yes</button>
          </div>
        </Modal.Description>
      </Modal.Overlay>
    </div>

  )
}

export default PostItem