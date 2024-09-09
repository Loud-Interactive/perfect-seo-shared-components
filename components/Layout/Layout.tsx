import { Links } from '@/perfect-seo-shared-components/data/types';
import Footer from '../Footer/Footer'
import Header from '../Header/Header'
import style from './Layout.module.scss'
import store from '@/perfect-seo-shared-components/store';
import { Provider } from "react-redux";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Brands } from '@/perfect-seo-shared-components/assets/Brands';
import Head from 'next/head';
import Script from 'next/script';


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
        <link rel="icon" href={`/svg/${current.endsWith(".ai") ? current.replace(".ai", "") : current}-icon.svg`} />
        <meta charSet="UTF-8" />
        <meta name="og:title" content={current} />
        <meta name="og:description" content={currentBrand.summary} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossOrigin="anonymous" />
      </Head>
      <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossOrigin="anonymous" />
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