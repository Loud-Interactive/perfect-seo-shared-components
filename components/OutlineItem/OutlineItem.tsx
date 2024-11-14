import { useCallback, useEffect, useState } from "react"
import { deleteOutline, fetchOutlineStatus, getContentPlanPost, regenerateOutline, saveContentPlanPost } from "@/perfect-seo-shared-components/services/services"
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import TypeWriterText from "../TypeWriterText/TypeWriterText"
import Link from "next/link"
import * as Modal from '@/perfect-seo-shared-components/components/Modal/Modal'
import CreateContentModal from "@/perfect-seo-shared-components/components/CreateContentModal/CreateContentModal"
import moment from "moment-timezone"
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const OutlineItem = ({ outline, refresh, domain_name, setModalOpen }) => {
  const [status, setStatus] = useState(outline?.status)
  const [localOutline, setLocalOutline] = useState(outline)
  const [deleteModal, setDeleteModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(false)

  const router = useRouter();

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

  const searchParams = useSearchParams();
  const pathname = usePathname()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const generatePostHandler = (e) => {
    e.preventDefault();
    router.replace(pathname + '?' + createQueryString('generate', 'true'))
    return setEditModal(true);
  };

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
    deleteOutline(localOutline?.guid)
      .then(res => {
        refresh();
        setDeleteModal(false)
      })
      .catch(err => {
        console.log(err)
      })
  }


  const regenerateClickHandler = () => {
    setLoading(true);
    regenerateOutline(localOutline?.guid)
      .then((result) => {
        let newData = JSON.parse(result.data.outline);
        setLocalOutline(newData)
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

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
                      {localOutline?.content_plan_guid && <DropdownMenu.Item>
                        <Link
                          href={`https://contentPerfect.ai/dashboard/${localOutline?.content_plan_guid}`}
                          title="View Content Plan"
                          className="btn btn-transparent text-black"
                        >
                          View Content Plan
                        </Link>
                      </DropdownMenu.Item>}
                      {/* <DropdownMenu.Item>
                        <button
                          className="btn btn-transparent text-black"
                          onClick={(e) => {
                            e.preventDefault();
                            regenerateClickHandler();
                          }}
                        >
                          Regenerate Outline
                        </button>
                      </DropdownMenu.Item> */}
                      <DropdownMenu.Item>
                        <button
                          className="btn btn-transparent text-black"
                          onClick={generatePostHandler}
                        >
                          Generate Post
                        </button>
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>


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
    </div >

  )
}

export default OutlineItem