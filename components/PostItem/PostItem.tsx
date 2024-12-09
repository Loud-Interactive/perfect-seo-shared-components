'use client'
import { useEffect, useState } from "react"
import TextInput from "../Form/TextInput"
import { urlValidator } from "@/perfect-seo-shared-components/utils/validators"
import { deleteContentOutline, getPostStatus, regeneratePost, updateLiveUrl } from "@/perfect-seo-shared-components/services/services"
import moment from "moment-timezone"
import TypeWriterText from "../TypeWriterText/TypeWriterText"
import * as Modal from '@/perfect-seo-shared-components/components/Modal/Modal'
import { urlSanitization } from "@/perfect-seo-shared-components/utils/conversion-utilities"
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useDispatch, useSelector } from "react-redux"
import { addToast, selectEmail, selectIsAdmin } from "@/perfect-seo-shared-components/lib/features/User"
import CreateContentModal from "../CreateContentModal/CreateContentModal"
import { createClient } from "@/perfect-seo-shared-components/utils/supabase/client"
import en from '@/assets/en.json'
import RegeneratePostModal, { GenerateTypes } from "../RegeneratePostModal/RegeneratePostModal"
import { QueueItemProps, StatusType } from "@/perfect-seo-shared-components/data/types"
import Form from "../Form/Form"
import useForm from "@/perfect-seo-shared-components/hooks/useForm"
import FactCheckModal from "../FactCheckModal/FactCheckModal"
import FactCheckResultPage from "../FactCheckResultPage/FactCheckResultPage"
import StatusBar from "../StatusBar/StatusBar"

interface PostItemProps {
  post: any,
  refresh: () => void
  domain_name?: string
}

