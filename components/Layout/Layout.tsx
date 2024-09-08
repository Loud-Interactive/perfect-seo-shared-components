import { Links } from '@/perfect-seo-shared-components/data/types';
import Footer from '../Footer/Footer'
import Header from '../Header/Header'
import style from './Layout.module.scss'


interface LayoutProps extends React.HTMLProps<HTMLDivElement> {
  hideFooter?: boolean,
  current: string;
  links?: Links[];
  hasLogin?: boolean;
}

const Layout = ({ children, hideFooter, current, links, hasLogin = true }: LayoutProps) => {

  return (
    <>
      <Header current={current} links={links} hasLogin={hasLogin} />
      <main className={style.wrap}>
        {children}
      </main>
      {!hideFooter && <Footer current={current} />}
    </>
  )
}

export default Layout