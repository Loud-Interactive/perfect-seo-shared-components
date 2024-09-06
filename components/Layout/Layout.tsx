import style from './Layout.module.scss'
import Footer from '../Footer/Footer'
import useManageUser from '@/hooks/useManageUser'
import Header from '@/perfect-seo-shared-components/components/Header/Header'
import { PreferencesPerfectLogo } from '@/perfect-seo-shared-components/assets/brandIcons'

interface LayoutProps extends React.HTMLProps<HTMLDivElement> {
  hideFooter?: boolean
}

const Layout = ({ children, hideFooter }: LayoutProps) => {
  useManageUser()

  return (
    <>
      <Header logo={<PreferencesPerfectLogo />} />
      <main className={style.wrap}>
        {children}
      </main>
      {!hideFooter && <Footer />}
    </>
  )
}

export default Layout