import { urlValidator } from "@/perfect-seo-shared-components/utils/validators";
import Checkbox from "../Form/Checkbox";
import TextInput from "../Form/TextInput";
import { useEffect, useState } from "react";

const BulkPostDraftItem = ({ item: PostUploadItem, idx, form, arrayForm }) => {

  const [showCustomOutline, setShowCustomOutline] = useState(false);
  //     Keyword, Voice_URL, Outline_URL, Custom Outline Y or N, Outline Post Title

  // If custom outline = y then we MUST show the full outline on another view

  useEffect(() => {
    if (form?.getState?.[`custom_outline-${idx}`]) {
      setShowCustomOutline(true)
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
          <div className='col-12 col-md-6 col-lg-3'>
            <TextInput fieldName={`target_keyword-${idx}`} label="Target Keyword" bottomSpacing={false} />
          </div>
          <div className='col-12 col-md-6 col-lg-3'>
            <TextInput fieldName={`outline_post_title-${idx}`} label="Outline Post Title" bottomSpacing={false} />
          </div>
          <div className='col-12 col-md-6 col-lg-3'>
            <TextInput fieldName={`domain_name-${idx}`} label="Domain" bottomSpacing={false} />
          </div>
          <div className='col-12 col-md-6 col-lg-3'>
            <TextInput fieldName={`email-${idx}`} label="Email" bottomSpacing={false} />
          </div>
          <div className='col-12'>
            <TextInput fieldName={`excluded_topics-${idx}`} label="Excluded Topics" bottomSpacing={false} validator={urlValidator} />
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