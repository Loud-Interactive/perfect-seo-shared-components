'use client'
import * as Modal from "@/perfect-seo-shared-components/components/Modal/Modal";
import { selectEmail, selectPoints } from "@/perfect-seo-shared-components/lib/features/User";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import SearchSelect from "../SearchSelect/SearchSelect";

export enum GenerateTypes {
  REGENERATE,
  GENERATE
}

interface RegeneratePostModalProps {
  onClose: () => void;
  submitHandler: (email, language?: string) => Promise<any>
  type: GenerateTypes;
  onSuccess: () => void;
  submitHTMLStylingHandler: (email, language?: string) => Promise<any>;
  submitGoogleDocRegenerateHandler: (email, language?: string) => Promise<any>;
}

const RegeneratePostModal = ({ onClose, type, submitHandler, onSuccess, submitHTMLStylingHandler, submitGoogleDocRegenerateHandler }: RegeneratePostModalProps) => {
  const points = useSelector(selectPoints)
  const [showConfirm, setShowConfirm] = useState(false)
  const email = useSelector(selectEmail)
  const [receivingEmail, setReceivingEmail] = useState(undefined);
  const [submitted, setSubmitted] = useState(false);

  const regenerate = type === GenerateTypes.REGENERATE;
  const languageOptions = [
    "English",
    "Arabic",
    "Bengali",
    "Bulgarian",
    "Chinese (Simplified)",
    "Chinese (Traditional)",
    "Czech",
    "Danish",
    "Dutch",
    "English",
    "Finnish",
    "French",
    "German",
    "Greek",
    "Hebrew",
    "Hindi",
    "Hungarian",
    "Indonesian",
    "Italian",
    "Japanese",
    "Korean",
    "Malay",
    "Norwegian",
    "Polish",
    "Portuguese",
    "Romanian",
    "Russian",
    "Slovak",
    "Spanish",
    "Swedish",
    "Thai",
    "Turkish",
    "Ukrainian",
    "Urdu",
    "Vietnamese"
  ].map((language) => ({ label: language, value: language }))

  useEffect(() => {
    if (email) {
      setReceivingEmail(email);
    }
  }, [email]);


  useEffect(() => {
    let timeout;
    if (submitted) {
      timeout = setTimeout(() => {
        setSubmitted(false)
        setSubmitError("There was an error submitting your post. Please try again.")
      }, 30000)
    }
    return () => {
      clearTimeout(timeout)
    }
  }, [submitted])

  const generatePostHandler = () => {
    setSubmitError(null)
    setSubmitted(true)
    submitHandler(receivingEmail, langSelected.value)
      .then(() => {
        setShowConfirm(true);
        setSubmitted(false)
      })
      .catch(() => {
        setSubmitError("There was an error submitting your post. Please try again.")
        setSubmitted(false)
      });
  }
  const regenerateFromGoogleDoc = () => {
    setSubmitError(null)
    setSubmitted(true)
    submitGoogleDocRegenerateHandler(receivingEmail, langSelected.value)
      .then(() => {
        setShowConfirm(true);
        setSubmitted(false)
      })
      .catch(() => {
        setSubmitError("There was an error submitting your post. Please try again.")
        setSubmitted(false)
      });
  }

  const regenerateHTMLStylingHandler = () => {
    setSubmitError(null)
    setSubmitted(true)
    submitHTMLStylingHandler(receivingEmail, langSelected.value)
      .then(() => {
        setShowConfirm(true);
        setSubmitted(false)
      })
      .catch(() => {
        setSubmitError("There was an error submitting your post. Please try again.")
        setSubmitted(false)
      });
  }
  const buyCreditsHandler = () => {
    window.open("/my-credits", "_blank");
  };

  const [submitError, setSubmitError] = useState("");
  const [langSelected, setLangSelected] = useState({ label: 'English', value: 'English' });



  const languageChangeHandler = (e) => {
    setLangSelected(e);
  }


  return (
    <>  <Modal.Title title="Generate Your Post" />
      <div className="p-5">
        <h3 className="mb-3">{regenerate ? 'Reg' : 'G'}enerate Your Post</h3>
        {regenerate ? <div className="my-4">
          Would you like to regenerate this post?
        </div>
          : <div className="my-4">
            You currently have <strong className="text-primary mx-0">{points?.toLocaleString() || 0}</strong> credits available.
            {points <= 3000 ? (
              <>
                You need at least <strong className="text-primary mx-1">3,000</strong> credits to
                generate this post.
              </>
            ) : (
              <>
                This post generation will use <strong className="text-primary mx-1">3,000</strong> credits.
              </>
            )}
            {points <= 3000 ? (
              <p className="mt-3">Would you like to purchase more credits?</p>
            ) : (
              <p className="mt-3">
                Would you like to use <strong className="text-primary mx-1">3,000</strong> credits to
                generate this post?
              </p>
            )}
          </div>
        }
        {(points >= 3000 || regenerate) && <div className="my-4">
          <p>What email address would you like your post sent to?</p>
          <input
            type="text"
            className="form-control"
            value={receivingEmail}
            onChange={(e) => {
              e.preventDefault();
              setReceivingEmail(e.target.value);
            }}
          />
          <div className="mt-3">
            <label htmlFor="writing_language">Writing Language</label>
            <SearchSelect value={langSelected} onChange={languageChangeHandler} options={languageOptions} fieldName="writing_language z-100" isClearable={false} isSearchable={true} />
            {submitError && <p className="text-danger mt-3">{submitError}</p>}
          </div>
        </div>}
      </div>
      <Modal.Footer>
        <Modal.ButtonBar>
          <button
            className="btn btn-warning btn-standard"
            onClick={(e) => {
              e.preventDefault();
              onClose();
            }}
          >
            go back
          </button>
          {type === GenerateTypes.REGENERATE && (
            <button
              className="btn btn-primary btn-standard"
              onClick={(e) => {
                e.preventDefault();
                regenerateFromGoogleDoc();
              }}
            >
              Regenerate Post from Google Doc
            </button>
          )}
          {type === GenerateTypes.REGENERATE && (
            <button
              className="btn btn-primary btn-standard"
              onClick={(e) => {
                e.preventDefault();
                regenerateHTMLStylingHandler();
              }}
            >
              Regenerate HTML Document Styling
            </button>
          )}
          <button
            className="btn btn-primary btn-standard"
            onClick={(e) => {
              e.preventDefault();
              if (submitted) {
                return;
              }
              if (regenerate || points > 3000) {
                generatePostHandler()
              }
              else {
                buyCreditsHandler();
              }
            }}
          >
            {submitted ?
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              :
              points > 3000 ? <span className="px-3">yes</span> : "buy credits"
            }
          </button>
        </Modal.ButtonBar>
      </Modal.Footer>
      <Modal.Overlay closeIcon open={showConfirm} onClose={onClose}>
        <Modal.Title title="Post Generation" />
        <div className="p-5 d-flex flex-column align-items-center">
          <h3 className="mb-5">Your post is being generated</h3>
          <div>
            <button
              className="btn btn-warning"
              onClick={(e) => {
                e.preventDefault();
                setShowConfirm(false);
                onSuccess();
              }}
            >
              close
            </button>
          </div>
        </div>
      </Modal.Overlay>
    </>
  )
}
export default RegeneratePostModal