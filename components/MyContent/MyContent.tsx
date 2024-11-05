import en from '@/assets/en.json';
import classNames from 'classnames'
import styles from './MyContent.module.scss'
import { useCallback, useEffect, useMemo, useState } from 'react'
import TypeWriterText from '@/perfect-seo-shared-components/components/TypeWriterText/TypeWriterText'
import { usePathname, useRouter } from 'next/navigation'
import PostsList from '@/perfect-seo-shared-components/components/PostsList/PostsList'
import PlansList from '@/perfect-seo-shared-components/components/PlansList/PlansList'
import { useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux'
import { RootState } from '@/perfect-seo-shared-components/lib/store'
import SearchSelect from '@/perfect-seo-shared-components/components/SearchSelect/SearchSelect'
import Loader from '@/perfect-seo-shared-components/components/Loader/Loader'
import { createClient } from '@/perfect-seo-shared-components/utils/supabase/client'
import { urlSanitization } from '@/perfect-seo-shared-components/utils/conversion-utilities';
import BulkPostComponent from '../BulkPostGenerator/BulkPostComponent';
import CheckGoogleDomains from '../CheckGoogleDomains/CheckGoogleDomains';
import useGoogleUser from '@/perfect-seo-shared-components/hooks/useGoogleUser';
import { getSynopsisInfo } from '@/perfect-seo-shared-components/services/services';
import BulkContentComponent from '../BulkContentGenerator/BulkContentComponent';
import OutlinesList from '../OutlinesList/OutlinesList';
export interface MyContentProps {
  currentDomain?: string;
  hideTitle?: boolean;
}
const MyContent = ({ currentDomain, hideTitle = false }: MyContentProps) => {
  const { user, isAdmin, isLoading, isLoggedIn, profile, settings, domainsInfo } = useSelector((state: RootState) => state);
  const [selectedTab, setSelectedTab] = useState('content-plans')
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('tab');
  const router = useRouter();
  const pathname = usePathname()
  const [domain, setDomain] = useState(currentDomain || null)
  const [selected, setSelected] = useState(null)
  const [domains, setDomains] = useState([])
  const [reverify, setReverify] = useState(false)
  const [dataTracked, setDataTracked] = useState(false)
  const { fetchAllDomains } = useGoogleUser(en.product)
  const [synopsis, setSynopsis] = useState(null)

  useEffect(() => {
    let data = null;
    if (currentDomain && domainsInfo) {
      data = domainsInfo.find(obj => obj?.domain === currentDomain)
      if (!data) {
        getSynopsisInfo(currentDomain)
          .then(res => {
            setSynopsis(res?.data)
          })
      }
      else {
        setSynopsis(data)
      }
    }

  }, [currentDomain, domainsInfo])

  useEffect(() => {
    console.log(synopsis)
  }, [synopsis])

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
      .eq('email', user.email)
      .select("*")
      .then(res => {
        if (!res.error) {

        }
      })
  }

  useEffect(() => {
    if (user?.email && domain && !dataTracked) {
      supabase
        .from('user_history')
        .insert({ email: user.email, domain: domain, transaction_data: { page: 'my-content', tab: selectedTab || queryParam || 'posts' }, product: en?.product, type: "View Content" })
        .select('*')
        .then(res => {
          setDataTracked(true)
        })
    }
  }, [domain, selected, selectedTab, user?.email, dataTracked])

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
      console.log(e)
      setDomain(e?.value);
      setSelected(e)
      setDataTracked(false)
    }
    else {
      setDomain(null);
      setSelected(null)
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
    else if (profile?.domain_access?.length > 0) {
      console.log(profile?.domain_access)
      list = [...list, ...profile.domain_access.map((domain) => {
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

  }, [profile?.domain_access, domains, isAdmin])


  useEffect(() => {
    if (currentDomain) {
      setDomain(currentDomain)
      setSelected({ label: currentDomain, value: currentDomain })
    } if (settings?.global?.defaultDomain && !domain && !selected) {
      setDomain(settings.global.defaultDomain)
      setSelected({ label: settings.global.defaultDomain, value: settings.global.defaultDomain })
    }
  }, [currentDomain])

  const isAuthorized = useMemo(() => {
    let bool = true;
    if (isAdmin) {
      return true
    } else if (profile?.admin === true) {
      return true
    } else if (profile?.domains?.length > 0) {
      if (currentDomain) {
        let domain = currentDomain;
        bool = (profile?.domains.includes(domain?.toLowerCase()))
      }
      else if (selected?.value) {
        let domain = selected.value
        bool = (profile?.domains?.includes(domain?.toLowerCase()))
      }
      else {
        bool = true
      }


    }
    else {
      bool = false
    }
    if (bool === false && user?.email && (currentDomain || selected?.value) && (domainsList || profile?.domain_access)) {
      supabase
        .from('user_history')
        .insert({ email: user.email, domain: currentDomain || selected?.value, transaction_data: { domains: domainsList || profile?.domain_access }, product: en.product, type: "Unauthorized My Content" })
        .select('*')
        .then(res => {
          fetchAllDomains()
        })
    }
    return bool
  }, [user?.email, isAdmin, currentDomain, selected, domainsList, profile?.domains])

  useEffect(() => {
    if (isAdmin) {
      fetchDomains();
    }
  }, [isAdmin])

  useEffect(() => {
    if (['bulk-content', 'bulk-posts'].includes(selectedTab)) {
      if (currentDomain) {
        setDomain(currentDomain)
        setSelected({ label: currentDomain, value: currentDomain })
      }
      else {
        setDomain(null);
        setSelected(null)
      }
    }
  }, [])



  if (isLoading) {
    return (
      <div className='strip-padding'>
        <Loader />
      </div>
    )
  }
  else if (!isAuthorized) {
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
      {currentDomain &&
        <div className='bg-primary mb-3'>
          <div className='container-xl content-fluid py-3'>
            <div className='row d-flex justify-content-between g-3'>
              {synopsis?.logo_url && <div className='col-12 col-lg-3'>
                <div className="card p-3 bg-secondary h-100 d-flex align-items-center justify-content-center">
                  <div className={styles.logoWrap}>
                    <img src={synopsis?.logo_url} className='w-75' />
                    <div className={styles.logoUpdate}>
                      <a href={`https://preferencesperfect.ai/domain/${domain}?tab=brand-identity`} className='text-primary' target='_blank'>Update Logo</a>
                    </div>
                  </div>
                </div>
              </div>}
              <div className='col'>
                <h1 className="text-start mb-1"><TypeWriterText string={`Content for ${synopsis?.brand_name || domain}`} withBlink /></h1>
                {synopsis?.synopsis && <div className='card p-3'>
                  <div className={styles.synopsisHeader}>
                    <strong>Synopsis</strong>            <a href={`https://preferencesperfect.ai/domain/${domain}`} className={styles.synopsisUpdate} target='_blank'>Update Synopsis</a>
                  </div>
                  <p className='mb-0'>{synopsis?.synopsis}</p></div>}
              </div>
            </div>
          </div>
        </div>
      }
      <div className='container-xl content-fluid'>
        {!(hideTitle || currentDomain) &&
          <div className='row d-flex justify-content-between'>
            <div className='col'>
              <h1 className="text-start mb-5"><TypeWriterText string={selectedTab.includes("bulk") ? 'Upload for all domains' : selected ? `Content for ${domain}` : 'Your Content'} withBlink /></h1>
            </div>
            {(profile?.domain_access?.length > 0 && ['bulk-content', 'bulk-posts'].includes(selectedTab) === false) && <div className='col-12 col-md-4 mb-3'>
              <SearchSelect
                onChange={searchDomainChangeHandler}
                options={domainsList}
                isLoading={!domainsList}
                value={selected || null}
                placeholder="Select a Domain"
              />
              {(!isDefaultDomain && selected) && <a className='text-primary mt-2' onClick={addDefaultHandler}>Make Default</a>}
            </div>}
          </div>
        }
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
                <OutlinesList active={selectedTab === 'outlines'} domain_name={domain} />
              </div>
            </div>
            <div className={`tab-pane fade ${selectedTab === 'posts' && 'show active'}`} id="posts" role="tabpanel" aria-labelledby="posts-tab">
              <div className='tab p-3'>
                <PostsList active={selectedTab === 'posts'} domain_name={domain} />
              </div>
            </div>
            <div className={`tab-pane fade ${selectedTab === 'content-plans' && 'show active'}`} id="content-plans" role="tabpanel" aria-labelledby="content-plans-tab">
              <div className='tab p-3'>
                <PlansList active={selectedTab === 'content-plans'} domain_name={domain} />
              </div>
            </div>
            <div className={`tab-pane fade ${selectedTab === 'bulk-content' && 'show active'}`} id="bulk-cnotent" role="tabpanel" aria-labelledby="bulk-content-tab">
              <div className='tab p-3'>
                <BulkContentComponent currentDomain={currentDomain} active={selectedTab === 'bulk-content'} />
              </div>
            </div>
            <div className={`tab-pane fade ${selectedTab === 'bulk-posts' && 'show active'}`} id="bulk-posts" role="tabpanel" aria-labelledby="bulk-posts-tab">
              <div className='tab p-3'>
                <BulkPostComponent currentDomain={currentDomain} active={selectedTab === 'bulk-posts'} />
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