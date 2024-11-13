import en from '@/assets/en.json';
import classNames from 'classnames'
import styles from './MyContent.module.scss'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import TypeWriterText from '@/perfect-seo-shared-components/components/TypeWriterText/TypeWriterText'
import { usePathname, useRouter } from 'next/navigation'
import PostsList from '@/perfect-seo-shared-components/components/PostsList/PostsList'
import PlansList from '@/perfect-seo-shared-components/components/PlansList/PlansList'
import { useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux'
import SearchSelect from '@/perfect-seo-shared-components/components/SearchSelect/SearchSelect'
import { createClient } from '@/perfect-seo-shared-components/utils/supabase/client'
import { urlSanitization } from '@/perfect-seo-shared-components/utils/conversion-utilities';
import BulkPostComponent from '../BulkPostGenerator/BulkPostComponent';
import CheckGoogleDomains from '../CheckGoogleDomains/CheckGoogleDomains';
import useGoogleUser from '@/perfect-seo-shared-components/hooks/useGoogleUser';
import { getSynopsisInfo } from '@/perfect-seo-shared-components/services/services';
import BulkContentComponent from '../BulkContentGenerator/BulkContentComponent';
import OutlinesList from '../OutlinesList/OutlinesList';
import BrandHeader from '../BrandHeader/BrandHeader';
import LoadSpinner from '../LoadSpinner/LoadSpinner';
import { selectDomains, selectDomainsInfo, selectEmail, selectIsAdmin, selectIsLoggedIn, selectSettings, selectUser } from '@/perfect-seo-shared-components/lib/features/User'
import Loader from '../Loader/Loader';

export interface MyContentProps {
  currentDomain?: string;
  hideTitle?: boolean;
}

const MyContent = ({ currentDomain, hideTitle = false }: MyContentProps) => {
  const router = useRouter();
  const pathname = usePathname()
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('tab');
  const domainParam = searchParams.get('domain');


  const settings = useSelector(selectSettings);
  const domainsInfo = useSelector(selectDomainsInfo)
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const isAdmin = useSelector(selectIsAdmin)
  const isLoading = useSelector(selectIsLoggedIn)
  const domain_access = useSelector(selectDomains)
  const email = useSelector(selectEmail)

  const [selectedTab, setSelectedTab] = useState('content-plans')

  const [domain, setDomain] = useState(currentDomain || null)
  const [selected, setSelected] = useState(null)
  const [domains, setDomains] = useState([])
  const [reverify, setReverify] = useState(false)
  const [dataTracked, setDataTracked] = useState(false)
  const { fetchAllDomains } = useGoogleUser(en.product)
  const [synopsis, setSynopsis] = useState(null)

  useEffect(() => {
    let data = null;
    if ((currentDomain || domain) && domainsInfo) {
      let checkDomain = currentDomain || domain
      data = domainsInfo.find(obj => obj?.domain === checkDomain)
      if (!data) {
        getSynopsisInfo(checkDomain)
          .then(res => {
            setSynopsis(res?.data)
          })
      }
      else {
        setSynopsis(data)
      }
    }

  }, [currentDomain, domainsInfo, domain])


  const isDefaultDomain = useMemo(() => {
    let bool = false;
    if (settings?.global?.defaultDomain) {
      if (selected?.value === settings?.global?.defaultDomain) {
        bool = true
      }
    }
    return bool
  }, [settings, selected])

  const addDefaultHandler = (e?) => {
    e?.preventDefault();
    let global = settings?.global || {}
    supabase
      .from('settings')
      .update({ global: { ...global, defaultDomain: selected?.value } })
      .eq('email', email)
      .select("*")
      .then(res => {
        if (!res.error) {

        }
      })
  }

  useEffect(() => {
    if (email && domain && !dataTracked) {
      supabase
        .from('user_history')
        .insert({ email: email, domain: domain, transaction_data: { page: 'my-content', tab: selectedTab || queryParam || 'posts' }, product: en?.product, type: "View Content" })
        .select('*')
        .then(res => {
          setDataTracked(true)
        })
    }
  }, [domain, selected, selectedTab, email, dataTracked])

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const clickHandler = (e, val) => {
    e.preventDefault()
    let url = pathname + '?' + createQueryString('tab', val)
    router.replace(url)
  }

  useEffect(() => {
    if (queryParam) {
      if (queryParam === 'bulk-generation') {
        router.replace(pathname)
      }
      else {
        setSelectedTab(queryParam)
      }
    }
  }, [queryParam])

  useEffect(() => {
    if (domainParam) {
      setDomain(domainParam);
      setSelected({ value: domainParam, label: domainParam })
      setSynopsis(null)
    }
  }, [domainParam])

  const TabData = [
    { key: "content-plans", title: "Generated Content Plans" },
    { key: "outlines", title: "Generated Outlines" },
    { key: "posts", title: "Generated Posts" },
    // { key: "reports", title: "Stats & Reports" },
    { key: "bulk-content", title: "Bulk Content Plans" },
    { key: "bulk-posts", title: "Bulk Posts" },
  ]

  const searchDomainChangeHandler = (e) => {
    if (e) {
      setSynopsis(null)
      setDomain(e?.value);
      setSelected(e)
      setDataTracked(false)
      router.replace(pathname + '?' + createQueryString("domain", e.value))
    }
    else {
      setDomain(null);
      setSelected(null)
      setSynopsis(null)
      router.replace(pathname)
    }
  };

  const supabase = createClient();

  const fetchDomains = () => {
    supabase
      .from("domains")
      .select("*")
      .then((res) => {
        if (res.data?.length > 0) {
          setDomains(res?.data?.sort((a, b) => a?.domain?.localeCompare(b?.domain)));
        }

      });
  };

  const checkDomain = (domain) => {
    if (domain) {
      supabase
        .from('domains')
        .select("*")
        .eq('domain', urlSanitization(domain))
        .then(res => {
          if (res.data.length === 0) {
            supabase
              .from('domains')
              .insert([
                { 'domain': urlSanitization(domain) }
              ])
              .select("*")
              .then(res => {
              })
          }
        })
    }
  }

  const domainsList = useMemo(() => {
    let list: any = []
    if (isAdmin) {
      list = [...list, ...domains?.sort((a, b) => a.domain.localeCompare(b.domain)).map(({ domain }) => ({ label: domain, value: domain }))]
    }
    else if (domain_access?.length > 0) {
      list = [...list, ...domain_access.map((domain) => {
        return domain?.siteUrl?.toLowerCase()
      })].sort((a, b) => a?.localeCompare(b)).map((domain) => {
        checkDomain(domain)
        return ({ label: domain, value: domain })
      });
    }
    if (list?.length > 0) {
      list = list.reduce((acc, current) => {
        if (!acc.find(item => item.value === current.value)) {
          return [...acc, current]
        }
        else {
          return acc
        }
      }, [])
    }
    return list

  }, [domain_access, domains, isAdmin])


  useEffect(() => {
    if (currentDomain) {
      setDomain(currentDomain)
      setSelected({ label: currentDomain, value: currentDomain })
    } else if (settings?.global?.defaultDomain) {
      setDomain(settings.global.defaultDomain)
      setSelected({ label: settings.global.defaultDomain, value: settings.global.defaultDomain })
    }
  }, [currentDomain, settings])

  const isAuthorized = useMemo(() => {
    let bool = true;
    if (isLoading) {
      return null
    }
    if (isAdmin) {
      return true
    } else if (domain_access && domain_access.map(({ siteUrl }) => siteUrl).length > 0) {
      if (currentDomain) {
        let domain = currentDomain;
        bool = (domain_access.map(({ siteUrl }) => siteUrl).includes(domain?.toLowerCase()))
      }
      else if (selected?.value) {
        let domain = selected.value
        bool = (domain_access.map(({ siteUrl }) => siteUrl).includes(domain?.toLowerCase()))
      }
      else {
        bool = true
      }


    }
    else {
      bool = false
    }
    if (bool === false && email && (currentDomain || selected?.value) && (domainsList || domain_access)) {
      supabase
        .from('user_history')
        .insert({ email: email, domain: currentDomain || selected?.value, transaction_data: { domains: domainsList || domain_access }, product: en.product, type: "Unauthorized My Content" })
        .select('*')
        .then(res => {
          fetchAllDomains()
        })
    }
    return bool
  }, [currentDomain, selected, domainsList, domain_access, isLoading])

  useEffect(() => {
    if (isAdmin) {
      fetchDomains();
    }
  }, [isAdmin])

  useEffect(() => {
    // if (['bulk-content', 'bulk-posts'].includes(selectedTab)) {
    //   if (currentDomain) {
    //     setDomain(currentDomain)
    //     setSelected({ label: currentDomain, value: currentDomain })
    //   }
    //   else {
    //     setDomain(null);
    //     setSelected(null)
    //   }
    // }
  }, [])



  if (isLoading) {
    return (
      <div className='strip-padding'>
        <Loader />

        {isLoading.toString()}
      </div>
    )
  }
  else if (isAuthorized === false) {
    return (
      <div className="container-fluid container-xl strip-padding">
        <div className='row d-flex align-items-center justify-content-center'>
          <h1 className="text-3xl font-bold text-center mb-3"><TypeWriterText string={isLoggedIn ? `You are not authorized to view content for ${currentDomain || selected?.value || 'this domain'}` : 'Log in to view your content'} withBlink /></h1>
          <div className='col-12 col-lg-8 mt-3 d-flex justify-content-center'>
            {reverify ?
              <CheckGoogleDomains />
              :
              <button onClick={() => setReverify(true)} className='btn btn-primary'>Re-verify Domain Access</button>}
          </div>
        </div>
      </div>
    )
  }
  return (
    <>
      {hideTitle ? null :
        <div className='container-fluid container-xl'>
          <div className='row px-3 g-3 align-items-center justify-content-between'>
            {(synopsis && ['bulk-content', 'bulk-posts'].includes(selectedTab) === false) ?
              <>
                <BrandHeader synopsis={synopsis} />
              </> :
              <div className='col'>
                <h1 className="text-start mb-5"><TypeWriterText string={selectedTab.includes("bulk") ? 'Upload for all domains' : selected ? `Content for ${domain}` : 'Your Content'} withBlink /></h1>
              </div>
            }
            {(domain_access?.length > 0 && ['bulk-content', 'bulk-posts'].includes(selectedTab) === false && !currentDomain) && <div className='col-12 col-md-4 mb-5'>
              <SearchSelect
                onChange={searchDomainChangeHandler}
                options={domainsList}
                isLoading={!domainsList}
                value={selected || null}
                placeholder="Select a Domain"
              />
              {(!isDefaultDomain && selected) && <a className='text-primary' onClick={addDefaultHandler}>Make Default</a>}
            </div>}
          </div>
        </div>
      }
      <div className='container-xl content-fluid'>
        {isLoading && <LoadSpinner />}
        <div className={styles.tabWrap}>
          <ul className="nav nav-tabs mb-0">
            {TabData.map((tab) => {

              const tabClasses = classNames('nav-link',
                { 'active': tab.key === selectedTab })
              let tabKey = `${tab.key}-tab`
              return (
                <li className="nav-item" key={tabKey}>
                  <button onClick={(e) => clickHandler(e, tab.key)} id={tabKey} data-bs-toggle={tab.key} data-bs-target="#outline" role={tab.key} aria-controls={tab.key} aria-selected={selectedTab === tab.key} className={tabClasses} name={tab.key}>{tab.title}</button>
                </li>
              )
            })}
          </ul>
          <div className="tab-content bg-dark mb-3" id="myTabContent">
            <div className={`tab-pane fade ${selectedTab === 'outlines' && 'show active'}`} id="outlines" role="tabpanel" aria-labelledby="outlines-tab">
              <div className='tab p-3'>
                <Suspense fallback={<LoadSpinner />}>
                  <OutlinesList active={selectedTab === 'outlines'} domain_name={currentDomain || domain} />
                </Suspense>
              </div>
            </div>
            <div className={`tab-pane fade ${selectedTab === 'posts' && 'show active'}`} id="posts" role="tabpanel" aria-labelledby="posts-tab">
              <div className='tab p-3'>
                <Suspense fallback={<LoadSpinner />}>
                  <PostsList active={selectedTab === 'posts'} domain_name={currentDomain || domain} />
                </Suspense>
              </div>
            </div>
            <div className={`tab-pane fade ${selectedTab === 'content-plans' && 'show active'}`} id="content-plans" role="tabpanel" aria-labelledby="content-plans-tab">
              <div className='tab p-3'>
                <Suspense fallback={<LoadSpinner />}>
                  <PlansList active={selectedTab === 'content-plans'} domain_name={currentDomain || domain} />
                </Suspense>
              </div>
            </div>
            <div className={`tab-pane fade ${selectedTab === 'bulk-content' && 'show active'}`} id="bulk-cnotent" role="tabpanel" aria-labelledby="bulk-content-tab">
              <div className='tab p-3'>
                <Suspense fallback={<LoadSpinner />}>
                  <BulkContentComponent currentDomain={currentDomain} active={selectedTab === 'bulk-content'} />
                </Suspense>
              </div>
            </div>
            <div className={`tab-pane fade ${selectedTab === 'bulk-posts' && 'show active'}`} id="bulk-posts" role="tabpanel" aria-labelledby="bulk-posts-tab">
              <div className='tab p-3'>
                <Suspense fallback={<LoadSpinner />}>
                  <BulkPostComponent currentDomain={currentDomain} active={selectedTab === 'bulk-posts'} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
        {/* <div className="strip-padding container-fluid container-xl d-flex align-items-center justify-content-center">
            <h2 className='text-center text-primary'><TypeWriterText string="No domain selected" withBlink /></h2>
          </div> */}
      </div>
    </>
  )
}

export default MyContent