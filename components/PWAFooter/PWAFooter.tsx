'use client'
import styles from './PWAFooter.module.scss'
import PerfectSEOBar from "../PerfectSEOBar/PerfectSEOBar"
import { SEOPerfectLogo } from '@/perfect-seo-shared-components/assets/brandIcons'
import moment from 'moment-timezone'
import classNames from 'classnames'
import { useSelector } from 'react-redux'
import { selectShowQueue } from '@/perfect-seo-shared-components/lib/features/User'

const PWAFooter = ({ current }) => {
  const showQueue = useSelector(selectShowQueue)

  const footerClasses = classNames(`${styles.footer} bg-dark`, {
    'queue-footer': showQueue
  })
  return (
    <footer className={footerClasses} id="pwa-footer">
      <div className="row d-flex justify-content-between align-items-start">
        <div className="col-2">
          <button className='btn btn-primary w-100 h-100'>
            <i className="bi bi-list-ol" />
            Plans
          </button>
        </div>
        <div className="col-2">
          <button className='btn btn-primary w-100 h-100'>
            <i className="bi bi-list-nested" />
            Outline
          </button>
        </div>
        <div className="col-2">
          <button className='btn btn-primary w-100 h-100'>
            <i className="bi bi-newspaper" />
            Post
          </button>
        </div>
        <div className="col-2">
          <button className='btn btn-primary w-100 h-100'>
            <i className="bi bi-list-columns" />
            Bulk
          </button>
        </div>
        <div className="col-2">
          <button className='btn btn-primary w-100 h-100'>
            <i className="bi bi-file-earmark-bar-graph" />
            Reports
          </button>
        </div>
        <div className="col-2">
          <button className='btn btn-primary w-100 h-100'>
            <i className="bi bi-gear-fill" />
            Settings
          </button>
        </div>
      </div>
    </footer>
  )
}

export default PWAFooter