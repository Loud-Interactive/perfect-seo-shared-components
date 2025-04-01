/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import styles from "./CreateContentModal.module.scss";
import OutlineRow from "./OutlineRow/OutlineRow";
import { OutlineRowProps } from '@/perfect-seo-shared-components/data/types'
import useForm from "@/perfect-seo-shared-components/hooks/useForm";
import Form from "@/perfect-seo-shared-components/components/Form/Form";
import * as Modal from "@/perfect-seo-shared-components/components/Modal/Modal";
import TextInput from "@/perfect-seo-shared-components/components/Form/TextInput";
import useViewport from "@/perfect-seo-shared-components/hooks/useViewport";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { GenerateContentPost, GetPostOutlineRequest, RegeneratePost, SaveContentPost } from "@/perfect-seo-shared-components/data/requestTypes";
import { fetchOutlineData, regenerateHTML, regenerateHTMLfromDoc, saveContentPlanPost } from "@/perfect-seo-shared-components/services/services";
import { createPost, regenerateOutline } from "@/perfect-seo-shared-components/services/services";
import Loader from "@/perfect-seo-shared-components/components/Loader/Loader";
import { selectEmail, selectPoints } from "@/perfect-seo-shared-components/lib/features/User";
import RegeneratePostModal, { GenerateTypes } from "../RegeneratePostModal/RegeneratePostModal";
import { createClient } from "@/perfect-seo-shared-components/utils/supabase/client";

interface CreateContentModalProps {
  data: any;
  advancedData?: any;
  onClose: () => void;
  contentPlan?: any;
  titleChange?: (e: any, title: string, index: number) => any;
  index?: number;
  regenerateHandler: () => void
  isAuthorized: boolean;
  standalone?: boolean;
  track?: boolean;
  generatePost?: boolean
}

