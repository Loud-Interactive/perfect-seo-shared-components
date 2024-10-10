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
import BulkContentPlanGenerator from '../BulkContentGenerator/BulkContentGenerator';
import BulkPostGenerator from '../BulkPostGenerator/BulkPostGenerator';
export interface MyContentProps {
  currentDomain?: string;
  hideTitle?: boolean;
}
const MyContent = ({ currentDomain, hideTitle = false }: MyContentProps) => {
  const { user, isAdmin, isLoading, isLoggedIn, profile } = useSelector((state: RootState) => state);
  const [selectedTab, setSelectedTab] = useState('posts')
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('tab');
  const domainParam = searchParams.get('domain');
  const router = useRouter();
  const pathname = usePathname()
  const [domain, setDomain] = useState(currentDomain || profile?.domains[0])
  const [selected, setSelected] = useState(null)
  const [domains, setDomains] = useState([])

  useEffect(() => {
    if (user?.email && domain) {
      supabase
        .from('user_history')
        .insert({ email: user.email, domain: domain, transaction_data: { page: 'my-content', tab: selectedTab || queryParam || 'posts' }, product: en?.product })
        .select('*')
    }
  }, [domain, selectedTab, user])

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
      setSelectedTab(queryParam)
    }
  }, [queryParam])

  const TabData = [
    { key: "posts", title: "Generated Posts" },
    { key: "content-plan", title: "Content Plans" },
    // { key: "bulk-upload", title: "Bulk Upload" },
  ]
  const searchUserChangeHandler = (e) => {
    if (e) {
      setDomain(e?.value);
      router.replace(pathname + '?' + createQueryString('domain', e?.value))
      setSelected(e)
    }
    else {
      setDomain(null);
      setSelected(null)
      if (queryParam) {
        router.replace(pathname + '?tab=' + queryParam.toString())
      }
      else {
        router.replace(pathname)
      }
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
    supabase
      .from('domains')
      .select("*")
      .eq('domain', urlSanitization(domain))
      .select()
      .then(res => {
        if (res.data.length === 0) {
          console.log(`Domain not found, now adding ${domain}`)
          supabase
            .from('domains')
            .insert([
              { 'domain': urlSanitization(domain) }
            ])
            .select();
        }
      })
  }

  const domainsList = useMemo(() => {
    let list;
    if (isAdmin) {
      list = domains?.sort((a, b) => a.domain.localeCompare(b.domain)).map(({ domain }) => ({ label: domain, value: domain }))
    }
    else if (profile?.domains) {
      list = [...profile?.domains];
      list = domains?.sort((a, b) => a.localeCompare(b)).map((domain) => {
        checkDomain(domain)
        return ({ label: domain, value: domain })
      })
    }
    return list;

  }, [profile?.domains, domains, isAdmin])


  useEffect(() => {
    if (currentDomain) {
      setDomain(currentDomain)
      setSelected({ label: currentDomain, value: currentDomain })
    }
    else if (domainsList?.length > 0) {
      if (domainParam) {
        setSelected(domainsList.find(({ value }) => value === domainParam));
        setDomain(domainParam)
      }
      else if (profile?.domains?.length > 0 && !currentDomain) {
        setDomain(profile?.domains[0])
        setSelected({ label: profile?.domains[0], value: profile?.domains[0] })
      }
    }
  }, [domainParam, domainsList, currentDomain, profile])

  const isAuthorized = useMemo(() => {
    let bool = false;
    if (isAdmin) {
      bool = true
    } else if (user?.email) {
      if (selected?.value) {
        let domain = currentDomain || selected?.value
        bool = (profile?.domains.includes(domain?.toLowerCase()) || isAdmin)
      }
      else if (currentDomain) {
        let domain = currentDomain
        bool = (profile?.domains.includes(domain?.toLowerCase()) || isAdmin)
      }
      else {
        bool = true
      }


    }
    return bool
  }, [user, isAdmin, currentDomain, selected])

  useEffect(() => {
    if (isAdmin) {
      fetchDomains();
    }
  }, [isAdmin])

  if (isLoading) {
    return (
      <div className='strip-padding'>
        <Loader />
      </div>
    )
  }
  else if (!isAuthorized) {
    return (
      <div className="container-fluid container-xl strip-padding d-flex align-items-center">
        <h1 className="text-3xl font-bold text-center mb-3"><TypeWriterText string={isLoggedIn ? `You are not authorized to view content for ${currentDomain || selected?.value || 'this domain'}` : 'Log in to view your content'} withBlink /></h1>
      </div>
    )
  }
  return (
    <div className='container-xl content-fluid'>
      {!hideTitle && <div className='row d-flex justify-content-between'>
        <div className='col'>
          <h1 className="text-3xl font-bold text-start mb-5"><TypeWriterText string={selectedTab === 'bulk-upload' ? 'Upload for all domains' : selected ? `Content for ${domain}` : 'Select a domain to begin'} withBlink /></h1>
        </div>
        {(!currentDomain && profile?.domains?.length > 1 && selectedTab !== 'bulk-upload') && <div className='col-12 col-md-4 mb-3'>
          <SearchSelect
            onChange={searchUserChangeHandler}
            options={domainsList}
            value={selected}
            placeholder="Select a Domain"
          />
        </div>}
      </div>}
      {selected ? <div className={styles.tabWrap}>
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
          <div className={`tab-pane fade ${selectedTab === 'posts' && 'show active'}`} id="posts" role="tabpanel" aria-labelledby="posts-tab">
            <div className='tab p-3'>
              <BulkPostGenerator />
              <PostsList active={selectedTab === 'posts'} domain_name={domain} />
            </div>
          </div>
          <div className={`tab-pane fade ${selectedTab === 'content-plan' && 'show active'}`} id="content-plan" role="tabpanel" aria-labelledby="content-plan-tab">
            <div className='tab p-3'>
              <BulkContentPlanGenerator />
              <PlansList active={selectedTab === 'content-plan'} domain_name={domain} />
            </div>
          </div>
        </div>
      </div> :
        <div className="strip-padding container-fluid container-xl d-flex align-items-center justify-content-center">
          <h2 className='text-center text-primary'><TypeWriterText string="No domain selected" withBlink /></h2>
        </div>}
    </div>
  )
}

export default MyContent