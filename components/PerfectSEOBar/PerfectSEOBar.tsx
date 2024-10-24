import { PerfectSEOLogo, SEOPerfectLogo } from '@/perfect-seo-shared-components/assets/brandIcons';
import styles from './PerfectSEOBar.module.scss'
import { renderIcon, renderLogo } from '@/perfect-seo-shared-components/utils/brandUtilities';
import { Brands } from '@/perfect-seo-shared-components/assets/Brands';
import { Brand, BrandStatus } from '@/perfect-seo-shared-components/data/types';
import classNames from 'classnames';
import useViewport from '@/perfect-seo-shared-components/hooks/useViewport';


const PerfectSEOBar = ({ current }) => {
  const { desktop } = useViewport()

  const rowClasses = classNames('row d-flex w-100',
    {
      'justify-content-between': desktop,
      'justify-content-center': !desktop
    },
  )
  return (
    <div className="container-fluid container-xl">
      <div className='row d-flex justify-content-center mb-5'>
        <div className='col-auto'>
          <div className={styles.header}>
            <h3>Looking for more SEO tools? Check out some of the other AI tools in the SEOPerfect suite!</h3>
          </div>
        </div>
        <div className="col-auto">
          <a href="https://SEOPerfect.ai/" target="_blank" rel="noreferrer">
            <div className={styles.hero}>
              <img src="/svg/SEOPerfect-icon.svg" className={styles.icon} />
              <div className={styles.iconFull}>
                <SEOPerfectLogo />
              </div>
            </div>
          </a>
        </div>
      </div>
      <div className={rowClasses}>
        {Brands.filter(brand => brand.title !== current && brand.status === BrandStatus.LIVE).map((brand: Brand) => {
          return (
            <div className='col-4 col-md-3 col-lg-1' key={brand.title}>
              <a href={brand.url} target="_blank" className={styles.brandTile} rel="noreferrer" key={brand.title}>
                <div className={styles.brandTileHeader}>
                  <div className={styles.brandTileIcon}>
                    {renderIcon(brand.title)}
                  </div>
                  <div className={styles.brandTileLogo}>
                    {renderLogo(brand.title)}
                  </div>
                </div>
              </a>
            </div>
          )
        })}

      </div>

    </div>
  )
}

export default PerfectSEOBar