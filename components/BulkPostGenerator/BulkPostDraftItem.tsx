import { urlValidator } from "@/perfect-seo-shared-components/utils/validators";
import Checkbox from "../Form/Checkbox";
import TextInput from "../Form/TextInput";
import { useEffect, useState } from "react";
import SearchSelect from "../SearchSelect/SearchSelect";

const BulkPostDraftItem = ({ item: PostUploadItem, idx, form, arrayForm }) => {
  const [selected, setSelected] = useState({ label: 'English', value: 'English' });
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

  const languageChangeHandler = (e) => {
    setSelected(e);
    let formState = form.getState;
    formState.writing_language = e.value;
    form.setState(formState)
  }

  const [showCustomOutline, setShowCustomOutline] = useState(false);
  //     Keyword, Voice_URL, Outline_URL, Custom Outline Y or N, Outline Post Title

  // If custom outline = y then we MUST show the full outline on another view

  useEffect(() => {
    if (form?.getState?.[`custom_outline-${idx}`]) {
      setShowCustomOutline(true)
    }
    if (form?.getState?.[`writing_language-${idx}`] && selected.value !== form?.getState?.[`writing_language-${idx}`]) {
      setSelected({ label: form?.getState?.[`writing_language-${idx}`], value: form?.getState?.[`writing_language-${idx}`] })

    }
  }, [form?.getState])

  const toggleCustomOutline = (e) => {
    e.preventDefault();
    setShowCustomOutline(!showCustomOutline)
  }


  return (
    <div className='col-12'>
      <div className='card p-3 bg-secondary'>
        <div className='row d-flex justify-content-between align-items-center g-3'>
          <div className='col-12 col-md-4'>
            <TextInput fieldName={`outline_post_title-${idx}`} label="Outline Post Title" bottomSpacing={false} />
          </div>
          <div className='col-12 col-md-4'>
            <TextInput fieldName={`target_keyword-${idx}`} label="Target Keyword" bottomSpacing={false} />
          </div>
          <div className='col-12 col-md-4'>
            <TextInput fieldName={`excluded_topics-${idx}`} label="Excluded Topics" bottomSpacing={false} validator={urlValidator} />
          </div>
          <div className="col-12 col-md-4">
            <label htmlFor="writing_language">Writing Language</label>
            <SearchSelect value={selected} onChange={languageChangeHandler} options={languageOptions} fieldName="writing_language z-100" isClearable={false} isSearchable={true} />
          </div>
          <div className='col-12 col-md-4'>
            <TextInput fieldName={`domain_name-${idx}`} label="Domain" bottomSpacing={false} />
          </div>
          <div className='col-12 col-md-4'>
            <TextInput fieldName={`email-${idx}`} label="Email" bottomSpacing={false} />
          </div>

          <div className='col-12'>
            <TextInput fieldName={`outline_url-${idx}`} label="Outline URL" bottomSpacing={false} validator={urlValidator} />
          </div>
          <div className='col-12'>
            <TextInput fieldName={`voice_url-${idx}`} label="Voice URL" bottomSpacing={false} validator={urlValidator} />
          </div>
          <div className='col-12 col-md-6'>
            <Checkbox fieldName={`custom_outline-${idx}`} label="Custom Outline" bottomSpacing={false} />
          </div>
          {form?.getState[`custom_outline-${idx}`] && <div className='col-12 col-md-6 text-end'>
            <a className="text-primary" onClick={toggleCustomOutline}>{showCustomOutline ? 'Hide Custom Outline' : 'View Custom Outline'}</a>
          </div>}
          {showCustomOutline && <hr />}
          {showCustomOutline && <div className="col-12">

            <div className='row d-flex justify-content-between align-items-center g-3'>
              <div className="col-12 col-lg-6">
                <div className="card p-3">
                  <div className='row d-flex justify-content-between align-items-center g-3'>
                    <div className="col-12">
                      <h5 className="text-center mb-0">Section 1</h5>
                    </div>
                    <div className='col-12'>
                      <TextInput fieldName={`outline_section1_headline-${idx}`} label="Heading" bottomSpacing={false} validator={urlValidator} />
                    </div>
                    <div className='col-12 col-md-6'>
                      <TextInput fieldName={`outline_section1_subheadline1-${idx}`} label="Subheading 1" bottomSpacing={false} validator={urlValidator} />
                    </div>
                    <div className='col-12 col-md-6'>
                      <TextInput fieldName={`outline_section1_subheadline2-${idx}`} label="Subheading 2" bottomSpacing={false} validator={urlValidator} />
                    </div>
                    <div className='col-12 col-md-6'>
                      <TextInput fieldName={`outline_section1_subheadline3-${idx}`} label="Subheading 3" bottomSpacing={false} validator={urlValidator} />
                    </div>
                    <div className='col-12 col-md-6'>
                      <TextInput fieldName={`outline_section1_subheadline4-${idx}`} label="Subheading 4" bottomSpacing={false} validator={urlValidator} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-6">
                <div className="card p-3">
                  <div className='row d-flex justify-content-between align-items-center g-3'>
                    <div className="col-12">
                      <h5 className="text-center mb-0 mt-3">Section 2</h5>
                    </div>
                    <div className='col-12'>
                      <TextInput fieldName={`outline_section2_headline-${idx}`} label="Heading" bottomSpacing={false} validator={urlValidator} />
                    </div>
                    <div className='col-12 col-md-6'>
                      <TextInput fieldName={`outline_section2_subheadline1-${idx}`} label="Subheading 1" bottomSpacing={false} validator={urlValidator} />
                    </div>
                    <div className='col-12 col-md-6'>
                      <TextInput fieldName={`outline_section2_subheadline2-${idx}`} label="Subheading 2" bottomSpacing={false} validator={urlValidator} />
                    </div>
                    <div className='col-12 col-md-6'>
                      <TextInput fieldName={`outline_section2_subheadline3-${idx}`} label="Subheading 3" bottomSpacing={false} validator={urlValidator} />
                    </div>
                    <div className='col-12 col-md-6'>
                      <TextInput fieldName={`outline_section2_subheadline4-${idx}`} label="Subheading 4" bottomSpacing={false} validator={urlValidator} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-6">
                <div className="card p-3">
                  <div className='row d-flex justify-content-between align-items-center g-3'>
                    <div className="col-12">
                      <h5 className="text-center mb-0 mt-3">Section 3</h5>
                    </div>
                    <div className='col-12'>
                      <TextInput fieldName={`outline_section3_headline-${idx}`} label="Heading" bottomSpacing={false} validator={urlValidator} />
                    </div>
                    <div className='col-12 col-md-6'>
                      <TextInput fieldName={`outline_section3_subheadline1-${idx}`} label="Subheading 1" bottomSpacing={false} validator={urlValidator} />
                    </div>
                    <div className='col-12 col-md-6'>
                      <TextInput fieldName={`outline_section3_subheadline2-${idx}`} label="Subheading 2" bottomSpacing={false} validator={urlValidator} />
                    </div>
                    <div className='col-12 col-md-6'>
                      <TextInput fieldName={`outline_section3_subheadline3-${idx}`} label="Subheading 3" bottomSpacing={false} validator={urlValidator} />
                    </div>
                    <div className='col-12 col-md-6'>
                      <TextInput fieldName={`outline_section3_subheadline4-${idx}`} label="Subheading 4" bottomSpacing={false} validator={urlValidator} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-6">
                <div className="card p-3">
                  <div className='row d-flex justify-content-between align-items-center g-3'>
                    <div className="col-12">
                      <h5 className="text-center mb-0 mt-3">Section 4</h5>
                    </div>
                    <div className='col-12'>
                      <TextInput fieldName={`outline_section4_headline-${idx}`} label="Heading" bottomSpacing={false} validator={urlValidator} />
                    </div>
                    <div className='col-12 col-md-6'>
                      <TextInput fieldName={`outline_section4_subheadline1-${idx}`} label="Subheading 1" bottomSpacing={false} validator={urlValidator} />
                    </div>
                    <div className='col-12 col-md-6'>
                      <TextInput fieldName={`outline_section4_subheadline2-${idx}`} label="Subheading 2" bottomSpacing={false} validator={urlValidator} />
                    </div>
                    <div className='col-12 col-md-6'>
                      <TextInput fieldName={`outline_section4_subheadline3-${idx}`} label="Subheading 3" bottomSpacing={false} validator={urlValidator} />
                    </div>
                    <div className='col-12 col-md-6'>
                      <TextInput fieldName={`outline_section4_subheadline4-${idx}`} label="Subheading 4" bottomSpacing={false} validator={urlValidator} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-6">
                <div className="card p-3">
                  <div className='row d-flex justify-content-between align-items-center g-3'>
                    <div className="col-12">
                      <h5 className="text-center mb-0 mt-3">Section 5</h5>
                    </div>
                    <div className='col-12'>
                      <TextInput fieldName={`outline_section5_headline-${idx}`} label="Heading" bottomSpacing={false} validator={urlValidator} />
                    </div>
                    <div className='col-12 col-md-6'>
                      <TextInput fieldName={`outline_section5_subheadline1-${idx}`} label="Subheading 1" bottomSpacing={false} validator={urlValidator} />
                    </div>
                    <div className='col-12 col-md-6'>
                      <TextInput fieldName={`outline_section5_subheadline2-${idx}`} label="Subheading 2" bottomSpacing={false} validator={urlValidator} />
                    </div>
                    <div className='col-12 col-md-6'>
                      <TextInput fieldName={`outline_section5_subheadline3-${idx}`} label="Subheading 3" bottomSpacing={false} validator={urlValidator} />
                    </div>
                    <div className='col-12 col-md-6'>
                      <TextInput fieldName={`outline_section5_subheadline4-${idx}`} label="Subheading 4" bottomSpacing={false} validator={urlValidator} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-6">
                <div className="card p-3">
                  <div className='row d-flex justify-content-between align-items-center g-3'>
                    <div className="col-12">
                      <h5 className="text-center mb-0 mt-3">Section 6</h5>
                    </div>
                    <div className='col-12'>
                      <TextInput fieldName={`outline_section6_headline-${idx}`} label="Heading" bottomSpacing={false} validator={urlValidator} />
                    </div>
                    <div className='col-12 col-md-6'>
                      <TextInput fieldName={`outline_section6_subheadline1-${idx}`} label="Subheading 1" bottomSpacing={false} validator={urlValidator} />
                    </div>
                    <div className='col-12 col-md-6'>
                      <TextInput fieldName={`outline_section6_subheadline2-${idx}`} label="Subheading 2" bottomSpacing={false} validator={urlValidator} />
                    </div>
                    <div className='col-12 col-md-6'>
                      <TextInput fieldName={`outline_section6_subheadline3-${idx}`} label="Subheading 3" bottomSpacing={false} validator={urlValidator} />
                    </div>
                    <div className='col-12 col-md-6'>
                      <TextInput fieldName={`outline_section6_subheadline4-${idx}`} label="Subheading 4" bottomSpacing={false} validator={urlValidator} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>}
        </div>
      </div>
    </div>
  )
}

export default BulkPostDraftItem;