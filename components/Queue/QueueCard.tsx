'use client'
import TypeWriterText from "@/perfect-seo-shared-components/components/TypeWriterText/TypeWriterText";
import { QueueItemProps } from "@/perfect-seo-shared-components/data/types";
import { createPost, fetchOutlineStatus, getCompletedPlan, getPlanStatus, getPostStatus, getSpecificPairs, getSynopsisInfo, patchPost, regeneratePost, updateLiveUrl } from "@/perfect-seo-shared-components/services/services";
import { useEffect, useMemo, useState } from "react";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { urlSanitization } from "@/perfect-seo-shared-components/utils/conversion-utilities";
import RegeneratePostModal, { GenerateTypes } from "@/perfect-seo-shared-components/components/RegeneratePostModal/RegeneratePostModal";
import * as Modal from '@/perfect-seo-shared-components/components/Modal/Modal'
import CreateContentModal from "@/perfect-seo-shared-components/components/CreateContentModal/CreateContentModal";
import { GenerateContentPost } from "@/perfect-seo-shared-components/data/requestTypes";
import { createClient } from "@/perfect-seo-shared-components/utils/supabase/client";
import { useDispatch, useSelector } from "react-redux";
import { addToast, selectDomainInfo, updateDomainInfo } from "@/perfect-seo-shared-components/lib/features/User";
import moment from "moment-timezone";
import TextInput from "@/perfect-seo-shared-components/components/Form/TextInput";
import Form from "@/perfect-seo-shared-components/components/Form/Form";
import useForm from "@/perfect-seo-shared-components/hooks/useForm";
import { urlValidator } from "@/perfect-seo-shared-components/utils/validators";

