import { useEffect, useState } from "react"
import TextInput from "../Form/TextInput"
import { emailValidator } from "@/perfect-seo-shared-components/utils/validators"
import { deleteContentOutline, getPostStatus, updateLiveUrl } from "@/perfect-seo-shared-components/services/services"
import moment from "moment-timezone"
import TypeWriterText from "../TypeWriterText/TypeWriterText"
import Link from "next/link"
import * as Modal from '@/perfect-seo-shared-components/components/Modal/Modal'
import { urlSanitization } from "@/perfect-seo-shared-components/utils/conversion-utilities"


const PostItem = ({ post, key }) => {
  const [liveUrl, setLiveUrl] = useState(post?.live_post_url)
  const [status, setStatus] = useState(post?.status)
  const [localPost, setLocalPost] = useState(post)
  const [urlError, setUrlError] = useState(null)
  const [deleteModal, setDeleteModal] = useState(false)
  const [showUrl, setShowUrl] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const liveUrlUpdate = () => {
    setSaved(false)
    setUrlError(null)
    if (new RegExp(emailValidator.toString()).test(liveUrl)) {
      setSaving(true)
      if (localPost?.live_post_url !== liveUrl) {
        updateLiveUrl(localPost?.content_plan_outline_guid, liveUrl)
          .then(() => {
            let newData = { ...localPost }
            newData.live_post_url = liveUrl;
            setLocalPost(newData)
            setSaving(false)
            setSaved(true)
          })
          .catch(err => {
            console.log("error", err)
            setSaving(false)
          }
          )

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

  const fetchStatus = () => {
    getPostStatus(post?.content_plan_outline_guid)
      .then((res) => {
        if (res.data.status) {
          if (res.data.status !== status) {
            setStatus(res.data.status);
          }
          else if (completedStatus.includes(res.data.status)) {
            setLocalPost(res.data)
          }
        }
        else if (res.data.message) {
          setStatus(res.data.message);
        }
      })
      .catch((err) => {
        console.log(err, post["Post Title"]);
        setStatus(err.message);
      });
  }


  const completedStatus = ["Complete", "Uploaded To Google Drive", "Uploading To Google Drive"]

  useEffect(() => {
    let interval;
    if (completedStatus.includes(status)) {
      return;
    }
    else {
      interval = setInterval(() => {
        fetchStatus()
      }, 10000)
    }
    return () => clearTimeout(interval)
  }, [status])

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

  const URLSaveButton = () => {
    if (liveUrl) {
      return (
        <div className="d-flex h-100 align-items-center justify-content-center">
          <button className="btn btn-transparent d-flex align-items-center justify-content-center" onClick={(e => { setLiveUrl(null) })} title="Clear Live Url"><i className="bi bi-x-circle" /></button>
          <button className="btn btn-transparent d-flex align-items-center justify-content-center" onClick={liveUrlUpdate} title="Save Live Url" disabled={saving}>

            {saving ?
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div> : saved ? <i className="bi bi-check-circle-fill" /> : <i className="bi bi-floppy-fill" />}</button>
        </div>
      )
    }
    else return null
  }

  const deleteHandler = () => {
    deleteContentOutline(localPost?.content_plan_outline_guid)
      .then(res => {
        setDeleteModal(false)
      })
      .catch(err => {
        console.log(err)
      })
  }
  return (
    <div className="card bg-secondary p-3" key={key} title={post?.title}>
      <div className="row d-flex g-5 align-items-end">
        <div className="col-12 col-lg-6">
          <div className="row g-3">
            <div className="col-12">
              <strong className="text-primary me-1">Title</strong>  {localPost?.title}
            </div>
            <div className="col-12">
              {showUrl || localPost?.live_post_url ?
                <><TextInput
                  bottomSpacing={false} fieldName="live-url" value={liveUrl} onChange={(e) => { setSaved(false); setLiveUrl(e.target.value) }} label="Live Post Url" button={<URLSaveButton />} />
                  {urlError && <div className="text-danger">{urlError}</div>}
                </>
                :
                <a onClick={(e) => { e.preventDefault(); setShowUrl(true) }} className="text-primary">Add Live Post URL</a>
              }
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className='row g-0 d-flex'>
            <div className="col-12 d-flex justify-content-start mb-1">
              <strong className="text-primary me-2">Created on</strong> {moment(`${localPost?.created_at}Z`).local().format("dddd, MMMM Do, YYYY h:mma")}
            </div>
            {(post?.google_doc_link && post?.html_link) &&
              <>
                <div className="col">
                  <a
                    onClick={htmlClickHandler}

                    className="btn btn-primary standard-button d-flex justify-content-center align-items-center"

                  >
                    <i className="bi bi-filetype-html me-2" /> HTML
                  </a>
                </div>
                <div className="col">
                  <a
                    onClick={docClickHandler}

                    className="btn btn-primary standard-button d-flex justify-content-center align-items-center ms-1"

                  >
                    <i className="bi bi-filetype-doc me-2" /> Google Docs
                  </a>
                </div>
              </>}
            {localPost?.live_post_url && <>
              <div className="col">
                <a
                  href={`https://app.ahrefs.com/v2-site-explorer/organic-keywords?columns=CPC%7C%7CKD%7C%7CLastUpdated%7C%7COrganicTraffic%7C%7CPaidTraffic%7C%7CPosition%7C%7CPositionHistory%7C%7CSERP%7C%7CSF%7C%7CURL%7C%7CVolume&compareDate=dontCompare&country=us&currentDate=today&keywordRules=&limit=100&mode=prefix&offset=0&positionChanges=&serpFeatures=&sort=Volume&sortDirection=desc&target=${encodeURI(localPost?.live_post_url.replace("https://", '').replace("http://", "").replace("www.", ""))}%2F&urlRules=&volume_type=average`}
                  target="_blank"
                  className="btn btn-primary standard-button d-flex justify-content-center align-items-center ms-1"

                >
                  Ahrefs URL
                </a>
              </div>
              <div className="col">
                <a
                  href={`https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain%3A${urlSanitization(localPost?.live_post_url)}&hl=en&page=*${encodeURI(localPost?.live_post_url)}`}
                  target="_blank"
                  className="btn btn-primary standard-button d-flex justify-content-center align-items-center ms-1"

                >
                  GSC Report
                </a>
              </div>
            </>}
            <>
              <div className="col">
                <Link
                  href={`https://contentPerfect.ai/dashboard/${localPost?.content_plan_guid}`}
                  className="btn btn-primary standard-button d-flex justify-content-center align-items-center ms-1"
                >
                  View Content Plan
                </Link>
              </div>
              <div className='col-auto'>
                <button className='btn btn-warning ms-1 standard-button d-flex justify-content-center align-items-center' onClick={deleteClickHandler} title={`View GUID: ${localPost?.guid}`}><i className="bi bi-trash pt-1" /></button>
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