const CreateContentModal = ({
  data,
  onClose,
  contentPlan,
  titleChange,
  isAuthorized,
  index,
  advancedData,
  regenerateHandler,
  standalone,
  generatePost,
  track
}: CreateContentModalProps) => {
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState<OutlineRowProps[]>(null);
  const [selected, setSelected] = useState<number>(null);
  const [all, setAll] = useState<boolean>(true);
  const [outlineGUID, setOutlineGUID] = useState<string>(null);
  const form = useForm();
  const [postTitle, setPostTitle] = useState();
  const titleForm = useForm();
  const { phone, portrait } = useViewport();
  const [creatingPost, setCreatingPost] = useState(generatePost || false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const supabase = createClient()
  const router = useRouter();
  const points = useSelector(selectPoints)
  const email = useSelector(selectEmail)
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('generate');
  const pathname = usePathname()


  const closeHandler = () => {
    form.setState({});
    onClose();
  }

  useEffect(() => {
    if (data?.post_title || data?.["Post Title"] || data?.title) {
      titleForm.setState({ title: data["Post Title"] || data?.post_title || data?.title });
      setPostTitle(data["Post Title"] || data?.post_title || data?.title);
    }
  }, [data]);

  const postClickHandler = (e) => {
    e.preventDefault();
    setCreatingPost(true);
  };

  useEffect(() => {
    if (queryParam) {
      setCreatingPost(true);
      router.replace(pathname);
    }
  }, [queryParam]);



  useEffect(() => {
    setSaved(false)
  }), [titleForm?.getState?.title]

  const titleChangeHandler = (e) => {
    e.preventDefault();

    if (titleChange) {
      setSaving(true);
      titleChange(null, titleForm.getState.title, index)
        .then(res => {
          setSaved(true);
          setSaving(false);
        })
        .catch(err => {
          setSaving(false)

        }
        )
    }
  }

  const TitleSaveButton = () => {
    if (!isAuthorized || standalone) return ''
    return (
      <div className="d-flex h-100 align-items-center justify-content-center">
        <button className="btn btn-transparent d-flex align-items-center justify-content-center" onClick={titleChangeHandler} title="Save Live Url" disabled={saving}>

          {saving ?
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div> : saved ? <i className="bi bi-check-circle-fill" /> : <i className="bi bi-floppy-fill" />}</button>
      </div>
    )
  }

  const processSections = (data, initial?) => {
    if (!data?.length) {
      return form.setState({})
    }
    let newFormData = data?.reduce((prev, curr, i) => {
      let newHeadingData = { [`heading-${i}`]: curr.title };
      let newSubheadingData = curr.subheadings.reduce((sPrev, sCurr, sI) => {
        let newSubheadingObject = { [`${i}-subheading-${sI}`]: sCurr };

        return { ...sPrev, ...newSubheadingObject };
      }, {});

      return { ...prev, ...newHeadingData, ...newSubheadingData };
    }, {});
    setTableData(data);
    setLoading(false)
    if (initial) {
      form.setState(newFormData);
    }
  };

  const reorderRow = (draggedRowIndex: number, targetRowIndex: number) => {
    let newTableData = convertToTableData(form.getState);
    newTableData.splice(
      targetRowIndex,
      0,
      newTableData.splice(draggedRowIndex, 1)[0],
    );
    processSections([...newTableData], true);
  };

  const reorderSubheadingRow = (
    draggedRowIndex: number,
    targetRowIndex: number,
    arrayIndex: number,
  ) => {
    let newTableData = convertToTableData(form.getState);
    let newSubheadings = newTableData[arrayIndex].subheadings as string[];

    newSubheadings.splice(
      targetRowIndex,
      0,
      newSubheadings.splice(draggedRowIndex, 1)[0],
    );
    newTableData[arrayIndex].subheadings = [...newSubheadings];

    processSections(newTableData, true);
  };

  const convertToTableData = (object) => {
    return Object.keys(object).reduce((prev, curr) => {
      if (curr.startsWith("heading-")) {
        let headingIndex = curr.split("-")[1];
        let newHeading = {
          title: object[curr],
          subheadings: Object.keys(object)
            .filter((key) => {
              return key.startsWith(`${headingIndex}-subheading`);
            })
            .reduce((sPrev, sCurr, i) => {
              let subheadingKey = `${headingIndex}-subheading-`;

              return [...sPrev, object[`${subheadingKey}${i}`]];
            }, []),
        };

        return [...prev, newHeading];
      } else {
        return prev;
      }
    }, []);
  };

  const deleteSubheading = (headingIndex: number, index: number) => {
    let newContentPlan = convertToTableData(form.getState);
    let newSubheadings = [
      ...newContentPlan[headingIndex].subheadings.slice(0, index),
      ...newContentPlan[headingIndex].subheadings.slice(index + 1),
    ];
    newContentPlan[headingIndex].subheadings = newSubheadings as string[];
    processSections(newContentPlan, true);
  };

  const deleteHeading = (index: number) => {
    let newTableData = convertToTableData(form.getState);
    let newContentPlan = [
      ...newTableData.slice(0, index),
      ...newTableData.slice(index + 1),
    ];
    processSections(newContentPlan, true);
  };

  const addSectionHandler = () => {
    let blankRow = {
      title: "",
      subheadings: [""],
    };
    let newformData = convertToTableData(form.getState);

    processSections([blankRow, ...newformData], true);
  };

  const pullOutline = (initial?) => {
    setLoading(true);
    if (data.guid) {
      setOutlineGUID(data.guid)
    }
    // if (standalone) {
    let guid = data.content_plan_outline_guid || data.guid;
    fetchOutlineData(guid)
      .then(res => {
        if (res.data[0]?.outline) {
          let outline = JSON.parse(res.data[0].outline)
          if (outline?.sections?.length > 0) {
            processSections(outline.sections, initial);
            setLoading(false)
          }
        }
      })
    // } 
    // else {
    //   let reqObj: GetPostOutlineRequest = {
    //     client_name: contentPlan?.brand_name,
    //     content_plan_guid: contentPlan?.guid,
    //     post_title: data['Post Title'] || data?.post_title || postTitle,
    //     priority_code: contentPlan?.priorityCode || '',
    //     client_domain: contentPlan?.domain_name || contentPlan?.client_domain,
    //     inspiration_url_1: contentPlan?.inspiration_url_1,
    //     priority1: contentPlan?.inspiration_url_1_priority || undefined,
    //     inspiration_url_2: contentPlan?.inspiration_url_2,
    //     priority2: contentPlan?.inspiration_url_2_priority || undefined,
    //     inspiration_url_3: contentPlan?.inspiration_url_3,
    //     priority3: contentPlan?.inspiration_url_3_priority || undefined,
    //   };

    //   getContentPlanOutline(reqObj)
    //     .then((res) => {
    //       setLoading(false);
    //       let newData;
    //       if (typeof res.data.outline === "string") {
    //         newData = JSON.parse(res.data.outline);
    //       } else {
    //         newData = res.data.outline;
    //       }
    //       setOutlineGUID(res.data.guid);
    //       if (typeof newData === "string") {
    //         newData = JSON.parse(newData);
    //       }
    //       if (newData?.sections) {
    //         if (newData.sections.length > 0) {
    //           processSections(newData.sections, initial);
    //         }
    //       }
    //     })
    //     .catch((err) => {
    //       if (data.guid) {
    //         fetchOutlineData(data.guid)
    //           .then(res => {
    //             console.log("outline status", res.data)
    //             if (res?.data[0].outline?.sections?.length > 0) {
    //               processSections(res.data[0].outline.sections, initial);
    //             }
    //           })
    //       }
    //     });
    // }
  };

  useEffect(() => {
    if (contentPlan || standalone) {
      pullOutline(true);
    }
  }, [contentPlan, standalone]);


  const saveHandler = (click?: boolean) => {
    setSaving(true)
    if (!loading) {
      let reqBody: SaveContentPost = {
        post_title: postTitle,
        outline_details: { sections: [...convertToTableData(form.getState)] },
        content_plan_guid: contentPlan?.guid || data?.content_plan_guid,
        client_name: contentPlan?.brand_name || contentPlan?.client_name || data?.client_name || data?.brand_name || data?.client_name,
        client_domain: contentPlan?.domain_name || contentPlan?.client_domain || data?.client_domain || data?.domain,
      };
      if (outlineGUID !== contentPlan?.guid) {
        reqBody.guid = outlineGUID;
      }
      if (reqBody?.outline_details?.sections?.length === 0) {
        return console.log('No data to save', reqBody.outline_details)
      }
      saveContentPlanPost(reqBody)
        .then((res) => {
          setSaving(false);
          if (click) {
            setSaved(true);
          }
        })
        .catch((err) => {
          setSaving(false);
        });
    }
  };

  const postClickSaveHandler = (e?) => {
    e?.preventDefault();
    setSaved(false);
    setSaving(true);
    saveHandler(true);
  };


  const submitWithEmail = (receivingEmail, language?) => {


    let reqBody: GenerateContentPost = {
      outline: { sections: [...convertToTableData(form.getState)] },
      email: email,
      seo_keyword: data.Keyword || data.keyword,
      content_plan_keyword: contentPlan?.target_keyword || data?.keyword,
      entity_voice: contentPlan?.entity_voice,
      keyword: postTitle,
      content_plan_guid: contentPlan.guid,
      content_plan_outline_guid: outlineGUID,
      client_name: contentPlan.brand_name || contentPlan.client_name,
      client_domain: contentPlan.domain_name || contentPlan.client_domain,
      receiving_email: receivingEmail,
      writing_language: language || 'English'
    };

    setSubmitted(true);
    return createPost(reqBody)
  };
  const submitHTMLStylingHandler = (receivingEmail, language?) => {
    let reqBody: RegeneratePost = {
      email: email,
      receiving_email: receivingEmail,
      content_plan_outline_guid: outlineGUID,
    };

    setSubmitted(true);
    return regenerateHTML(reqBody)
  };
  const submitGoogleDocRegenerateHandler = (receivingEmail, language?) => {
    let reqBody: RegeneratePost = {
      email: email,
      receiving_email: receivingEmail,
      content_plan_outline_guid: outlineGUID,
    };

    setSubmitted(true);
    return regenerateHTMLfromDoc(reqBody)
  };

  const regenerateClickHandler = () => {
    setLoading(true);
    regenerateOutline(
      outlineGUID,
      { email: email, client_domain: contentPlan?.domain_name || contentPlan?.client_domain, client_name: contentPlan?.brand_name || contentPlan?.client_name, post_title: postTitle, content_plan_guid: contentPlan?.guid || data.content_plan_guid }
    )
      .then((result) => {
        regenerateHandler();
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const addSubheading = (i: number) => {
    let newTableData = convertToTableData(form.getState);
    let newArray = newTableData[i].subheadings;
    newArray = [...(newArray as string[]), ""];
    newTableData[i].subheadings = newArray;
    processSections(newTableData, true);
  };

  const buyCreditsHandler = () => {
    window.open("/my-credits", "_blank");
  };

  return (
    <>
      <Modal.Title title={postTitle} className={styles.header}>
        <h2 className="modal-title" id="outlineEditorModalLabel">
          Review/Edit Your Outline
        </h2>
        <button
          className={`${styles.closeButton}
        btn
        btn-warning`}
          data-bs-dismiss="modal"
          aria-label="Close"
          onClick={closeHandler}
        >
          x
        </button>
      </Modal.Title>
      <Modal.Description>
        <div className={styles.modal}>
          {loading ? (
            <Loader />
          ) : (
            <div className={styles.content}>
              <div className="modal-body p-3">
                <p>
                  <b>Please review and edit the outline provided below</b>.
                </p>
                <p>
                  {isAuthorized ? 'You' : 'Users'} can directly modify the content, rearrange sections or subsections through drag and drop, remove any parts, or add new elements as needed.
                </p>
                {isAuthorized ? <p>
                  After finalizing the outline to your satisfaction,<strong className="mx-1 text-primary">
                    save your changes
                  </strong>. Then, to generate the post based on this outline, click on
                  <strong className="mx-1 text-primary">
                    create post
                  </strong>
                  located in the bottom right corner.
                </p> : <>
                  <p>Sign up or login to make changes to this outline!
                  </p><p className="text-primary"><small><i>*contentPerfect.ai uses <a href="https://www.google.com/sitemaps" target="_blank">Google Search Console</a> to confirm domain ownership. Please make sure you have access to the content plans domain for access</i></small></p>
                </>
                }
                <Form controller={titleForm}>
                  <div className="p-2">
                    <TextInput
                      fieldName="title"
                      label="Post Title"
                      disabled={!isAuthorized || saving}
                      button={<TitleSaveButton />}
                    />
                  </div>
                </Form>
                <hr />
                <div className={styles.utilityBar}>
                  <div className={styles.utilityBarGroup}>
                    <button
                      className="btn btn-primary"
                      disabled={!isAuthorized}
                      onClick={(e) => {
                        e.preventDefault();
                        regenerateClickHandler();
                      }}
                    >
                      regenerate outline
                    </button>
                    <button
                      disabled={!isAuthorized}
                      className="btn btn-primary"
                      onClick={(e) => {
                        e.preventDefault();
                        addSectionHandler();
                      }}
                    >
                      + add section
                    </button>
                  </div>
                  <div className={styles.utilityBarGroup}>
                    <button
                      className="btn btn-primary"
                      onClick={(e) => {
                        e.preventDefault();
                        setAll(false);
                      }}
                    >
                      collapse all
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={(e) => {
                        e.preventDefault();
                        setAll(true);
                      }}
                    >
                      expand all
                    </button>
                  </div>
                </div>
              </div>
              <hr />
              <Form controller={form}>
                <div className={styles.contentForm}>
                  {tableData?.length > 0 ? (
                    tableData.map((heading: OutlineRowProps, i) => {
                      return (
                        <OutlineRow
                          addSubheading={addSubheading}
                          deleteHeadingHandler={deleteHeading}
                          deleteSubheadingHandler={deleteSubheading}
                          reorderSubheadingRow={reorderSubheadingRow}
                          reorderRow={reorderRow}
                          isAuthorized={isAuthorized}
                          setSelected={setSelected}
                          selected={selected}
                          index={i}
                          rows={heading?.subheadings?.length}
                          key={`heading-${i}`}
                          all={all}
                        />
                      );
                    })
                  ) : (
                    <span>This outline has no data</span>
                  )}
                </div>
              </Form>
            </div>
          )}
        </div>
      </Modal.Description>
      <Modal.Footer className={styles.footer}>
        {phone && portrait && (
          <span className={styles.warning}>
            Rotate your phone for the best content creation experience
          </span>
        )}
        <div className={styles.footerButtons}>
          <button
            className={`${styles.closeButton} btn btn-warning bg-warning text-dark`}
            data-bs-dismiss="modal"
            aria-label="Close"
            onClick={closeHandler}
          >
            x
          </button>
          <div className={styles.footerButtonsGroup}>
            <button
              id="createContentBtn2"
              className="btn btn-primary"
              onClick={postClickSaveHandler}
              disabled={!isAuthorized || saving}
            >
              {saved ? "saved" : saving ? null : "save outline"}
              {saving && (
                <div className="spinner-border text-light" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              )}
            </button>
            <button
              id="createContentBtn2"
              className="btn btn-primary"
              disabled={!isAuthorized}
              onClick={postClickHandler}
            >
              create post
            </button>
          </div>
        </div>
      </Modal.Footer>
      <Modal.Overlay
        open={creatingPost}
        onClose={() => setCreatingPost(false)}
        closeIcon
      >
        <Modal.Title title="Generate Your Post" />
        <RegeneratePostModal submitGoogleDocRegenerateHandler={submitGoogleDocRegenerateHandler} submitHTMLStylingHandler={submitHTMLStylingHandler} submitHandler={submitWithEmail} onClose={() => setCreatingPost(false)} onSuccess={onClose} type={GenerateTypes.GENERATE} />
      </Modal.Overlay >
    </>
  );
};

export default CreateContentModal;
