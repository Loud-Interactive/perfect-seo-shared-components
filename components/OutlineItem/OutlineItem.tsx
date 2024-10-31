import { useEffect, useState } from "react"
import TextInput from "../Form/TextInput"
import { emailValidator } from "@/perfect-seo-shared-components/utils/validators"
import { deleteContentOutline, fetchOutlineStatus, getPostStatus, patchContentPlans, patchOutlineTitle, saveContentPlanPost, updateLiveUrl } from "@/perfect-seo-shared-components/services/services"

import TypeWriterText from "../TypeWriterText/TypeWriterText"
import Link from "next/link"
import * as Modal from '@/perfect-seo-shared-components/components/Modal/Modal'
import CreateContentModal from "@/components/CreateContentModal/CreateContentModal"

const OutlineItem = ({ outline, refresh, domain_name, setModalOpen }) => {
  const [status, setStatus] = useState(outline?.status)
  const [localOutline, setLocalOutline] = useState(outline)
  const [deleteModal, setDeleteModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [completed, setCompleted] = useState(false)



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
        console.log(err, outline["Post Title"] || outline.post_title);
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
    deleteContentOutline(localOutline?.guid)
      .then(res => {
        refresh();
        setDeleteModal(false)
      })
      .catch(err => {
        console.log(err)
      })
  }

  //   [
  //     "guid",
  //     "content_plan_guid",
  //     "post_title",
  //     "client_domain",
  //     "status",
  //     "brand_name",
  //     "keyword",
  //     "outline"
  // ]
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
        console.log(res);
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
              {outline.domain_name}
              <div>
                {localOutline?.keyword && <strong className="text-primary me-2">Keyword</strong>}
                {localOutline.keyword}
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className='row d-flex justify-content-end'>
            <div className="input-group d-flex justify-content-end">
              <>
                {localOutline?.content_plan_guid && <Link
                  href={`https://contentPerfect.ai/dashboard/${localOutline?.content_plan_guid}`}
                  title="View Content Plan"
                  className="btn btn-warning btn-standard d-flex justify-content-center align-items-center"
                >
                  <i className="bi bi-eye-fill me-1" />     <span className="d-none d-lg-block"> View Content Plan</span>
                </Link>}
                <button
                  title='edit outline'
                  className="btn btn-warning btn-standard no-truncate"
                  onClick={() => { setEditModal(true) }}
                >
                  <i className="bi bi-pencil-fill me-1" /> Edit
                </button>

                <button className='btn btn-primary btn-standard d-flex justify-content-center align-items-center' onClick={deleteClickHandler} title={`View GUID: ${localOutline?.guid}`}><i className="bi bi-trash pt-1" /></button>

              </>
            </div>
            {status !== "completed" && <div className='col-12 text-end text-primary mt-2'>
              <TypeWriterText string={status} withBlink />
            </div>}
          </div>
        </div>
      </div>
      <Modal.Overlay open={editModal} onClose={() => { setEditModal(null) }}>
        <CreateContentModal isAuthorized advancedData={{}} data={localOutline} onClose={() => { setEditModal(null); refresh(); }} index={1} titleChange={handleTitleChange} contentPlan={{ ...localOutline, guid: localOutline.content_plan_guid, 'Post Title': localOutline.post_title }} />
      </Modal.Overlay>
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