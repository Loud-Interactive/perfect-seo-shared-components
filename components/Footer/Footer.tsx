import { PerfectSEOLogo } from "@/assets/icons"
import styles from './Footer.module.scss'
import PerfectSEOBar from "../PerfectSEOBar/PerfectSEOBar"

const Footer = () => {
  return (
    <footer className="mb-5">
      <div className="container-fluid">
        <PerfectSEOBar />
      </div>
      <div className="container">
        <div className="row">
          <div className="col-md-12 text-center">
            <p><a href="/terms-and-conditions" target="_blank">Terms &amp; Conditions</a></p>
            <p><a href="mailto:sales@contentperfect.ai">sales@contentperfect.ai</a></p>
            <p>
              <a href="https://www.loud.us/ai-tools" className={styles.logoLink}>
                <PerfectSEOLogo />
              </a></p>
            <p>© 2023 by Loud Interactive LLC</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer