import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Modal from '@/perfect-seo-shared-components/components/Modal/Modal'
import { useDispatch, useSelector } from 'react-redux';
import { ContentType } from '@/perfect-seo-shared-components/data/types';
import { addToast, selectEmail, selectIsAdmin } from '@/perfect-seo-shared-components/lib/features/User';
import { useEffect, useMemo, useState } from 'react';
import { createPost, deletePost, deleteOutline, fetchOutlineData, regenerateHTML, regenerateHTMLfromDoc, regenerateOutline, regeneratePost, updateLiveUrl, getPostStatusFromOutline, regenerateOutlineByGuid } from '@/perfect-seo-shared-components/services/services';
import { createClient } from '@/perfect-seo-shared-components/utils/supabase/client';
import en from '@/assets/en.json'
import CreateContentModal from '../CreateContentModal/CreateContentModal';
import TypeWriterText from '../TypeWriterText/TypeWriterText';
import RegeneratePostModal, { GenerateTypes } from '../RegeneratePostModal/RegeneratePostModal';
import useForm from '@/perfect-seo-shared-components/hooks/useForm';
import IndexModal from '../IndexModal/IndexModal';
import Form from '../Form/Form';
import TextInput from '../Form/TextInput';
import { urlValidator } from '@/perfect-seo-shared-components/utils/validators';
import { urlSanitization } from '@/perfect-seo-shared-components/utils/conversion-utilities';
import FactCheckResultPage from '../FactCheckResultPage/FactCheckResultPage';
import FactCheckModal from '../FactCheckModal/FactCheckModal';
import { GenerateContentPost, RegeneratePost } from '@/perfect-seo-shared-components/data/requestTypes';
import RegeneratePostHTMLModal from '../RegeneratePostHTMLModal.tsx/RegeneratePostHTMLModal';
import Link from 'next/link';


interface ActionButtonGroupProps {
  data: any
  refresh: () => void
  type: ContentType
  setData?: (data: any) => void
}


