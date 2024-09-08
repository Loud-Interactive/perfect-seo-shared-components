import { ContentPerfectLogo, PagePerfectLogo, PerfectSEOLogo, PreferencesPerfectLogo, SynopsisPerfectLogo, VoicePerfectLogo } from '@/perfect-seo-shared-components/assets/brandIcons';
import styles from './PerfectSEOBar.module.scss'

interface BrandTileProps {
  title: string,
  url: string,
  icon: string,
  logo: any
  current?: boolean;
}
export const PerfectSEOBrands: Array<BrandTileProps> = [
  {
    title: 'pagePerfect.ai',
    url: 'https://pagePerfect.ai',
    logo: <PagePerfectLogo />,
    icon: '/svg/pagePerfect-icon.svg'
  },
  {
    title: 'voicePerfect.ai',
    url: 'https://voicePerfect.ai',
    logo: <VoicePerfectLogo />,
    icon: '/svg/voicePerfect-icon.svg'
  },
  {
    title: 'contentPerfect.ai',
    url: 'https://contentPerfect.ai',
    logo: <ContentPerfectLogo />,
    icon: '/svg/contentPerfect-icon.svg'
  },
  {
    title: 'preferencesPerfect.ai',
    url: 'https://preferencesPerfect.ai',
    logo: <PreferencesPerfectLogo />,
    icon: '/svg/preferencePerfect-icon.svg'
  },
  {
    title: 'synopsisPerfect.ai',
    url: 'https://synopsisPerfect.ai',
    logo: <SynopsisPerfectLogo />,
    icon: '/svg/synopsisPerfect-icon.svg'
  }

]

const PerfectSEOBar = ({ current }) => {
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h3>Looking for more SEO tools? Check out some of the other AI tools in the perfectSEO suite!</h3>
      </div>
      <div className={styles.body}>
        <a href="https://www.loud.us/ai-tools" target="_blank" rel="noreferrer">
          <div className={styles.hero}>
            <img src="/svg/perfectSEO-icon.svg" className={styles.icon} />
            <div className={styles.iconFull}>
              <PerfectSEOLogo />
            </div>
          </div>
        </a>
        <div className={styles.brands}>
          {PerfectSEOBrands.map((brand: BrandTileProps) => {
            return (
              <a href={brand.url} target="_blank" className={styles.brandTile} rel="noreferrer" key={brand.title}>
                <div className={styles.brandTileHeader}>
                  <img src={brand.icon} className={styles.brandTileIcon} />
                  <div className={styles.brandTileLogo}>
                    {brand.logo}
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default PerfectSEOBar