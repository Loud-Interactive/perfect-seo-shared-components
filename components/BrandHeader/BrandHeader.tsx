import classNames from "classnames"
import TypeWriterText from "../TypeWriterText/TypeWriterText"
import styles from './BrandHeader.module.scss'
import useLogoCheck from "@/perfect-seo-shared-components/hooks/useLogoCheck"
import { useEffect } from "react"
import { updateImpression } from "@/perfect-seo-shared-components/services/services"

interface BrandHeaderProps {
  synopsis: any
  editable?: boolean;
}
const BrandHeader = ({ synopsis, editable = true }: BrandHeaderProps) => {
  const isDark = useLogoCheck(synopsis?.logo_url, synopsis?.domain)

  const logoCardClasses = classNames('card p-3 h-100 d-flex align-items-center justify-content-center',
    {
      'bg-secondary': !synopsis?.logo_theme,
      'bg-light': synopsis?.logo_theme === 'dark' || isDark === true,
      'bg-dark': synopsis?.logo_theme === 'light' || isDark === false
    }
  )

  if (!synopsis || !synopsis?.domain) return null

  return (
    <div className='mb-3 bg-primary'>
      <div className='container-xl content-fluid py-3'>
        <div className='row d-flex justify-content-between g-3'>
          {synopsis?.logo_url && <div className='col-12 col-lg-3'>
            <div className={logoCardClasses}>
              <div className={styles.logoWrap}>
                <img src={synopsis?.logo_url} />
                {editable && <div className={styles.logoUpdate}>
                  <a href={`https://preferencesperfect.ai/domain/${synopsis?.domain}?tab=brand-identity`} className='text-primary' target='_blank'>Update Logo</a>
                </div >}
              </div >
            </div >
          </div >}
          <div className='col'>
            <h1 className="text-start mb-1"><TypeWriterText string={`Content for ${synopsis?.brand_name || synopsis?.domain}`} withBlink /></h1>
            {synopsis?.synopsis && <div className='card p-3'>
              <div className={styles.synopsisHeader}>
                <strong>Synopsis</strong>
                {editable && <a href={`https://preferencesperfect.ai/domain/${synopsis?.domain}`} className={styles.synopsisUpdate} target='_blank'>Update Synopsis</a>}
              </div>
              <p className='mb-0'>{synopsis?.synopsis}</p></div>}
          </div>
        </div >
      </div >
    </div >
  )
}
export default BrandHeader