interface QueueCardProps {
  queue: QueueItemProps,
  i: number,
  removeItem: (obj: any) => void
  bulkStatus?: string
}
const QueueCard = ({ queue, i, removeItem, bulkStatus }: QueueCardProps) => {
  const domainInfo = useSelector(selectDomainInfo(queue.domain))
  const [status, setStatus] = useState<string>(null)
  const [data, setData] = useState<any>()
  const [editOutline, setEditOutline] = useState<boolean>(false)
  const [generatePost, setGeneratePost] = useState<GenerateTypes>(null)
  const completedStatuses = ['completed', 'failed', 'cancelled', 'complete', 'finished']
  const [loading, setLoading] = useState<boolean>(false)
  const [showAddLive, setShowAddLive] = useState<boolean>(false)
  const [liveUrl, setLiveUrl] = useState<string>('')
  const form = useForm()
  const dispatch = useDispatch();

  const liveUrlChangeHandler = (e) => {
    setLiveUrl(e.target.value)
  }

  const isComplete = useMemo(() => {
    return status && completedStatuses.includes(status?.toLowerCase())
  }, [status])

  useEffect(() => {
    if (queue?.type === 'outline' && bulkStatus) {
      setStatus(bulkStatus)
    }
  }, [queue?.type, bulkStatus])

  useEffect(() => {
    if (!domainInfo) {
      getSpecificPairs(queue?.domain, ['domain', 'brand_name', 'guid'])
        .then(res => {
          dispatch(updateDomainInfo(res.data))
        })
    }
  }, [domainInfo])


  const fetchData = () => {
    if (!queue) {
      return
    }
    switch (queue.type) {
      case 'plan':
        getCompletedPlan(queue.guid)
          .then(res => {
            setData(res.data)

            fetchStatus()
            return setLoading(false)
          })
          .catch(() => {
            setData(null)
          })
        break;
      case 'outline':
        fetchOutlineStatus(queue.guid)
          .then(res => {
            setData(res.data)
            setStatus(res.data.status)
            setLoading(false)
          })
          .catch(() => {
            setData(null)
          })
        break;
      case 'post':
        getPostStatus(queue.guid)
          .then(res => {
            setData(res.data)
            if (res.data?.live_post_url) {
              setLiveUrl(res.data?.live_post_url)
            }
            setStatus(res.data.status)
            setLoading(false)
          })
          .catch(err => {
            fetchStatus()
            setData(null)
          })
        break;
    }
  }

  const fetchStatus = () => {
    switch (queue.type) {
      case 'plan':
        getPlanStatus(queue.guid)
          .then(res => {
            setStatus(res.data.status)
          })
      case 'outline':
        fetchOutlineStatus(queue.guid)
          .then(res => {
            setStatus(res.data.status)
          })
        break;
      case 'post':
        getPostStatus(queue.guid)
          .then(res => {
            setStatus(res.data.status)
          })
        break;
    }
  }

  useEffect(() => {
    fetchData()
  }, [queue])

  useEffect(() => {
    if (status && completedStatuses.includes(status?.toLowerCase()) && queue?.isComplete === false) {
      supabase
        .from('user_queues')
        .update({ ...queue, isComplete: true })
        .eq('id', queue.id)
        .select("*")
        .then(res => {
          if (res.data) {
            dispatch(addToast({ title: `${queue?.type.toUpperCase()} is complete`, content: `Queue item ${queue.guid} is complete`, type: 'success' }))
          }
        })
    } else if (status) {
      if (queue.isComplete && completedStatuses.includes(status?.toLowerCase()) === false) {
        supabase
          .from('user_queues')
          .update({ ...queue, isComplete: false })
          .eq('id', queue.id)
          .select("*")
          .then(res => {

          })
      }
    }
  }, [queue.isComplete, status])

  const saveLiveUrl = () => {
    let url = liveUrl
    if (url) {
      if (form.validate({ requiredFields: ['live_url'], validatorFields: ['live_url'] })) {
        updateLiveUrl(data.content_plan_outline_guid, url || '')
          .then(res => {
            fetchData()
            setShowAddLive(false)
          })
      }

    }

  }

  useEffect(() => {
    let interval;
    if (editOutline || generatePost || queue?.type === 'plan') return
    if (status && !completedStatuses.includes(status.toLowerCase())) {
      interval = setInterval(() => {
        fetchStatus()
      }, 60000) // 5 second interval
    }
    return () => {
      clearInterval(interval)
    }
  }, [status, editOutline, generatePost, queue])

  const viewPlan = () => {
    switch (queue.type) {
      case 'plan':
        return window.open(`/contentplan/${queue.guid}`, '_blank')
      default:
        if (data?.content_plan_guid) {
          return window.open(`/contentplan/${data?.content_plan_guid}`, '_blank')
        }
    }
  }

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // User has returned to the tab
        console.log('Tab is now visible');
        fetchStatus()
        // Perform actions when the user returns to the tab
      } else {
        // User has switched to another tab or minimized the window
        console.log('Tab is now hidden');
        // Perform actions when the user leaves the tab
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const supabase = createClient()

  const generateSubmitHandler = (email: string, lang: string) => {
    if (generatePost === GenerateTypes.GENERATE) {
      let newOutline = typeof data?.outline === 'string' ? JSON.parse(data?.outline) : data?.outline
      let reqBody: GenerateContentPost = {
        outline: newOutline,
        email: email,
        seo_keyword: data.keyword,
        content_plan_keyword: data?.content_plan_keyword,
        keyword: data?.keyword,
        content_plan_guid: data.content_plan_guid,
        content_plan_outline_guid: data.guid,
        client_name: data.brand_name || domainInfo?.brand_name,
        client_domain: data.domain || domainInfo?.domain,
        receiving_email: email,
        writing_language: lang || 'English'
      };
      return createPost(reqBody)
        .then(res => {
          let newObject: QueueItemProps = {
            type: 'post',
            domain: data.domain,
            guid: data.guid,
            email,
            isComplete: false,
          }
          supabase
            .from('user_queues')
            .insert(newObject)
            .select("*")
            .then(res => {
              console.log(res.data)
            })
          return res
        })
    }
    else if (generatePost === GenerateTypes.REGENERATE) {
      return regeneratePost(queue?.guid, { email, receving_email: email, writing_language: lang })
    }
  }

  if (loading) {
    return null
  }
  const renderBody = () => {
    switch (queue.type) {
      case 'plan':
        return (
          <div className="col-12" key={i}>
            <div className="card bg-secondary p-3">
              <p className="mb-0"> {data?.target_keyword || data?.keyword || data?.content_plan_keyword}
                {queue?.isComplete && <i className="bi bi-check-circle-fill text-success ms-2" />}
              </p>
              <p className="mb-0"><small><strong className="me-2 text-primary">{data?.brand_name}</strong><br />
                <span className="text-white">{data?.domain_name}
                </span>
              </small>
              </p>
              <div className="d-flex justify-content-between align-items-end row">
                <div className="col">
                  {status && <span><strong className="me-2">Status</strong><small className="text-primary"><TypeWriterText string={status} withBlink /></small></span>}
                </div>
                <div className="col-auto">
                  <div className="input-group">
                    <button className="btn btn-primary py-1 mb-0" onClick={(e) => { e.preventDefault(); removeItem(queue) }}>Remove</button>
                    <button className="btn btn-warning py-1 mb-0" onClick={(e) => { e.preventDefault(); viewPlan() }}>View Plan</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'outline':
        return (
          <div className="col-12" key={i}>
            <div className="card bg-secondary p-3">
              <p className="mb-0">{data?.post_title} {queue?.isComplete && <i className="bi bi-check-circle-fill text-success" />}</p>
              <small className="text-white"><strong className="text-primary me-2">Keyword</strong>{data?.keyword}</small>
              <p className="mb-0"><small><strong className="me-2 text-primary">{domainInfo?.brand_name}</strong><span className="text-white">{data?.domain}
              </span>
              </small>
              </p>
              <div className="row d-flex justify-content-end align-items-end">
                {status && <div className="col"><strong className="me-2">Status</strong><small className="text-primary"><TypeWriterText string={status} withBlink /></small></div>}
                <div className="input-group">
                  <button className="btn btn-primary py-1 mb-0" onClick={(e) => { e.preventDefault(); removeItem(queue) }}>Remove</button>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger className="btn btn-warning d-flex align-items-center justify-content-center p-1 mb-0">
                      <i className="bi bi-three-dots-vertical" />
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content align="end" className="bg-warning z-100 card">
                        <DropdownMenu.Item>
                          <button className="btn btn-transparent w-100 text-black" onClick={(e) => { e.preventDefault(); viewPlan() }}>View Content Plan</button>
                        </DropdownMenu.Item>
                        {isComplete && <> <DropdownMenu.Item>
                          <button className="btn btn-transparent w-100 text-black" onClick={(e) => { setEditOutline(true) }}>Edit Outline</button>
                        </DropdownMenu.Item>
                          <DropdownMenu.Item>
                            <button onClick={() => { setGeneratePost(GenerateTypes.GENERATE) }} className="btn btn-transparent w-100 text-black">Generate Post</button>
                          </DropdownMenu.Item>
                        </>}
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
              </div>
            </div>
          </div>
        )
      case 'post':
        return (
          <div className="col-12" key={i}>
            <div className="card bg-secondary p-3">
              <p className="mb-0">{data?.title}
                {queue?.isComplete && <i className="bi bi-check-circle-fill text-success ms-2" />}</p>
              {data?.seo_keyword && <small className="text-white"><strong className="text-primary me-2">Keyword</strong>{data?.seo_keyword}</small>}
              <p className="mb-0"><small><strong className="me-2 text-primary">{domainInfo?.brand_name}</strong><span className="text-white">{data?.client_domain}
              </span>
              </small>
                {data?.live_post_url && <small className="text-white"><br /><strong className="text-primary me-2">Live URL</strong><a href={data?.live_post_url} target="_blank">{data?.live_post_url}</a></small>}
              </p>
              <div className="row d-flex justify-content-end align-items-end">
                {status && <div className="col"><strong className="me-2">Status</strong><small className="text-primary mb-0"><TypeWriterText string={status} withBlink /></small></div>}
                <div className="input-group">
                  <button className="btn btn-primary py-1 mb-0" onClick={(e) => { e.preventDefault(); removeItem(queue) }}>Remove</button>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger className="btn btn-warning d-flex align-items-center justify-content-center p-1 mb-0">
                      <i className="bi bi-three-dots-vertical" />
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Portal>
                      <DropdownMenu.Content align="end" className="bg-warning z-100 card">
                        <DropdownMenu.Item>
                          <button className="btn btn-transparent w-100 text-black" onClick={(e) => { e.preventDefault(); viewPlan() }}>View Content Plan</button>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item>
                          <button className="btn btn-transparent w-100 text-black" onClick={() => { setEditOutline(true) }}>Edit Outline</button>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item>
                          <button className="btn btn-transparent w-100 text-black" onClick={(e) => {
                            setGeneratePost(GenerateTypes.REGENERATE)
                          }}>Regenerate Post</button>
                        </DropdownMenu.Item>
                        {data?.live_post_url && <>
                          {data?.factcheck_guid ?
                            <DropdownMenu.Item>
                              <a
                                href={`https://factcheckPerfect.ai/fact-checks/${data?.factcheck_guid}`}
                                target="_blank"
                                className="btn btn-transparent w-100 text-black"

                              >
                                Fact-Check Results
                              </a>
                            </DropdownMenu.Item>
                            : <DropdownMenu.Item>
                              <a
                                href={`https://factcheckPerfect.ai/fact-checks?url=${encodeURI(data?.live_post_url)}&post_guid=${data?.content_plan_outline_guid}`}
                                target="_blank"
                                className="btn btn-transparent w-100 text-black"

                              >
                                Fact-Check Post
                              </a>
                            </DropdownMenu.Item>}
                          <DropdownMenu.Item>
                            <a
                              href={`https://socialperfect.ai?url=${encodeURI(data?.live_post_url)}`}
                              target="_blank"
                              className="btn btn-transparent w-100 text-black"

                            >
                              Generate Social Posts
                            </a>
                          </DropdownMenu.Item>
                          <DropdownMenu.Item>
                            <a
                              href={`https://app.ahrefs.com/v2-site-explorer/organic-keywords?columns=CPC%7C%7CKD%7C%7CLastUpdated%7C%7COrganicTraffic%7C%7CPaidTraffic%7C%7CPosition%7C%7CPositionHistory%7C%7CSERP%7C%7CSF%7C%7CURL%7C%7CVolume&compareDate=dontCompare&country=us&currentDate=today&keywordRules=&limit=100&mode=prefix&offset=0&positionChanges=&serpFeatures=&sort=Volume&sortDirection=desc&target=${encodeURI(data?.live_post_url.replace("https://", '').replace("http://", "").replace("www.", ""))}&urlRules=&volume_type=average`}
                              target="_blank"
                              className="btn btn-transparent w-100 text-black"
                            >
                              AHREFs Report
                            </a>
                          </DropdownMenu.Item>
                          <DropdownMenu.Item>
                            <a
                              href={`https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain%3A${urlSanitization(data?.live_post_url)}&hl=en&page=*${encodeURI(data?.live_post_url)}`}
                              target="_blank"
                              className="btn btn-transparent w-100 text-black"

                            >
                              GSC Report
                            </a>
                          </DropdownMenu.Item>
                        </>}
                        <DropdownMenu.Item>
                          <button className="btn btn-transparent w-100 text-black" onClick={() => {
                            setShowAddLive(true)
                          }}>{data?.live_post_url ? 'Update' : 'Add'} Live URL</button>
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }
  return (
    <div key={i}>
      {renderBody()}
      <Modal.Overlay open={editOutline} onClose={() => setEditOutline(false)} >
        {data && <CreateContentModal isAuthorized standalone contentPlan={{ client_name: data?.brand_name || domainInfo?.brand_name, client_domain: data.domain || domainInfo?.domain }} data={{ ...data, content_plan_outline_guid: data?.guid || data?.content_plan_outline_guid }} onClose={() => setEditOutline(false)} track />}
      </Modal.Overlay>
      <Modal.Overlay closeIcon open={generatePost !== null} onClose={() => setGeneratePost(null)} >
        <RegeneratePostModal onClose={() => { setGeneratePost(null) }} type={generatePost} submitHandler={generateSubmitHandler} onSuccess={() => { setGeneratePost(null) }} />
      </Modal.Overlay>
      <Modal.Overlay closeIcon open={showAddLive} onClose={() => setShowAddLive(false)} className="modal-small">
        <Modal.Title title="Add Live URL" />
        <div className="card bg-secondary p-3 w-100">
          <Form controller={form}>
            <TextInput fieldName="live_url" label="Live URL" value={liveUrl} onChange={liveUrlChangeHandler} validator={urlValidator} required
              button={<button className="btn btn-primary" onClick={saveLiveUrl} type="submit" ><i className="bi bi-floppy-fill" /></button>} />
          </Form>
        </div>
      </Modal.Overlay>
    </div>
  )
}

export default QueueCard;