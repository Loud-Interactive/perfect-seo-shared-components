'use client'
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import classNames from "classnames";
import Form from "@/perfect-seo-shared-components/components/Form/Form";
import TextInput from "@/perfect-seo-shared-components/components/Form/TextInput";
import * as Select from "@/perfect-seo-shared-components/components/Form/Select";
import SearchSelect from "@/perfect-seo-shared-components/components/SearchSelect/SearchSelect";
import { domainValidator, emailValidator } from "@/perfect-seo-shared-components/utils/validators";
import { addIncomingPlanItem, getSynopsisInfo } from "@/perfect-seo-shared-components/services/services";
import { convertFormDataToOutgoing, urlSanitization } from "@/perfect-seo-shared-components/utils/conversion-utilities";
import useForm from "@/perfect-seo-shared-components/hooks/useForm";
import { createClient } from "@/perfect-seo-shared-components/utils/supabase/client";
import { selectEmail, selectIsLoggedIn } from "@/perfect-seo-shared-components/lib/features/User";
import { ContentRequestFormProps } from "@/perfect-seo-shared-components/data/types";
import styles from "./ContentPlanForm.module.scss";


const blankFormData: ContentRequestFormProps = {
  email: "",
  domainName: "",
  brandName: "",
  targetKeyword: "",
};

const blankForm: Partial<ContentRequestFormProps> = {
  priority1: "high",
  priority2: "high",
  priority3: "high",
};

interface ContentPlanFormProps {
  buttonLabel: string,
  initialData?: ContentRequestFormProps
  submitResponse: (guid?) => void
  isModal?: boolean
}