const ActionButtonGroup = ({
  data,
  setData,
  refresh,
  type
}: ActionButtonGroupProps) => {

  // Global store values 
  const dispatch = useDispatch()
  const isAdmin = useSelector(selectIsAdmin)
  const email = useSelector(selectEmail)
  const [outlineGUID, setOutlineGUID] = useState<string>(null);
  const [postData, setPostData] = useState(type === ContentType.POST ? data : null)

  useEffect(() => {
    if (type === ContentType.OUTLINE) {
      let guid = data?.outline?.guid || data?.guid
      setOutlineGUID(guid)
    }
    else {
      setOutlineGUID(data?.content_plan_outline_guid)
    }
  }, [data])

  const fetchPostData = () => {
    if (outlineGUID) {
      getPostStatusFromOutline(outlineGUID)
        .then(res => {
          setPostData(res.data[0])
        })
    }
  }

  useEffect(() => {
    if (type === ContentType.OUTLINE && outlineGUID) {
      fetchPostData()
    }
  }, [outlineGUID])

  const submitHTMLStylingHandler = (receivingEmail, language?) => {
    let reqBody: RegeneratePost = {
      email: email,
      receiving_email: receivingEmail,
      content_plan_outline_guid: outlineGUID
    };

    return regenerateHTML(reqBody)
  };
  const submitGoogleDocRegenerateHandler = (receivingEmail, language?) => {
    let reqBody: RegeneratePost = {
      email: email,
      receiving_email: receivingEmail,
      content_plan_outline_guid: outlineGUID,
    };


    return regenerateHTMLfromDoc(reqBody)
  };


  const regenerateHandler = () => {
    setShowEditModal(false);
    refresh();
  }
  // State management
  const supabase = createClient()

  // Modal states 
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showGeneratePostModal, setShowGeneratePostModal] = useState<boolean>(false);
  const [showRegeneratePostModal, setShowRegeneratePostModal] = useState<boolean>(false);
  const [showLiveURLModal, setShowLiveURLModal] = useState<boolean>(false);
  const [showIndexModal, setShowIndexModal] = useState<boolean>(false);
  const [showFactCheckModal, setShowFactCheckModal] = useState<boolean>(false);
  const [showRegenerateHTMLModal, setShowRegenerateHTMLModal] = useState<boolean>(false);
  const [showImageGeneratePrompt, setShowImageGeneratePrompt] = useState<boolean>(false);

  const [outlineData, setOutlineData] = useState<any>(null)
  // error states 
  const [regenerateError, setRegenerateError] = useState<string>('');

  // Form states 
  const liveURLForm = useForm()

  useEffect(() => {
    if (postData?.live_post_url) {
      liveURLForm.setState({ live_url: postData?.live_post_url })
    }
  }, [postData?.live_post_url])

  // Click handlers and data handlers 
  const deleteClickHandler = (e) => {
    e.preventDefault()
    setShowDeleteModal(true)
  }

  const getOutlineData = () => {
    let guid = outlineGUID
    if (!guid) return
    fetchOutlineData(guid)
      .then(res => {

        setOutlineData(res.data[0])
      })
  }
  useEffect(() => {
    let outlineChannel;

    getOutlineData()
    outlineChannel = supabase.channel(`actionbutton-outline-status-${outlineGUID}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'content_plan_outlines', filter: `guid=eq.${outlineGUID}` },
        (payload) => {
          if (payload.new) {
            setOutlineData(payload.new)
          }

        }
      )
      .subscribe()
    if (outlineChannel) {
      return () => {
        outlineChannel.unsubscribe()
      }
    }
  }, [])

  const deleteHandler = () => {
    if (type === ContentType.POST) {
      if (postData?.task_id) {
        deletePost(postData?.task_id)
          .then(res => {
            if (res.data) {
              let historyItem: any = { guid: outlineGUID, email }
              if (data?.title) {
                historyItem.title = data?.title
              }
              supabase
                .from('user_history')
                .insert({ email: email, domain: data?.client_domain, transaction_data: historyItem, product: en.product, type: "DELETE", action: "Delete Post" })
                .select('*')
                .then(res => { })
              refresh();
              setShowDeleteModal(false)
            }
          })


      }
      else {
        console.log("no task id!", data)
      }
    }
    else {
      deleteOutline(outlineGUID)
        .then(res => {
          refresh();
          setShowDeleteModal(false)
        })
    }
  }

  const handleEditOutline = (e?) => {
    if (e) {
      e.preventDefault()
    }
    setShowEditModal(true)
  }

  const generatePostHandler = (receiving_email, writing_language?) => {
    let reqBody: GenerateContentPost = {
      email: email, content_plan_outline_guid: outlineGUID,
      receiving_email: receiving_email,
      writing_language: writing_language || 'English'
    };
    return createPost(reqBody)
  }

  const regeneratePostHandler = (receiving_email, writing_language) => {
    setRegenerateError(null)
    return regeneratePost(outlineGUID, { receiving_email: receiving_email, email, writing_language }).then(res => {
      let historyItem: any = { guid: outlineGUID, email }
      if (data?.title) {
        historyItem.title = data?.title
      }
      supabase
        .from('user_history')
        .insert({ email: email, domain: data?.client_domain, transaction_data: historyItem, product: en.product, type: "REGENERATE", action: "Regenerate Post" })
        .select('*')
        .then(res => { })
      return res
    })
      .catch(err => {
        setRegenerateError(err.response.data.detail.split(":")[0])
        return err
      })
  }

  const saveLiveUrl = () => {
    let url = liveURLForm.getState.live_url
    if (url) {
      if (liveURLForm.validate({ requiredFields: ['live_url'], validatorFields: ['live_url'] })) {
        updateLiveUrl(outlineGUID, url || '')
          .then(res => {
            if (setData) {
              setData({ ...data, live_post_url: url })
              setShowLiveURLModal(false)
            }
          })
      }

    }
    else {
      updateLiveUrl(outlineGUID, '')
        .then(res => {
          if (setData) {
            setData({ ...data, live_post_url: 'url' })
          }
          setShowLiveURLModal(false)
        })
    }
  }

  const regeneratePostHTMLSubmitHandler = (email) => {
    let reqObj = {
      email: email,
      content_plan_outline_guid: outlineGUID
    }
    return regenerateHTML(reqObj)
  }

  const regenerateOutlineClickHandler = () => {
    if (outlineGUID) {
      regenerateOutlineByGuid(outlineGUID)
        .then(res => {
          dispatch(addToast({ title: "Regenerating Outline", type: "info", content: `Regenerating outline for ${data?.post_title || data?.client_domain}` }))
        })
    }
    else {
      regenerateOutline(outlineGUID, { email: email, client_domain: data?.client_domain, client_name: data?.brand_name, post_title: data?.post_title, content_plan_guid: data?.content_plan_guid })
        .then(res => {
          dispatch(addToast({ title: "Regenerating Outline", type: "info", content: `Regenerating outline for ${data?.post_title || data?.client_domain}` }))
        })
    }
  }

  const copyoutlineGUID = (e) => {
    e.preventDefault();
    let copiedGuid;
    if (type === ContentType.POST) {
      copiedGuid = postData?.task_id
    } else if (type === ContentType.OUTLINE) {
      copiedGuid = outlineGUID
    }
    navigator.clipboard.writeText(copiedGuid)
    dispatch(addToast({ title: "Copied Outline GUID", type: "success", content: `Outline GUID ${copiedGuid} copied to clipboard` }))
  }
  const copyPostGuid = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(postData?.task_id)
    dispatch(addToast({ title: "Copied Post GUID", type: "success", content: `Post GUID ${postData?.task_id} copied to clipboard` }))
  }
  const copyImageThinking = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(postData?.hero_image_thinking)
    dispatch(addToast({ title: "Copied Image Prompt", type: "success", content: `Image Prompt copied to clipboard` }))
  }
  const copyImagePrompt = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(postData?.hero_image_prompt)
    dispatch(addToast({ title: "Copied Image Prompt", type: "success", content: `Image Prompt copied to clipboard` }))

  }



  if ((outlineGUID && type === ContentType.POST) || (outlineGUID && type === ContentType.OUTLINE)) {
    return (
      <>
        <div className='row d-flex justify-content-end'>
          <div className="input-group d-flex justify-content-end">
            {(postData?.google_doc_link && postData?.html_link) &&
              <>
                <a
                  href={postData.html_link}
                  className="btn btn-secondary btn-standard"
                  title="HTML File"
                  target="_blank"
                >
                  <i className="bi bi-filetype-html " />
                </a>
                <a
                  href={postData.google_doc_link}
                  className="btn btn-secondary btn-standard"
                  title="Google Docs"
                  target="_blank"
                >
                  <i className="bi bi-filetype-doc " />
                </a>
              </>}
            {(type === ContentType.OUTLINE && data?.outline) &&
              <a
                title='edit outline'
                className="btn btn-secondary btn-standard no-truncate"
                onClick={(e) => { setShowEditModal(true) }}
              >
                <i className="bi bi-pencil-fill me-1" /> Edit
              </a>
            }
            <button className='btn btn-primary btn-standard d-flex justify-content-center align-items-center' onClick={deleteClickHandler} title={`View GUID: ${outlineGUID}`}><i className="bi bi-trash pt-1" /></button>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger className="btn btn-secondary btn-standard d-flex align-items-center justify-content-center">
                <i className="bi bi-three-dots-vertical" />
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" className="bg-secondary z-100 card">
                  {(outlineData?.outline) &&
                    <DropdownMenu.Item>
                      <a className="btn btn-transparent" onClick={handleEditOutline}>
                        Edit Outline
                      </a>
                    </DropdownMenu.Item>}
                  {data?.content_plan_guid &&
                    <DropdownMenu.Item>
                      <a
                        href={`/contentplan/${data?.content_plan_guid}`}
                        target="_blank"
                        className="btn btn-transparent"
                      >
                        View Content Plan
                      </a>
                    </DropdownMenu.Item>}
                  {type === ContentType.OUTLINE &&
                    <>
                      {outlineGUID && <DropdownMenu.Item>
                        <a
                          className="btn btn-transparent"
                          onClick={(e) => {
                            e.preventDefault();
                            regenerateOutlineClickHandler();
                          }}
                        >
                          Regenerate Outline
                        </a>
                      </DropdownMenu.Item>}
                      {postData ?
                        <DropdownMenu.Item>
                          <a className="btn btn-transparent" onClick={(e) => {
                            e.preventDefault();
                            setShowRegeneratePostModal(true)
                          }}>Regenerate Post</a>
                        </DropdownMenu.Item>
                        : <DropdownMenu.Item>
                          <a
                            className="btn btn-transparent text-primary"
                            onClick={(e) => {
                              e.preventDefault();
                              setShowGeneratePostModal(true)
                            }}
                          >
                            Generate Post
                          </a>
                        </DropdownMenu.Item>
                      }

                    </>}
                  {type === ContentType.POST &&
                    <>
                      {postData?.hero_image_prompt && <DropdownMenu.Item>
                        <a className="btn btn-transparent" onClick={(e) => { e.preventDefault(); setShowImageGeneratePrompt(true) }}>Show Hero Image Prompt</a>
                      </DropdownMenu.Item>
                      }
                      {(isAdmin && postData?.task_id) && <DropdownMenu.Item>
                        <Link className="btn btn-transparent" href={`/post/${postData?.task_id}`} target="_blank">Post Page</Link>
                      </DropdownMenu.Item>}
                      <DropdownMenu.Item>
                        <a className="btn btn-transparent" onClick={(e) => {
                          e.preventDefault();
                          setShowRegeneratePostModal(true)
                        }}>Regenerate Post</a>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item>
                        <a className="btn btn-transparent" onClick={(e) => {
                          e.preventDefault(); setShowLiveURLModal(true)
                        }}>{postData?.live_post_url ? 'Edit' : 'Add'} Live Post URL</a>
                      </DropdownMenu.Item>
                      {postData?.live_post_url && <>
                        {isAdmin && <>
                          {postData?.factcheck_guid ?
                            <DropdownMenu.Item>
                              <a
                                href={`https://factcheckPerfect.ai/fact-checks/${postData?.factcheck_guid}`}
                                target="_blank"
                                className="btn btn-transparent text-primary"

                              >
                                Fact-Check Results
                              </a>
                            </DropdownMenu.Item>
                            : <DropdownMenu.Item>
                              <a
                                href={`https://factcheckPerfect.ai/fact-checks?url=${encodeURI(postData?.live_post_url)}&post_guid=${outlineGUID}`}
                                target="_blank"
                                className="btn btn-transparent text-primary"

                              >
                                Fact-Check Post
                              </a>
                            </DropdownMenu.Item>
                          }
                        </>}
                        {isAdmin && <DropdownMenu.Item>
                          <a
                            onClick={(e) => {
                              e.preventDefault();
                              setShowIndexModal(true)
                            }}
                            className="btn btn-transparent"
                          >
                            Index Post
                          </a>
                        </DropdownMenu.Item>}
                        <DropdownMenu.Item>
                          <a
                            href={`https://socialperfect.ai?url=${encodeURI(postData?.live_post_url)}`}
                            target="_blank"
                            className="btn btn-transparent text-primary"

                          >
                            Generate Social Posts
                          </a>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item>
                          <a
                            href={`https://app.ahrefs.com/v2-site-explorer/organic-keywords?columns=CPC%7C%7CKD%7C%7CLastUpdated%7C%7COrganicTraffic%7C%7CPaidTraffic%7C%7CPosition%7C%7CPositionHistory%7C%7CSERP%7C%7CSF%7C%7CURL%7C%7CVolume&compareDate=dontCompare&country=us&currentDate=today&keywordRules=&limit=100&mode=prefix&offset=0&positionChanges=&serpFeatures=&sort=Volume&sortDirection=desc&target=${encodeURI(postData?.live_post_url.replace("https://", '').replace("http://", "").replace("www.", ""))}&urlRules=&volume_type=average`}
                            target="_blank"
                            className="btn btn-transparent text-primary"
                          >
                            AHREFs Report
                          </a>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item>
                          <a
                            href={`https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain%3A${urlSanitization(postData?.live_post_url)}&hl=en&page=*${encodeURI(data?.live_post_url)}`}
                            target="_blank"
                            className="btn btn-transparent text-primary"

                          >
                            GSC Report
                          </a>
                        </DropdownMenu.Item>
                      </>}
                    </>}
                  {isAdmin && <>
                    {(type === ContentType.OUTLINE && outlineGUID) && <DropdownMenu.Item>
                      <a className="btn btn-transparent" onClick={copyoutlineGUID}>
                        Copy Outline GUID
                      </a>
                    </DropdownMenu.Item>
                    }
                    {(type === ContentType.POST && postData?.task_id) && <DropdownMenu.Item>
                      <a className="btn btn-transparent" onClick={copyPostGuid}>
                        Copy Post GUID
                      </a>
                    </DropdownMenu.Item>
                    }
                    {(type === ContentType.POST && outlineGUID) && <DropdownMenu.Item>
                      <a className="btn btn-transparent" onClick={copyoutlineGUID}>
                        Copy Outline GUID
                      </a>
                    </DropdownMenu.Item>
                    }
                  </>
                  }
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
          {regenerateError && <div className='col-12 text-end text-primary mt-2'>
            <TypeWriterText string={regenerateError} withBlink />
          </div>}
        </div>
        {/* Modals  */}
        <Modal.Overlay open={showDeleteModal} onClose={() => { setShowDeleteModal(null) }}>
          <Modal.Title title="Delete Plan" />
          <Modal.Description>
            Are you sure you want to delete this post?
            <div className='d-flex justify-content-between mt-5'>
              <button onClick={() => { setShowDeleteModal(null) }} className="btn btn-transparent">Cancel</button>
              <button onClick={(e) => { e.preventDefault(); deleteHandler() }} className="btn btn-primary">Yes</button>
            </div>
          </Modal.Description>
        </Modal.Overlay>
        <Modal.Overlay open={showEditModal} onClose={() => { setShowEditModal(null) }}>
          <CreateContentModal regenerateHandler={regenerateHandler} standalone data={data} titleChange={() => { }} onClose={() => { setShowEditModal(false) }} isAuthorized={true} />
        </Modal.Overlay>
        <Modal.Overlay
          open={showRegeneratePostModal}
          onClose={() => { setShowRegeneratePostModal(null); refresh() }}
        >
          <RegeneratePostModal title={data?.title || data['Post Title']} submitHTMLStylingHandler={submitHTMLStylingHandler} submitGoogleDocRegenerateHandler={submitGoogleDocRegenerateHandler} onClose={() => { setShowRegeneratePostModal(null); }} type={GenerateTypes.REGENERATE} submitHandler={regeneratePostHandler} onSuccess={() => { setShowRegeneratePostModal(false); refresh() }} />
        </Modal.Overlay >
        <Modal.Overlay
          open={showGeneratePostModal}
          onClose={() => { setShowGeneratePostModal(null); refresh() }}
        >
          <RegeneratePostModal title={data?.title || data['Post Title']} submitHTMLStylingHandler={submitHTMLStylingHandler} submitGoogleDocRegenerateHandler={submitGoogleDocRegenerateHandler} onClose={() => { setShowGeneratePostModal(null); }} type={GenerateTypes.GENERATE} submitHandler={generatePostHandler} onSuccess={() => { setShowGeneratePostModal(false); refresh() }} />
        </Modal.Overlay >
        <Modal.Overlay closeIcon open={showLiveURLModal} onClose={() => setShowLiveURLModal(false)} className="modal-small">
          <Modal.Title title="Add Live URL" />
          <div className="card bg-secondary p-3">
            <Form controller={liveURLForm}>
              <TextInput fieldName="live_url" label="Live URL" validator={urlValidator} type="url" required
                button={<button className="btn btn-primary" onClick={saveLiveUrl} type="submit" ><i className="bi bi-floppy-fill" /></button>} />
            </Form>
          </div>
        </Modal.Overlay>
        <Modal.Overlay closeIcon open={showFactCheckModal} onClose={() => setShowFactCheckModal(false)}>
          <div className="modal-body">
            {postData?.factcheck_guid ?
              <FactCheckResultPage isModal uuid={postData?.factcheck_guid} />
              :
              <FactCheckModal onClose={
                () => {
                  setShowFactCheckModal(false)
                }
              } post={postData} setLocalPost={setPostData} />
            }
          </div>
        </Modal.Overlay>
        <Modal.Overlay closeIcon open={showIndexModal} onClose={() => setShowIndexModal(false)}>
          <div className="modal-body">
            <IndexModal post={postData}
              setPost={setPostData}
              onClose={() => {
                setShowIndexModal(false);
                return refresh();
              }} />
          </div>
        </Modal.Overlay>
        <Modal.Overlay closeIcon open={showRegenerateHTMLModal} onClose={() => setShowRegenerateHTMLModal(false)}>
          <RegeneratePostHTMLModal onClose={() => setShowRegenerateHTMLModal(false)} submitHandler={regeneratePostHTMLSubmitHandler} onSuccess={() => {
            setShowRegenerateHTMLModal(false); return refresh()
          }} />
        </Modal.Overlay>
        <Modal.Overlay closeIcon open={showImageGeneratePrompt} onClose={() => setShowImageGeneratePrompt(false)}>
          <div className="card p-3">
            {postData?.hero_image_prompt && <div className="card-body">
              <h5 className="card-title">Image Generation Prompt</h5>
              <pre className="card p-1 bg-secondary">{postData?.hero_image_prompt}</pre>
              <button className="btn btn-primary mt-1" onClick={copyImagePrompt}><i className="bi bi-copy" />Copy</button>
            </div>
            }
            {postData?.hero_image_thinking && <div className="card-body">
              <h5 className="card-title">Image Generation Prompt</h5>
              <pre className="card p-1 bg-secondary">{postData?.hero_image_thinking}</pre>
              <button className="btn btn-primary mt-1" onClick={copyImageThinking}><i className="bi bi-copy" />Copy</button>
            </div>
            }
          </div>
        </Modal.Overlay>
      </>
    )
  }
  else return null
}
export default ActionButtonGroup