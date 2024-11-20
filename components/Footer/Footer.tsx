'use client'
import styles from './Footer.module.scss'
import PerfectSEOBar from "../PerfectSEOBar/PerfectSEOBar"
import { SEOPerfectLogo } from '@/perfect-seo-shared-components/assets/brandIcons'
import moment from 'moment-timezone'
import classNames from 'classnames'
import { useSelector } from 'react-redux'
import { selectShowQueue } from '@/perfect-seo-shared-components/lib/features/User'

const Footer = ({ current }) => {
  const showQueue = useSelector(selectShowQueue)

  const footerClasses = classNames('mb-5', {
    'queue-footer': showQueue
  })
  return (
    <footer className={footerClasses}>
      <div className="container-fluid container-xl">
        <PerfectSEOBar current={current} />
      </div>
      <div className="container-fluid container-xl">
        <div className="row mx-0">
          <div className="col-md-12 text-center">
            {/* <p><a href="/terms-and-conditions" target="_blank">Terms &amp; Conditions</a></p> */}
            <p><a href="mailto:sales@contentperfect.ai">sales@contentperfect.ai</a></p>
            <p>
              <a href="https://SEOPerfect.ai/" className={styles.logoLink}>
                <SEOPerfectLogo />
              </a></p>
            <p>© {moment().format("YYYY")} by Loud Interactive LLC</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer