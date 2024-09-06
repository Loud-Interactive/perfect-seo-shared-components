import { Brand, BrandStatus } from "@/assets/global-assets/types"
import styles from './BrandTiles.module.scss'
interface BrandTileProps {
  brand: Brand
}

const BrandTile = ({ brand }: BrandTileProps) => {
  return (
    <div className="card p-3 h-100">
      <div className="row h-100">
        <div className="col-4">
          <img src={brand.icon} alt={brand.title} />
        </div>
        <div className="col-8 d-flex flex-column justify-content-between">
          <div>
            <img src={brand.logo} alt={brand.title} className={styles.brandIcon} />

            {brand.summary &&

              <p className="text-light mt-3">{brand.summary}</p>
            }
          </div>
          {brand.status === BrandStatus.LIVE &&
            <a className={`btn  align-self-end ${styles.cta}`} target="_blank" href={brand.url} style={{ backgroundColor: brand.primary }}>
              Try it out
            </a>
          }
        </div>
      </div>
    </div >
  )
}

export default BrandTile