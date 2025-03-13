import { useEffect, useState } from "react"
import { createPost, deleteOutline, fetchOutlineData, fetchOutlineStatus, regenerateOutline, saveContentPlanPost } from "@/perfect-seo-shared-components/services/services"
import * as Modal from '@/perfect-seo-shared-components/components/Modal/Modal'
import CreateContentModal from "@/perfect-seo-shared-components/components/CreateContentModal/CreateContentModal"
import moment from "moment-timezone"
import RegeneratePostModal, { GenerateTypes } from "../RegeneratePostModal/RegeneratePostModal";
import { GenerateContentPost } from "@/perfect-seo-shared-components/data/requestTypes";
import { useDispatch, useSelector } from "react-redux";
import { selectEmail, selectIsAdmin } from "@/perfect-seo-shared-components/lib/features/User";
import { ContentType, Outline, OutlineRowProps } from "@/perfect-seo-shared-components/data/types";
import { createClient } from "@/perfect-seo-shared-components/utils/supabase/client";
import StatusBar from "../StatusBar/StatusBar";
import ActionButtonGroup from "../ActionButtonGroup/ActionButtonGroup";

const OutlineItem = ({ outline, refresh, domain_name, setModalOpen }) => {
  const [status, setStatus] = useState('')
  const [localOutline, setLocalOutline] = useState<Outline>(outline)
  const [deleteModal, setDeleteModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [showGenerate, setShowGenerate] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const email = useSelector(selectEmail)
  const isAdmin = useSelector(selectIsAdmin)
  const dispatch = useDispatch()

  const regenerateHandler = () => {
    setEditModal(false);
    setCompleted(false);
    setStatus("in_progress");
  }

  const fetchData = () => {
    fetchOutlineData(outline.guid)
      .then(res => {
        setLocalOutline(res.data[0])
      })
  }

  useEffect(() => {
    if (outline?.status !== status) {
      setStatus(outline?.status)
      if (completedStatus.includes(outline?.status)) {
        if (!completed) {
          setCompleted(true)
        }
        fetchData()
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
        let newStatusItem = res.data[0]
        if (newStatusItem.status) {
          setStatus(newStatusItem.status);
        }
      })
  }


  const completedStatus = ["completed"]


  useEffect(() => {
    if (status.includes("Error:")) {
      return
    }
    else {
      setCompleted(completedStatus.includes(status))
    }
  }, [status])

  useEffect(() => {
    setModalOpen(editModal)
  }, [editModal])

  useEffect(() => {
    let contentPlanOutlines;
    if (outline?.guid) {
      fetchStatus()
      contentPlanOutlines = supabase.channel(`status-${outline.guid}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'content_plan_outline_statuses', filter: `outline_guid=eq.${outline.guid}` },
          (payload) => {
            setStatus(payload.new.status)
          }
        )
        .subscribe()
    }
    if (contentPlanOutlines) {
      return () => {
        contentPlanOutlines.unsubscribe()
      }
    }
  }, [outline?.guid])


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
      <div className="row d-flex g-3 d-flex align-items-end">
        <div className="col">
          <div className="row g-3">
            <div className="col-12">
              <strong className="text-primary me-1">Title</strong>  {localOutline?.post_title} {(outline.client_domain !== domain_name) && <span className='badge bg-primary ms-2'>{outline?.brand_name}</span>}
              <div>
                {/* {localOutline?.content_plan_keyword && <strong className="text-primary me-2">Topic</strong>}
                {localOutline.content_plan_keyword}
                <br />
                {localOutline?.keyword && <strong className="text-primary me-2">Keyword</strong>}
                {localOutline.keyword} */}
              </div>
              <div>
                {localOutline?.created_at && <strong className="text-primary me-2">Date</strong>}
                {moment(localOutline.created_at).format("dddd, MMM Do, YYYY h:mma")}{email !== localOutline.email && <span> by <span className="text-primary">by {localOutline.email}</span></span>}
              </div>
            </div>
          </div>
        </div>
        <div className="col-12">
          <div className="row d-flex justify-content-end align-items-center w-100">
            <div className="col-auto">
              <StatusBar type={ContentType.OUTLINE} content_plan_outline_guid={localOutline?.guid} onGeneratePost={() => {
                setShowGenerate(true)
              }} />
            </div>
            <div className="col-auto">
              <ActionButtonGroup data={localOutline} setData={setLocalOutline} refresh={refresh} type={ContentType.OUTLINE} />
            </div>
          </div>
        </div>
      </div>
      <Modal.Overlay open={editModal} onClose={() => { setEditModal(null) }}>
        <CreateContentModal regenerateHandler={regenerateHandler} isAuthorized advancedData={{}} data={localOutline} onClose={() => { setEditModal(null); refresh(); }} index={1} titleChange={handleTitleChange} contentPlan={{ ...localOutline, guid: localOutline.content_plan_guid, 'Post Title': localOutline.post_title }} />
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
    </div>

  )
}

export default OutlineItem