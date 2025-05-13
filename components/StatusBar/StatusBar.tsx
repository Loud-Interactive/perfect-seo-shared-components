'use client'
import { ContentType } from "@/perfect-seo-shared-components/data/types";
import { fetchOutlineStatus, generateContentPlanOutline, generateImagePrompt, generateSchema, getFactCheckStatus, getPostStatusFromOutline, publishToWordPress } from "@/perfect-seo-shared-components/services/services";
import { useEffect, useState } from "react";
import TypeWriterText from "../TypeWriterText/TypeWriterText";
import { keyToLabel } from "@/perfect-seo-shared-components/utils/conversion-utilities";
import { createClient } from "@/perfect-seo-shared-components/utils/supabase/client";
import * as Modal from "@/perfect-seo-shared-components/components/Modal/Modal";
import TextArea from "../Form/TextArea";
import Form from "../Form/Form";
import useForm from "@/perfect-seo-shared-components/hooks/useForm";
import HeroImageGenerator from "../HeroImageGenerator/HeroImageGenerator";

interface StatusBarProps {
  content_plan_outline_guid?: string;
  content_plan_guid?: string
  content_plan_factcheck_guid?: string
  content_plan_social_guid?: string,
  live_post_url?: string,
  addLiveUrlHandler?: () => void
  onGeneratePost?: () => void
  indexHandler?: () => void,
  onGenerateOutline?: () => void,
  type: ContentType,
  index_status?: string
  post_status?: string,
  outline_status?: string,
  hero_image_prompt?: string,
  task_id?: string;
  schema_data?: any;
  hero_image_url?: string,
  showEditOutlineHandler: () => void
}

