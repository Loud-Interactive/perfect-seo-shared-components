import { Links } from '@/perfect-seo-shared-components/data/types';
import Footer from '../Footer/Footer'
import Header from '../Header/Header'
import style from './Layout.module.scss'
import store from '@/perfect-seo-shared-components/store';
import { Provider } from "react-redux";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Brands } from '@/perfect-seo-shared-components/assets/Brands';
import Head from 'next/head';


interface LayoutProps extends React.HTMLProps<HTMLDivElement> {
  hideFooter?: boolean,
  current: string;
  links?: Links[];
  hasLogin?: boolean;
  getCredits?: boolean;
}

const Layout = ({ children, hideFooter, current, links, hasLogin = true, getCredits = false }: LayoutProps) => {

  const currentBrand = Brands.find((brand) => brand.title === current)
  return (
    <>
      <Head>
        <title>{current}</title>
        <link rel="icon" type="image/png" href={`/images/brands/${current.replace(".ai", "")}-icon.png`} />
        <meta charSet="UTF-8" />
        <meta name="description" content={currentBrand.summary} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Provider store={store}>
        <Header brand={currentBrand} current={current} links={links} hasLogin={hasLogin} getCredits={getCredits} />
        <main className={style.wrap}>
          {children}
        </main>
        {!hideFooter && <Footer current={current} />}
      </Provider>
    </>
  )
}

export default Layout