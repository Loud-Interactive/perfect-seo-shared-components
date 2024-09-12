import styles from './Footer.module.scss'
import PerfectSEOBar from "../PerfectSEOBar/PerfectSEOBar"
import { PerfectSEOLogo } from '@/perfect-seo-shared-components/assets/brandIcons'
import moment from 'moment-timezone'

const Footer = ({ current }) => {
  return (
    <footer className="mb-5">
      <div className="container-fluid">
        <PerfectSEOBar current={current} />
      </div>
      <div className="container">
        <div className="row">
          <div className="col-md-12 text-center">
            {/* <p><a href="/terms-and-conditions" target="_blank">Terms &amp; Conditions</a></p> */}
            <p><a href="mailto:sales@contentperfect.ai">sales@contentperfect.ai</a></p>
            <p>
              <a href="https://www.loud.us/ai-tools" className={styles.logoLink}>
                <PerfectSEOLogo />
              </a></p>
            <p>© {moment().format("YYYY")} by Loud Interactive LLC</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer