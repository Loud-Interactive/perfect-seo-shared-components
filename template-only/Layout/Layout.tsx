import style from './Layout.module.scss'
import useManageUser from '@/hooks/useManageUser'
import Header from '@/perfect-seo-shared-components/components/Header/Header'
import { ContentPerfectLogo } from '@/perfect-seo-shared-components/assets/brandIcons'
import Footer from '@/perfect-seo-shared-components/components/Footer/Footer'
import { StateTree } from '@/store/reducer'
import { useSelector } from 'react-redux'

interface LayoutProps extends React.HTMLProps<HTMLDivElement> {
  hideFooter?: boolean,
}

const Layout = ({ children, hideFooter }: LayoutProps) => {
  useManageUser()
  const { isLoggedIn, user, isAdmin, isLoading } = useSelector((state: StateTree) => state);
  const links = [{ href: `/content/${user?.email?.split("@")[1]}`, label: 'My Content' }]
  return (
    <>
      <Header logo={<ContentPerfectLogo />} links={links} />
      <main className={style.wrap}>
        {children}
      </main>
      {!hideFooter && <Footer />}
    </>
  )
}

export default Layout