const ContentPlanForm = ({ buttonLabel, initialData, submitResponse, isModal }: ContentPlanFormProps) => {
  // Redux Selectors 
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const email = useSelector(selectEmail);

  // State hooks 
  const [selected, setSelected] = useState({ label: 'English', value: 'English' });
  const [load, setLoad] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);


  const form = useForm();

  const supabase = createClient();

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

  // Check if domain is in the database
  const checkDomain = (domain) => {
    supabase
      .from('domains')
      .select("*")
      .eq('domain', urlSanitization(domain))
      .select()
      .then(res => {
        if (res.data.length === 0) {
          console.log("Domain not found")
          supabase
            .from('domains')
            .insert([
              { 'domain': urlSanitization(domain) }
            ])
            .select()
            .then(res => { console.log(res) })
        }
      })
  }

  // Click Handler
  const clickHandler = (e) => {
    setLoad(true);
    e.preventDefault();
    let validateFields = isLoggedIn ? ["email"] : ["email", "domainName"];
    if (form.validate({ validatorFields: validateFields, requiredFields: ['email', 'brandName', 'targetKeyword'] })) {
      let newData = JSON.stringify(form.getState);
      localStorage.setItem("formData", newData);
      checkDomain(form.getState.domainName);
      supabase
        .from('user_history')
        .insert({ email: email, domain: form?.getState?.domainName, transaction_data: form.getState, product: 'contentPerfect', type: "CREATE", action: "Create Plan" })
        .select('*')
        .then(res => {

        })
      addIncomingPlanItem(
        convertFormDataToOutgoing(form.getState as ContentRequestFormProps),
      )
        .then(async (res) => {

          if (res.data.guid) {
            setLoad(false);
            submitResponse(res.data.guid);
          }
        })
        .catch((err) => {
          console.log(err);
          setLoad(false);
        });
    }
    else {
      setLoad(false);
    }
  };

  const buttonClasses = classNames("btn btn-warning", {
    "btn-secondary": load,
  });

  const clickAdvancedHandler = (e) => {
    e.preventDefault();
    setShowAdvanced((showing) => !showing);
  };


  useEffect(() => {
    let formState = blankForm;

    if (email) {
      formState.email = email
    }

    form.setState(formState);
  }, [email])

  useEffect(() => {
    if (initialData) {

      if (!initialData?.brandName) {
        getSynopsisInfo(initialData?.domainName)
          .then((res) => {
            if (res.data) {
              form.setState({ ...initialData, brandName: res.data.brand_name })
            }
          })
      }
      else {
        form.setState(initialData)
      }
    }
  }, [initialData])



  const languageChangeHandler = (e) => {
    setSelected(e);
    let formState = form.getState;
    formState.writing_language = e.value;
    form.setState(formState)
  }

  return (
    <div className="w-100">
      <Form controller={form}>
        <div className="row g-3">
          <div className="form-group col-12 col-md-6">
            <label htmlFor="email">
              Email
              <span className={styles.subLabel}>
                Where are we sending the content?
              </span>
            </label>
            <TextInput validator={emailValidator} autoComplete="email" required fieldName="email" />
          </div>
          <div className="form-group col-12 col-md-6">
            <label htmlFor="domainName">
              Website
              <span className={styles.subLabel}>
                Which website is this going on?
              </span>
            </label>
            <TextInput validator={domainValidator} fieldName="domainName" required />
          </div>
          <div className="form-group col-12 col-md-6">
            <label htmlFor="brandName">
              Brand
              <span className={styles.subLabel}>
                What’s the brand name?
              </span>
            </label>
            <TextInput fieldName="brandName" required />
          </div>
          <div className="form-group col-12 col-md-6">
            <label htmlFor="targetKeyword">
              <div>
                Keyword <i className="text-warning">*</i>
              </div>
              <span className={styles.subLabel}>What’s the topic?</span>
            </label>
            <TextInput fieldName="targetKeyword" required />
          </div>
        </div>
        {/* <!-- Advanced section that is hidden by default --> */}
        {showAdvanced && (
          <div className="row g-3" id="advancedSection">
            <div className="form-group col-12 col-md-6 col-lg-4">
              <label htmlFor="entityVoice">Entity Voice</label>
              <TextInput fieldName="entityVoice" />
            </div>
            <div className="form-group col-12 col-md-6 col-lg-4">
              <label htmlFor="priorityCode">Priority Code</label>
              <TextInput fieldName="priorityCode" />
            </div>
            <div className="form-group col-12 col-md-6 col-lg-4">
              <label htmlFor="writing_language">Writing Language</label>
              <SearchSelect value={selected} onChange={languageChangeHandler} options={languageOptions} fieldName="writing_language" isClearable={false} isSearchable={true} />
            </div>
            <h4>URLs for Inspiration</h4>
            <div className="col-12">
              <div className="row">
                <div className="col">
                  <label>URL 1</label>
                  <TextInput fieldName="url1" />
                </div>
                <div className="col-auto">
                  <label>Priority</label>
                  <Select.Select fieldName="priority1">
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </Select.Select>
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="row">
                <div className="col">
                  <label>URL 2</label>
                  <TextInput fieldName="url2" />
                </div>
                <div className="col-auto">
                  <label>Priority</label>
                  <Select.Select fieldName="priority2">
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </Select.Select>
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="row">
                <div className="col">
                  <label>URL 3</label>
                  <TextInput fieldName="url3" />
                </div>
                <div className="col-auto">
                  <label>Priority</label>
                  <Select.Select fieldName="priority3">
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </Select.Select>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* <!-- Advanced section link --> */}
        <div className="mb-3 text-center">
          <a onClick={clickAdvancedHandler} id="advancedLink">
            {showAdvanced ?
              <span>
                <i className='bi bi-caret-up-fill' /> Hide Advanced
              </span>
              :
              <span>
                <i className='bi bi-caret-down-fill' /> Show Advanced
              </span>}
          </a>
        </div>
        <div className="text-center justify-content-center d-flex flex-column align-items-center">
          <div>
            <button
              id="startButton"
              className={buttonClasses}
              disabled={load}
              onClick={clickHandler}
              type="submit"
            >
              {buttonLabel}
            </button>
          </div>
          {isModal &&
            <p className="mt-3 text-warning"><small>*Please note it may take up to 5 minutes for your new plan to appear on you plans list.</small></p>}
        </div>
      </Form>
    </div>
  )
}

export default ContentPlanForm