import { useEffect, useState } from 'react'
import Image from 'next/image'
import * as Modal from '@/perfect-seo-shared-components/components/Modal/Modal'
import { createClient } from '@/perfect-seo-shared-components/utils/supabase/client'
import useForm from '@/perfect-seo-shared-components/hooks/useForm'
import Form from '../Form/Form'
import TextArea from '../Form/TextArea'
import TypeWriterText from '../TypeWriterText/TypeWriterText'




export default function HeroImageGenerator({ task_id, guid, hero_image_url, hero_image_prompt }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [generateImageStatus, setGenerateImageStatus] = useState<string>('');

  const supabase = createClient()
  const form = useForm({
    hero_image_prompt: hero_image_prompt || '', // Default value from props
    hero_image_url: hero_image_url || '', // Default value from props
  })

  const updateImagePrompt = () => {
    setError(null)
    setGenerateImageStatus('')
    return supabase
      .from('tasks')
      .update({ hero_image_prompt: form.getState.hero_image_prompt })
      .eq('task_id', task_id)
      .then(res => {
        if (res.status === 204) {
          setGenerateImageStatus('Hero Image Prompt Updated')
        }
      })
  }

  useEffect(() => {
    let newFormState = form.getState;
    if (hero_image_prompt) {
      newFormState.hero_image_prompt = hero_image_prompt
    }
    if (hero_image_url) {
      newFormState.hero_image_url = hero_image_url
    }
    form.setState(newFormState)

  }, [hero_image_prompt, hero_image_url])

  const generateHeroImage = async () => {
    setError(null)
    setGenerateImageStatus('')
    if (!guid) {
      setError('Please enter a content plan outline GUID')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('generate-hero-image', {
        body: { guid }
      })

      if (error) {
        throw error
      }

      setResult(data)
    } catch (err: any) {
      console.error('Error generating hero image:', err)
      setError(err.message || 'Error generating hero image')
    } finally {
      setLoading(false)
    }
  }


  const copyHeroClickHandler = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(form.getState.hero_image_prompt).then(() => {
      setGenerateImageStatus('Copied to clipboard')
    }).catch(err => {
      setGenerateImageStatus('Error copying to clipboard')
    })
  }

  return (
    <>
      <Modal.Title title="Image Prompt" />
      <Modal.Description className="modal-medium">
        <Form controller={form}>
          <TextArea fieldName="hero_image_prompt" label="Image Prompt" />
          <div className="row d-flex justify-content-between align-items-center g-3">
            {generateImageStatus !== '' && <div className="col-12 d-flex align-items-center">
              <span className="text-primary"><TypeWriterText string={generateImageStatus} withBlink /></span>
            </div>}
            {error && <div className="col-12 d-flex align-items-center">
              <div className="card bg-secondary text-primary px-3 py-1 w-100"><TypeWriterText string={`Error: ${error}`} withBlink /></div>
            </div>}
            <div className="col-auto d-flex align-items-center">
              <button onClick={copyHeroClickHandler} className="btn btn-primary me-2" type="button"><i className="bi bi-copy me-2" />Copy</button>
            </div>
            {!hero_image_url && <>
              <div className="col-auto d-flex align-items-center">
                <input type="submit" onClick={updateImagePrompt} className="btn btn-primary" value="Update Image Prompt" disabled={loading} />
              </div>
              <div className="col-auto d-flex align-items-center">
                <button
                  onClick={generateHeroImage}
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Generating...' : 'Generate Image'}
                </button>
              </div>
            </>}

          </div>
          {result ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-2">{result.title}</h2>

              <div className="mb-4">
                <div className="text-sm text-gray-500">Prompt:</div>
                <div className="bg-gray-100 p-3 rounded">{result.prompt}</div>
              </div>

              {result.hero_image_url && (
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-2">Generated Image:</div>
                  <div className="relative h-80 w-full">
                    <Image
                      src={result.hero_image_url}
                      alt="Generated hero image"
                      fill
                      style={{ objectFit: 'contain' }}
                      className="rounded"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">GUID:</span> {result.guid}
                </div>
                <div>
                  <span className="font-medium">Tokens Used:</span> {result.openai_usage?.total_tokens || 'N/A'}
                </div>
              </div>
            </div>
          )
            : hero_image_url ?

              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-2">Hero Image</div>
                <div className="relative h-80 w-full">
                  <Image
                    src={hero_image_url}
                    alt="Generated hero image"
                    fill
                    style={{ objectFit: 'contain' }}
                    className="rounded"
                  />
                </div>
              </div>
              : null}
        </Form>

      </Modal.Description>
    </>
  )
}