const StatusBar = ({
  post_status,
  outline_status,
  content_plan_outline_guid,
  content_plan_guid,
  content_plan_factcheck_guid,
  content_plan_social_guid,
  onGeneratePost,
  indexHandler,
  onGenerateOutline,
  addLiveUrlHandler,
  showEditOutlineHandler,
  hero_image_url,
  live_post_url,
  hero_image_prompt,
  task_id,
  index_status,
  schema_data,
  type,
  ...props
}: StatusBarProps) => {
  const [outlineStatus, setOutlineStatus] = useState<string>('');
  const [postStatus, setPostStatus] = useState<string>('');
  const [factcheckStatus, setFactcheckStatus] = useState<string>('');


  const [outlineLoading, setOutlineLoading] = useState<boolean>(false);
  const [postLoading, setPostLoading] = useState<boolean>(false);
  const [factcheckLoading, setFactcheckLoading] = useState<boolean>(false);
  const [generateSchemaLoading, setGenerateSchemaLoading] = useState<boolean>(false);
  const [generateImagePromptLoading, setGenerateImagePromptLoading] = useState<boolean>(false);

  const [outlineError, setOutlineError] = useState<string>('');
  const [postError, setPostError] = useState<string>('');
  const [factcheckError, setFactcheckError] = useState<string>('');

  const [outlineComplete, setOutlineComplete] = useState<boolean>(false);
  const [postComplete, setPostComplete] = useState<boolean>(false);
  const [factcheckComplete, setFactcheckComplete] = useState<boolean>(false);

  const [viewSchema, setViewSchema] = useState<boolean>(false);
  const [schemaStatus, setSchemaStatus] = useState<string>('');
  const [wordPressPublishStatus, setWordPressPublishStatus] = useState<string>(null);

  const [wordPressPublish, setWordPressPublish] = useState<boolean>(false);

  const [viewImagePrompt, setViewImagePrompt] = useState<boolean>(false);
  const [generateImageModal, setGenerateImageModal] = useState<boolean>(false);

  const supabase = createClient();
  const form = useForm();


  const checkWordPressPublish = async () => {
    supabase
      .from('tasks')
      .select('client_domain')
      .order('created_at', { ascending: false })
      .eq('content_plan_outline_guid', content_plan_outline_guid)
      .limit(1)
      .then(res => {
        if (res.data[0]) {
          const domain = res.data[0].client_domain;
          // console.log('domain', domain)
          // Check if the domain exists in the clients tables

          supabase
            .from('client_api_keys')
            .select('*')
            .eq('domain', domain)
            .eq('is_active', true)
            .limit(1)
            .then(res => {
              if (res.data[0]) {
                setWordPressPublish(true)
              }
              else {
                setWordPressPublish(false)
              }
            })

        }
      })

  }

  const fetchOutlineStatusData = () => {
    if (content_plan_outline_guid) {
      setOutlineLoading(true);
      fetchOutlineStatus(content_plan_outline_guid)
        .then(res => {
          if (res.data[0]) {
            setOutlineLoading(false);
            setOutlineStatus(res.data[0]?.status);
          }
          else {
            setOutlineLoading(false);
            setOutlineStatus('')
          }

        })
    }
  };

  useEffect(() => {
    let contentPlanOutlines;
    if (content_plan_outline_guid) {
      fetchOutlineStatusData();
      contentPlanOutlines = supabase.channel(`statusbar-outline-status-${content_plan_outline_guid}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'content_plan_outline_statuses', filter: `outline_guid=eq.${content_plan_outline_guid}` },
          (payload) => {
            setOutlineStatus(payload.new.status)
          }
        )
        .subscribe()
    }
    if (outline_status) {
      setOutlineStatus(outline_status)
    }
    if (contentPlanOutlines) {
      return () => {
        contentPlanOutlines.unsubscribe()
      }
    }
  }, [content_plan_outline_guid, outline_status])


  const fetchPostStatusData = () => {
    if (content_plan_outline_guid) {
      setPostLoading(true);
      getPostStatusFromOutline(content_plan_outline_guid)
        .then(res => {
          setPostLoading(false);
          setPostStatus(res.data[0]?.status);
        })
    }
  };


  useEffect(() => {
    let postInterval;
    if (content_plan_outline_guid) {
      checkWordPressPublish()
      if (post_status) {
        setPostStatus(post_status)
      }
      else {
        fetchPostStatusData();
        postInterval = setInterval(() => {
          fetchPostStatusData();
        }, 60000);
      }
    }
    return () => {
      if (postInterval) {
        clearInterval(postInterval);
      }
    };
  }, [content_plan_outline_guid, post_status]);

  useEffect(() => {
    let formData = form.getState;
    if (schema_data) {
      formData.schema_data = schema_data
    }
    if (hero_image_prompt) {
      formData.hero_image_prompt = hero_image_prompt
    }
    form.setState(formData)
  }, [schema_data, hero_image_prompt])

  const updateSchema = () => {
    supabase
      .from('tasks')
      .update({ schema_data: form.getState.schema_data })
      .eq('task_id', task_id)
      .then(res => {
        if (res.status === 204) {
          setSchemaStatus('Schema Updated')
        }
      })
  }



  const fetchFactcheckStatusData = () => {
    if (content_plan_factcheck_guid) {
      setFactcheckLoading(true);
      getFactCheckStatus(content_plan_factcheck_guid)
        .then(res => {
          let status = res.data.status.replaceAll("_", " ").split(":")[0];
          setFactcheckLoading(false);
          setFactcheckStatus(status);
        })
        .catch(err => {
          setFactcheckLoading(false);
          setFactcheckError(err?.response?.data?.message || err?.message || 'An error occurred');
        });
    }
  };

  useEffect(() => {
    setOutlineComplete(outlineStatus === 'completed');
    setPostComplete(postStatus === 'Complete');
    setFactcheckComplete(factcheckStatus === 'completed');
    if (outlineStatus === "reset_completed") {
      setOutlineError('error: retry outline generation')
    }
    else {
      setOutlineError('')
    }
  }, [outlineStatus, postStatus, factcheckStatus]);

  const addLiveUrlClickHandler = (e) => {
    e.preventDefault();
    if (addLiveUrlHandler) {
      addLiveUrlHandler();
    }
  }

  const publishToWordPressClickHandler = (e) => {
    setWordPressPublishStatus('Publishing...')
    publishToWordPress(content_plan_outline_guid)
      .then(res => {
        if (res.data) {
          setWordPressPublishStatus('Published to WordPress')
          console.log(res.data)
        }
      })
  }


  useEffect(() => {
    let factcheckInterval;
    if (!factcheckComplete) {
      fetchFactcheckStatusData();
      factcheckInterval = setInterval(() => {
        fetchFactcheckStatusData();
      }, 60000);
    }
    return () => {
      if (factcheckInterval) {
        clearInterval(factcheckInterval);
      }
    };
  }, [factcheckComplete]);

  const checkIfIndexed = async (live_post_url: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('check-indexation', {
        body: { url: live_post_url },
      });

      if (error) {
        console.error('Error checking indexed status:', error);
        return null;
      }
      if (data) {
        console.log('Indexed status:', data);
        if (index_status === 'submitted' && data?.success === true) {
          supabase
            .from('tasks')
            .update({ index_status: 'indexed' })
            .eq('task_id', task_id)
            .select("*")
            .then(res => {
            })
        }
      }
      return data;
      // data will be: { indexed: boolean, url: string, message: string }
    } catch (err) {
      console.error('Failed to check indexed status:', err);
      return null;
    }
  };

  useEffect(() => {
    if (type === ContentType.POST && live_post_url && index_status !== 'indexed') {
      checkIfIndexed(live_post_url)
    }
  }, [live_post_url])



  const generateSchemaHandler = (e) => {
    e.preventDefault();
    if (schema_data) {
      setViewSchema(true)
    }
    else {
      setGenerateSchemaLoading(true);
      generateSchema(content_plan_outline_guid)
        .then(res => {

          setGenerateSchemaLoading(false)
        })
    }
  }
  const generateImagePromptHandler = (e) => {
    e.preventDefault();
    if (hero_image_prompt) {
      setViewImagePrompt(true)
    }
    else {
      setGenerateImagePromptLoading(true);
      generateImagePrompt(content_plan_outline_guid)
        .then(res => {

          setGenerateImagePromptLoading(false)
        })
    }
  }

  const generatePostClickHandler = (e) => {
    e.preventDefault();
    onGeneratePost();
  }

  const copyClickHandler = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(form.getState.schema_data).then(() => {
      setSchemaStatus('Copied to clipboard')
    }).catch(err => {
      setSchemaStatus('Error copying to clipboard')
    })
  }


  return (
    <div className="status-bar row d-flex align-items-center justify-content-start g-0 ">
      <div className="col-auto d-flex align-items-center">
        {(outlineComplete || (postStatus && !outlineStatus)) ?
          <>
            <a title="Generate Post" className="py-0 my-0 text-primary no-underline" onClick={showEditOutlineHandler}>Outline</a>
            <span className="badge rounded-pill  ms-1 p-1 bg-success"><i className="bi bi-check-lg text-white"></i></span>
          </>
          : outlineError ?
            <>
              <strong className="text-primary me-2">Outline Generation Error</strong> {outlineError}
            </>
            : outlineStatus ?
              <p className="mb-0 status">
                <strong className="text-primary me-2">Outline Status</strong> {keyToLabel(outlineStatus)}
              </p>
              : null
        }
      </div>
      {
        postStatus ? <div className="col-auto d-flex align-items-center">
          <i className="bi bi-chevron-right mx-1" />
          {postComplete ?
            <>
              <strong className="text-primary">Post</strong>
              <span className="badge rounded-pill ms-1 p-1 bg-success"><i className="bi bi-check-lg text-white"></i></span>
            </>
            :
            <p className="mb-0 status">
              <strong className="text-primary me-2">Post Status</strong> {keyToLabel(postStatus)}
            </p>
          }
        </div>
          :
          (onGeneratePost && outlineComplete) ?
            <div className="col-auto d-flex align-items-center">
              <i className="bi bi-chevron-right mx-1" />
              <div>
                <a title="Generate Post" className=" my-0 text-success no-underline" onClick={generatePostClickHandler}>Generate Post</a>
              </div>
            </div>
            : null
      }
      {(type === ContentType.POST && postComplete) && <>
        {
          hero_image_prompt ? <div className="col-auto d-flex align-items-center ">
            <i className="bi bi-chevron-right mx-1" />
            {hero_image_url ? <> <strong><a onClick={generateImagePromptHandler} className="text-primary my-0 py-0 no-underline">Hero Image</a></strong>
              <span className="badge rounded-pill ms-1 p-1 bg-success"><i className="bi bi-check-lg text-white"></i></span>
            </>
              : <a onClick={generateImagePromptHandler} className=" my-0 py-0 text-success no-underline"><i className="bi bi-plus" />Generate Image</a>}
          </div>
            :
            <div className="col-auto d-flex align-items-center ">
              <i className="bi bi-chevron-right mx-1" />
              {generateImagePromptLoading ? <span className="text-white"><TypeWriterText string="Generating" withBlink /></span> : <a onClick={generateImagePromptHandler} className=" my-0 py-0"> <span className="text-success">Generate Image Prompt</span></a>}
            </div>}
        {!live_post_url && <>
          <div className="col-auto d-flex align-items-center">
            <i className="bi bi-chevron-right mx-1" />
            {wordPressPublish && <>
              <a onClick={publishToWordPressClickHandler} className="text-success my-0 py-0"><i className="bi bi-wordpress" /> Publish</a>
              <span className="px-2">or</span>
            </>
            }
            <a onClick={addLiveUrlClickHandler} className="my-0 py-0 text-success no-underline"><i className="bi bi-plus" />Add Live Url</a>
          </div>
        </>}

      </>
      }
      {
        (type === ContentType.POST && live_post_url && postComplete) &&
        <div className="col-auto d-flex align-items-center">
          <i className="bi bi-chevron-right mx-1" />
          <a onClick={addLiveUrlClickHandler} className="my-0 py-0 text-primary no-underline">Live</a>
          <span className="badge rounded-pill ms-1 p-1 bg-success"><i className="bi bi-check-lg text-white"></i></span>
        </div>
      }
      {
        factcheckStatus && <div className="col-auto d-flex align-items-center ">
          <i className="bi bi-chevron-right mx-1" />
          {factcheckComplete ?
            <>
              <strong className="text-primary">Fact Check</strong>
              <span className="badge rounded-pill ms-1 p-1 bg-success"><i className="bi bi-check-lg text-white"></i></span>
            </>
            :
            <>
              <strong className="text-primary me-2">Fact Check Status</strong> <TypeWriterText withBlink string={keyToLabel(factcheckStatus)} />
            </>
          }
        </div>
      }
      {
        live_post_url && <>
          {
            schema_data ?
              <div className="col-auto d-flex align-items-center ">
                < i className="bi bi-chevron-right mx-1" />
                <strong><a onClick={generateSchemaHandler} className="text-primary my-0 py-0 no-underline">Schema</a></strong>
                <span className="badge rounded-pill ms-1 p-1 bg-success"><i className="bi bi-check-lg text-white"></i></span>
              </div>
              :
              <div className="col-auto d-flex align-items-center ">
                <i className="bi bi-chevron-right mx-1" />
                {generateSchemaLoading ? <TypeWriterText string='Generating' withBlink /> : <a onClick={generateSchemaHandler} className=" my-0 py-0"><span className="text-success">Generate Schema</span></a>}
              </div>}
          {index_status === 'indexed' ?
            <div className="col-auto d-flex align-items-center ">
              <i className="bi bi-chevron-right mx-1" />
              <strong className="text-primary">Indexed</strong>
              <span className="badge rounded-pill ms-1 p-1 bg-success"><i className="bi bi-check-lg text-white"></i></span>
            </div>
            : index_status === 'submitted' ?
              <div className="col-auto d-flex align-items-center ">
                <i className="bi bi-chevron-right mx-1" /> Submitted
                <a onClick={indexHandler} className=" ms-1 my-0 py-0 text-success no-underline">Re-Index Post</a>
              </div> :

              <div className="col-auto d-flex align-items-center ">
                <i className="bi bi-chevron-right mx-1" />
                <a onClick={indexHandler} className=" my-0 py-0 text-success no-underline">Index Post</a>
              </div>}
        </>
      }
      <Modal.Overlay open={viewSchema} onClose={() => { setViewSchema(null) }} closeIcon>
        <Modal.Title title="Schema" />
        <Modal.Description className="modal-medium">
          <Form controller={form}>
            <TextArea fieldName="schema_data" label="Schema" hint={`Here's the proper markup to put between your opening script tag of <script type="application/ld+json"> and closing script tag of </script>`} />
            <div className="row d-flex justify-content-between align-items-center g-0">
              <div className="col-auto d-flex align-items-center">
                <button onClick={copyClickHandler} className="btn btn-primary me-2" type="button"><i className="bi bi-copy me-2" />Copy</button>
              </div>
              {schemaStatus !== '' && <div className="col-auto d-flex align-items-center">
                <span className=""><TypeWriterText string={schemaStatus} withBlink /></span>
              </div>}
              <div className="col-auto d-flex align-items-center">
                <input type="submit" onClick={updateSchema} className="btn btn-primary" value="Update Schema" />
              </div>
            </div>
          </Form>

        </Modal.Description>
      </Modal.Overlay>
      <Modal.Overlay open={viewImagePrompt} onClose={() => { setViewImagePrompt(null) }} closeIcon>
        <HeroImageGenerator hero_image_prompt={hero_image_prompt} hero_image_url={hero_image_url} task_id={task_id} guid={content_plan_outline_guid} />
      </Modal.Overlay>
    </div >
  )
}
export default StatusBar