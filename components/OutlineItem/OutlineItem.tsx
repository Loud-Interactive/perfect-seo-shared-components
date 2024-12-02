import { useEffect, useState } from "react"
import { createPost, deleteOutline, fetchOutlineStatus, regenerateOutline, saveContentPlanPost } from "@/perfect-seo-shared-components/services/services"
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import TypeWriterText from "../TypeWriterText/TypeWriterText"
import Link from "next/link"
import * as Modal from '@/perfect-seo-shared-components/components/Modal/Modal'
import CreateContentModal from "@/perfect-seo-shared-components/components/CreateContentModal/CreateContentModal"
import moment from "moment-timezone"
import RegeneratePostModal, { GenerateTypes } from "../RegeneratePostModal/RegeneratePostModal";
import { GenerateContentPost } from "@/perfect-seo-shared-components/data/requestTypes";
import { useDispatch, useSelector } from "react-redux";
import { addToast, selectEmail, selectIsAdmin } from "@/perfect-seo-shared-components/lib/features/User";
import { QueueItemProps } from "@/perfect-seo-shared-components/data/types";
import { createClient } from "@/perfect-seo-shared-components/utils/supabase/client";

const OutlineItem = ({ outline, refresh, domain_name, setModalOpen }) => {
  const [status, setStatus] = useState(outline?.status)
  const [localOutline, setLocalOutline] = useState(outline)
  const [deleteModal, setDeleteModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [showGenerate, setShowGenerate] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const email = useSelector(selectEmail)
  const isAdmin = useSelector(selectIsAdmin)
  const dispatch = useDispatch()
  useEffect(() => {
    if (outline?.status !== status) {
      setStatus(outline?.status)
      if (completedStatus.includes(outline?.status)) {
        if (!completed) {
          setCompleted(true)
        }
      }
    }
  }, [outline, completed])

  const generatePostHandler = (receiving_email, writing_language?) => {
    let newOutline = typeof outline?.outline === 'string' ? JSON.parse(outline?.outline) : outline?.outline
    let reqBody: GenerateContentPost = {
      outline: newOutline,
      email: email,
      seo_keyword: outline.Keyword || outline.keyword,
      content_plan_keyword: outline?.content_plan_keyword,
      keyword: outline?.keyword,
      content_plan_guid: outline.content_plan_guid,
      content_plan_outline_guid: outline.guid,
      client_name: outline.brand_name,
      client_domain: outline.client_domain,
      receiving_email: receiving_email,
      writing_language: writing_language || 'English'
    };
    return createPost(reqBody)
  }


  const fetchStatus = () => {
    fetchOutlineStatus(outline?.guid)
      .then((res) => {
        if (res.data.status) {
          if (res.data.status !== status) {
            setStatus(res.data.status);
            setLocalOutline(res.data)
          }
          else if (completedStatus.includes(res.data.status)) {
            setStatus(res.data.status)
            if (!completed) {
              setCompleted(true)
            }
            setLocalOutline(res.data)
          }
        }
        else if (res.data.message) {
          setStatus(res.data.message);
        }
      })
      .catch((err) => {
        setStatus(err?.response?.data?.detail ? `Error: ${err?.response?.data?.detail}` : "Error: not found");
      });
  }


  const completedStatus = ["completed"]

  useEffect(() => {
    let interval;
    if (status.includes("Error:")) {
      return
    }
    if (completedStatus.includes(status)) {
      if (completed) {
        setCompleted(true)
        setStatus("completed")
      }
      else {
        return;
      }
    }
    else {
      if (!status) {
        fetchStatus();
      }
      interval = setInterval(() => {
        fetchStatus()
      }, 10000)
    }
    return () => clearTimeout(interval)
  }, [status, completed])

  useEffect(() => {
    setModalOpen(editModal)
  }, [editModal])


  const deleteClickHandler = (e) => {
    e.preventDefault()
    setDeleteModal(true)
  }


  const deleteHandler = () => {
    deleteOutline(localOutline?.guid)
      .then(res => {
        refresh();
        setDeleteModal(false)
      })
      .catch(err => {
        console.log(err)
      })
  }
  const regenerateOutlineClickHandler = () => {
    setLoading(true)
    regenerateOutline(localOutline?.guid, { email: email, client_domain: localOutline?.client_domain, client_name: localOutline?.brand_name, post_title: localOutline?.post_title, content_plan_guid: localOutline?.content_plan_guid })
      .then(res => {
        dispatch(addToast({ title: "Regenerating Outline", type: "info", content: `Regenerating outline for ${localOutline?.post_title || localOutline?.client_domain}` }))
        setStatus("Regenerating")
        setLoading(false)
      })
  }
  const addToQueue = () => {
    let newObject: QueueItemProps = {
      type: 'outline',
      domain: localOutline?.client_domain,
      guid: localOutline?.guid,
      email,
      isComplete: status === 'Finished' ? true : false,
    }
    supabase
      .from('user_queues')
      .insert(newObject)
      .select("*")
      .then(res => {
        dispatch(addToast({ title: "Outline Added to Watchlist", type: "info", content: `Outline ${localOutline?.post_title} to the watchlist` }))
      })
  }

  const handleTitleChange = (e, title) => {
    e?.preventDefault()
    let reqObj = { ...outline, outline_details: JSON.parse(outline.outline), post_title: title, guid: outline.guid }
    delete reqObj.outline
    delete reqObj.status
    delete reqObj.brand_name
    delete reqObj.keyword
    reqObj.client_name = outline.brand_name
    return saveContentPlanPost(reqObj)
      .then(res => {
        return res
      })
  }
  return (
    <div className="card bg-secondary p-3" title={outline?.post_title}>
      <div className="row d-flex g-3 d-flex align-items-start">
        <div className="col-12 col-lg-6">
          <div className="row g-3">
            <div className="col-12">
              <strong className="text-primary me-1">Title</strong>  {localOutline?.post_title} {(outline.client_domain !== domain_name) && <span className='badge bg-primary ms-2'>{outline?.brand_name}</span>}
              <div>
                {localOutline?.content_plan_keyword && <strong className="text-primary me-2">Content Plan Keyword</strong>}
                {localOutline.content_plan_keyword}
                <br />
                {localOutline?.keyword && <strong className="text-primary me-2">Keyword</strong>}
                {localOutline.keyword}
              </div>
              <div>
                {localOutline?.created_at && <strong className="text-primary me-2">Date</strong>}
                {moment(localOutline.created_at).format("dddd, MMM Do, YYYY h:mma")}
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className='row d-flex justify-content-end'>
            <div className="input-group d-flex justify-content-end">
              <>

                <button
                  title='edit outline'
                  className="btn btn-warning btn-standard no-truncate"
                  onClick={() => { setEditModal(true) }}
                >
                  <i className="bi bi-pencil-fill me-1" /> Edit
                </button>

                <button className='btn btn-primary btn-standard d-flex justify-content-center align-items-center' onClick={deleteClickHandler} title={`View GUID: ${localOutline?.guid}`}><i className="bi bi-trash pt-1" /></button>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger className="btn btn-warning btn-standard d-flex align-items-center justify-content-center">
                    <i className="bi bi-three-dots-vertical" />
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content align="end" className="bg-warning z-100 card">
                      {isAdmin && <DropdownMenu.Item>
                        <button className="btn btn-transparent text-black" onClick={addToQueue}><i className="material-icons me-2">queue</i>Add to Watchlist</button>
                      </DropdownMenu.Item>}
                      {localOutline?.content_plan_guid && <DropdownMenu.Item>
                        <Link
                          href={`https://contentPerfect.ai/dashboard/${localOutline?.content_plan_guid}`}
                          title="View Content Plan"
                          className="btn btn-transparent text-black"
                        >
                          View Content Plan
                        </Link>
                      </DropdownMenu.Item>}
                      <DropdownMenu.Item>
                        <button
                          className="btn btn-transparent text-black"
                          onClick={(e) => {
                            regenerateOutlineClickHandler();
                          }}
                        >
                          Regenerate Outline
                        </button>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item>
                        <button
                          className="btn btn-transparent text-black"
                          onClick={() => { setShowGenerate(true) }}
                        >
                          Generate Post
                        </button>
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>


              </>
            </div>

            <div className='col-12 text-end text-primary mt-2'>
              <TypeWriterText string={status} withBlink />
            </div>
          </div>
        </div>
      </div>
      <Modal.Overlay open={editModal} onClose={() => { setEditModal(null) }}>
        <CreateContentModal isAuthorized advancedData={{}} data={localOutline} onClose={() => { setEditModal(null); refresh(); }} index={1} titleChange={handleTitleChange} contentPlan={{ ...localOutline, guid: localOutline.content_plan_guid, 'Post Title': localOutline.post_title }} />
      </Modal.Overlay>
      <Modal.Overlay
        open={showGenerate}
        onClose={() => { setShowGenerate(false); refresh() }}
      >
        <RegeneratePostModal onClose={() => { setShowGenerate(false); }} type={GenerateTypes.GENERATE} submitHandler={generatePostHandler} onSuccess={() => { setShowGenerate(false); refresh() }} />
      </Modal.Overlay >
      <Modal.Overlay open={deleteModal} onClose={() => { setDeleteModal(null) }}>
        <Modal.Title title="Delete Outline" />
        <Modal.Description>
          Are you sure you want to delete this outline?
          <div className='d-flex justify-content-between mt-5'>
            <button onClick={() => { setDeleteModal(null) }} className="btn btn-warning">Cancel</button>
            <button onClick={(e) => { e.preventDefault(); deleteHandler() }} className="btn btn-primary">Yes</button>
          </div>
        </Modal.Description>
      </Modal.Overlay>
    </div >

  )
}

export default OutlineItem