const PostItem = ({ post, refresh, domain_name }: PostItemProps) => {
  const email = useSelector(selectEmail)
  const [liveUrl, setLiveUrl] = useState(post?.live_post_url)
  const [status, setStatus] = useState(post?.status)
  const [localPost, setLocalPost] = useState(post)
  const [deleteModal, setDeleteModal] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [regenerateError, setRegerateError] = useState(null)
  const [editOutline, setEditOutline] = useState(false)
  const [showRegeneratePost, setShowRegeneratePost] = useState(false)
  const [showFactCheck, setShowFactCheck] = useState(null)
  const [showLivePost, setShowLivePost] = useState(false)
  const isAdmin = useSelector(selectIsAdmin)
  const dispatch = useDispatch()
  const form = useForm()

  const saveLiveUrl = () => {
    let url = liveUrl
    if (url) {
      if (form.validate({ requiredFields: ['live_url'], validatorFields: ['live_url'] })) {
        updateLiveUrl(localPost.content_plan_outline_guid, url || '')
          .then(res => {
            setLocalPost({ ...localPost, live_post_url: url })
            setShowLivePost(false)
          })
      }

    }

  }

  const liveUrlChangeHandler = (e) => {
    setLiveUrl(e.target.value)
  }

  useEffect(() => {
    console.log(post)
    if (post?.status !== status) {
      setStatus(post?.status)
      if (completedStatus.includes(post?.status)) {
        if (!completed) {
          setCompleted(true)
        }
      }
    }
  }, [post, completed])

  const fetchStatus = () => {
    getPostStatus(post?.content_plan_outline_guid)
      .then((res) => {
        if (res.data.status) {
          if (res.data.status !== status) {
            setStatus(res.data.status);
            setLocalPost(res.data)
          }
          else if (completedStatus.includes(res.data.status)) {
            setStatus(res.data.status)
            if (!completed) {
              setCompleted(true)
            }
            setLocalPost(res.data)
          }
        }
        else if (res.data.message) {
          setStatus(res.data.message);
        }
      })
      .catch((err) => {
        setStatus(err.message);
      });
  }


  const completedStatus = ["Complete", "Uploaded To Google Drive", "Uploading To Google Drive"]

  useEffect(() => {
    let interval;
    if (completedStatus.includes(status)) {
      if (completed) {
        setCompleted(true)

      }
      else {
        return;
      }
    }
    else if (!editOutline) {
      interval = setInterval(() => {
        fetchStatus()
      }, 10000)
    }
    return () => clearTimeout(interval)
  }, [status, completed, editOutline])

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

  const supabase = createClient()

  const deleteHandler = () => {
    deleteContentOutline(localPost?.content_plan_outline_guid)
      .then(res => {
        let historyItem: any = { guid: localPost?.content_plan_outline_guid, email }
        if (localPost?.title || localPost?.post_title || localPost?.content_plan_outline_title) {
          historyItem.title = localPost?.title || localPost?.post_title || localPost?.content_plan_outline_title
        }
        supabase
          .from('user_history')
          .insert({ email: email, domain: post?.client_domain, transaction_data: historyItem, product: en.product, type: "DELETE", action: "Delete Post" })
          .select('*')
          .then(res => { })
        refresh();
        setDeleteModal(false)
      })
      .catch(err => {
        console.log(err)
      })
  }

  const addToQueue = () => {
    let newObject: QueueItemProps = {
      type: 'post',
      domain: post?.client_domain,
      guid: post?.content_plan_outline_guid,
      email,
      isComplete: status === 'Finished' ? true : false,
    }
    supabase
      .from('user_queues')
      .insert(newObject)
      .select("*")
      .then(res => {
        dispatch(addToast({ title: "Post Added to Watchlist", type: "info", content: `${localPost?.title || localPost?.post_title || localPost?.content_plan_outline_title} added to Watchlist` }))
      })
  }

  const regeneratePostHandler = (receiving_email, writing_language) => {
    setRegerateError(null)
    return regeneratePost(localPost?.content_plan_outline_guid, { receiving_email: receiving_email, email, writing_language }).then(res => {
      let historyItem: any = { guid: localPost?.content_plan_outline_guid, email }
      if (localPost?.title || localPost?.post_title || localPost?.content_plan_outline_title) {
        historyItem.title = localPost?.title || localPost?.post_title || localPost?.content_plan_outline_title
      }
      supabase
        .from('user_history')
        .insert({ email: email, domain: post?.client_domain, transaction_data: historyItem, product: en.product, type: "REGENERATE", action: "Regenerate Post" })
        .select('*')
        .then(res => { })
      return res
    })
      .catch(err => {
        setRegerateError(err.response.data.detail.split(":")[0])
        return err
      })


  }

  const handleEditOutline = (e) => {
    setEditOutline(true)
  }
  const closeHandler = () => {
    setShowFactCheck(false)
    fetchStatus()
  }

  return (
    <div className="card bg-secondary p-3" title={post?.title}>
      <div className="row d-flex g-3 d-flex align-items-end">
        <div className="col">
          <div className="row g-3">
            <div className="col-12">
              <p className="mb-1">
                <small>
                  <strong className="text-primary ">Created on</strong> {moment(`${localPost?.created_at}Z`).local().format("dddd, MMMM Do, YYYY h:mma")}
                  {!localPost?.content_plan_guid && <span className="badge bg-warning ms-2">Bulk</span>}
                </small>
              </p>
              <p className="m-0">  <strong className="text-primary me-1">Title</strong>  {localPost?.title}{(localPost?.writing_language !== 'English' && localPost?.writing_language) && <small>({localPost?.writing_language})</small>}{(localPost.client_domain !== domain_name) ? <span className='badge bg-primary ms-2'>{localPost?.client_name}</span> : email !== localPost.email ? <span><br />generated by <span className="text-primary">{localPost.email}</span></span> : null}
              </p>
              {localPost?.live_post_url && <p className="m-0">  <strong className="text-primary me-1">Live URL</strong>  <a href={localPost?.live_post_url} target="_blank" title="View Live Post"><i className="bi bi-link" /> {localPost?.live_post_url}</a><a className="text-small ms-2 text-primary" onClick={e => { e.preventDefault(); setShowLivePost(true) }} title="Edit URL">Edit URL</a></p>}
            </div>
          </div>
          <div className="col-12 py-3">
            <StatusBar type={StatusType.POST} content_plan_outline_guid={localPost.content_plan_outline_guid} content_plan_guid={localPost?.content_plan_guid} content_plan_post_guid={localPost?.content_plan_outline_guid} content_plan_factcheck_guid={localPost?.factcheck_guid} />
          </div>
        </div>
        <div className="col-12 col-lg-auto">
          <div className='row d-flex justify-content-end'>
            <div className="input-group d-flex justify-content-end">
              {(post?.google_doc_link && post?.html_link) &&
                <>
                  <a
                    onClick={htmlClickHandler}
                    className="btn btn-warning btn-standard"
                    title="HTML File"
                  >
                    <i className="bi bi-filetype-html " />
                  </a>
                  <a
                    onClick={docClickHandler}
                    className="btn btn-warning btn-standard"
                    title="Google Docs"
                  >
                    <i className="bi bi-filetype-doc " />
                  </a>
                </>}
              <button className='btn btn-primary btn-standard d-flex justify-content-center align-items-center' onClick={deleteClickHandler} title={`View GUID: ${localPost?.guid}`}><i className="bi bi-trash pt-1" /></button>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger className="btn btn-warning btn-standard d-flex align-items-center justify-content-center">
                  <i className="bi bi-three-dots-vertical" />
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content align="end" className="bg-primary z-100 card">
                    {isAdmin && <DropdownMenu.Item>
                      <button className="btn btn-transparent w-100" onClick={addToQueue}><i className="material-icons me-2">queue</i>Add to Watchlist</button>
                    </DropdownMenu.Item>}
                    {(localPost?.content_plan_outline_guid && localPost?.content_plan_guid) &&
                      <DropdownMenu.Item>
                        <button className="btn btn-transparent w-100" onClick={handleEditOutline}>
                          Edit Outline
                        </button>
                      </DropdownMenu.Item>}
                    {localPost?.content_plan_guid &&
                      <DropdownMenu.Item>
                        <a
                          href={`https://contentPerfect.ai/contentplan/${localPost?.content_plan_guid}`}
                          target="_blank"
                          className="btn btn-transparent"

                        >
                          View Content Plan
                        </a>
                      </DropdownMenu.Item>}
                    <DropdownMenu.Item>
                      <button className="btn btn-transparent w-100" onClick={() => { setShowRegeneratePost(true) }}>Regenerate Post</button>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item>
                      <button className="btn btn-transparent w-100" onClick={() => { setShowLivePost(true) }}>{localPost?.live_post_url ? 'Edit' : 'Add'} Live Post URL</button>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item>
                      <button
                        onClick={() => { setShowFactCheck(true) }}
                        className="btn btn-transparent w-100"
                      >
                        {localPost?.factcheck_guid ? 'Fact-Check Results' : 'Fact-Check'}
                      </button>
                    </DropdownMenu.Item>
                    {localPost?.live_post_url && <>
                      {/* {localPost?.factcheck_guid ?
                        <DropdownMenu.Item>
                          <a
                            href={`https://factcheckPerfect.ai/fact-checks/${localPost?.factcheck_guid}`}
                            target="_blank"
                            className="btn btn-transparent"

                          >
                            Fact-Check Results
                          </a>
                        </DropdownMenu.Item>
                        : <DropdownMenu.Item>
                          <a
                            href={`https://factcheckPerfect.ai/fact-checks?url=${encodeURI(localPost?.live_post_url)}&post_guid=${localPost?.content_plan_outline_guid}`}
                            target="_blank"
                            className="btn btn-transparent"

                          >
                            Fact-Check Post
                          </a>
                        </DropdownMenu.Item>} */}
                      <DropdownMenu.Item>
                        <a
                          href={`https://socialperfect.ai?url=${encodeURI(localPost?.live_post_url)}`}
                          target="_blank"
                          className="btn btn-transparent"

                        >
                          Generate Social Posts
                        </a>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item>
                        <a
                          href={`https://app.ahrefs.com/v2-site-explorer/organic-keywords?columns=CPC%7C%7CKD%7C%7CLastUpdated%7C%7COrganicTraffic%7C%7CPaidTraffic%7C%7CPosition%7C%7CPositionHistory%7C%7CSERP%7C%7CSF%7C%7CURL%7C%7CVolume&compareDate=dontCompare&country=us&currentDate=today&keywordRules=&limit=100&mode=prefix&offset=0&positionChanges=&serpFeatures=&sort=Volume&sortDirection=desc&target=${encodeURI(localPost?.live_post_url.replace("https://", '').replace("http://", "").replace("www.", ""))}&urlRules=&volume_type=average`}
                          target="_blank"
                          className="btn btn-transparent"
                        >
                          Ahrefs URL
                        </a>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item>
                        <a
                          href={`https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain%3A${urlSanitization(localPost?.live_post_url)}&hl=en&page=*${encodeURI(localPost?.live_post_url)}`}
                          target="_blank"
                          className="btn btn-transparent"

                        >
                          GSC Report
                        </a>
                      </DropdownMenu.Item>
                    </>}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
            {localPost?.status !== "Complete" && <div className='col-12 text-end text-primary mt-2'>
              <TypeWriterText string={status} withBlink />
            </div>}
            {regenerateError && <div className='col-12 text-end text-primary mt-2'>
              <TypeWriterText string={regenerateError} withBlink />
            </div>}
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
      <Modal.Overlay open={editOutline} onClose={() => { setEditOutline(null) }}>
        <CreateContentModal standalone data={localPost} titleChange={() => { }} onClose={() => { setEditOutline(false) }} isAuthorized={true} />
      </Modal.Overlay>
      <Modal.Overlay
        open={showRegeneratePost}
        onClose={() => { setShowRegeneratePost(null); refresh() }}
      >
        <RegeneratePostModal onClose={() => { setShowRegeneratePost(null); }} type={GenerateTypes.REGENERATE} submitHandler={regeneratePostHandler} onSuccess={() => { setShowRegeneratePost(false); refresh() }} />
      </Modal.Overlay >
      <Modal.Overlay closeIcon open={showLivePost} onClose={() => setShowLivePost(false)} className="modal-small">
        <Modal.Title title="Add Live URL" />
        <div className="card bg-secondary p-3 w-100">
          <Form controller={form}>
            <TextInput fieldName="live_url" label="Live URL" value={liveUrl} onChange={liveUrlChangeHandler} validator={urlValidator} required
              button={<button className="btn btn-primary" onClick={saveLiveUrl} type="submit" ><i className="bi bi-floppy-fill" /></button>} />
          </Form>
        </div>
      </Modal.Overlay>
      <Modal.Overlay closeIcon open={showFactCheck} onClose={() => setShowFactCheck(false)}>
        <div className="modal-body">
          {/* {localPost?.factcheck_guid ? */}
          {/* // <FactCheckResultPage isModal uuid={localPost?.factcheck_guid} />
            // : */}
          <FactCheckModal onClose={closeHandler} post={localPost} setLocalPost={setLocalPost} refresh={fetchStatus} />
          {/* } */}
        </div>
      </Modal.Overlay>
    </div>

  )
}

export default PostItem