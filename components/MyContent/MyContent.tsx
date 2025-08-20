'use client'
import en from '@/assets/en.json';
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
import { getSynopsisInfo } from '@/perfect-seo-shared-components/services/services';
import BulkContentComponent from '../BulkContentGenerator/BulkContentComponent';
import OutlinesList from '../OutlinesList/OutlinesList';
import BrandHeader from '../BrandHeader/BrandHeader';
import LoadSpinner from '../LoadSpinner/LoadSpinner';
import { selectDomains, selectDomainsInfo, selectEmail, selectIsAdmin, selectIsLoading, selectIsLoggedIn, selectSettings, selectUser, setUserSettings } from '@/perfect-seo-shared-components/lib/features/User'
import Tooltip from '../Tooltip';
import Reports from '../Reports/Reports';
import CustomTabs, { CustomTabContent, TabItem } from '../CustomTabs/CustomTabs';


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
  const isLoading = useSelector(selectIsLoading)
  const domain_access = useSelector(selectDomains)
  const email = useSelector(selectEmail)

  const [selectedTab, setSelectedTab] = useState('content-plans')
  const [domain, setDomain] = useState(currentDomain || null)
  const [selected, setSelected] = useState(null)
  const [domains, setDomains] = useState([])
  const [accessibleDomains, setAccessibleDomains] = useState([])
  const [reverify, setReverify] = useState(false)
  const [dataTracked, setDataTracked] = useState(false)
  const [synopsis, setSynopsis] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let data = null;
    if ((currentDomain || domain) && domainsInfo) {
      let checkDomain = currentDomain || domain
      data = domainsInfo.find(obj => obj?.domain === checkDomain)
      if (data !== null) {
        getSynopsisInfo(checkDomain)
          .then(res => {
            console.log(res)
            if (res.data) {
              setSynopsis(res?.data[0])
            }
            else {
              setSynopsis(null)

            }
          })
      }
    }
    else {
      console.log(data)
      setSynopsis(data)
    }

  }, [currentDomain, domainsInfo, domain])

  useEffect(() => {
    if (email && domain && !dataTracked) {
      supabase
        .from('user_history')
        .insert({ email: email, domain: domain, transaction_data: { page: 'my-content', tab: selectedTab || queryParam || 'posts' }, product: en?.product, action: "View Content", type: "VIEW" })
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

  useEffect(() => {
    if (queryParam) {
      if (['bulk-content', 'bulk-posts'].includes(queryParam) && domainParam) {
        router.replace(`${pathname}?tab=${queryParam}`)
        setSelectedTab(queryParam)
      }
      else {
        setSelectedTab(queryParam)
      }
    }
  }, [queryParam])



  const TabData: TabItem[] = useMemo(() => {

    let tabListStart: TabItem[] = [{ key: "content-plans", title: "Content Plans" },
    { key: "outlines", title: "Outlines" },
    { key: "posts", title: "Posts" }]
    let bulkTabs: TabItem[] = [
      { key: "bulk-content", title: "Bulk Content Plans" },
      { key: "bulk-posts", title: "Bulk Posts" },]

    if (isAdmin && domain) {
      tabListStart = [...tabListStart, { key: "reports", title: "Reports" }]
    }
    return [...tabListStart, ...bulkTabs]
  }, [isAdmin, domain])

  const searchDomainChangeHandler = (e) => {
    if (e) {
      setDomain(e?.value);
      setSelected(e)
      setDataTracked(false)
      const params = new URLSearchParams(searchParams.toString());
      params.set("domain", e.value);
      if (selectedTab) {
        params.set("tab", selectedTab);
      }
      router.replace(pathname + '?' + params.toString());
    }
    else {
      setDomain(null);
      setSelected(null)
      setSynopsis(null)
      const params = new URLSearchParams(searchParams.toString());
      params.delete("domain");
      if (selectedTab) {
        params.set("tab", selectedTab);
      }
      router.replace(pathname + '?' + params.toString());
    }
  };

  const supabase = createClient();

  const fetchDomains = () => {
    supabase
      .from("domains")
      .select("*")
      .eq('hidden', false)
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

  // Check domain_access against hidden domains in database
  const checkAccessibleDomains = useCallback(async () => {
    if (domain_access?.length > 0) {
      const siteUrls = domain_access.map(domain => domain.siteUrl)

      const { data: hiddenDomains } = await supabase
        .from('domains')
        .select('domain')
        .in('domain', siteUrls)
        .eq('hidden', true)

      const hiddenDomainsList = hiddenDomains?.map(d => d.domain) || []

      // Filter out hidden domains from domain_access
      const filteredDomains = domain_access.filter(domain =>
        !hiddenDomainsList.includes(domain.siteUrl)
      )

      setAccessibleDomains(filteredDomains)
    }
  }, [domain_access])

  useEffect(() => {
    if (domain_access?.length > 0) {
      checkAccessibleDomains()
    }
  }, [domain_access, checkAccessibleDomains])

  const domainsList = useMemo(() => {
    let list: any = []
    if (isAdmin) {
      list = [...list, ...domains?.sort((a, b) => a.domain.localeCompare(b.domain)).map(({ domain }) => ({ label: domain, value: domain }))]
    }
    else if (accessibleDomains?.length > 0) {
      list = [...list, ...accessibleDomains.map((domain) => {
        return domain?.siteUrl?.toLowerCase()
      })].sort((a, b) => a?.localeCompare(b)).map((domain) => {
        checkDomain(domain)
        return ({ label: domain, value: domain })
      });
    }
    if (list?.length > 0) {
      if (!isAdmin) {
        setDomain(list[0].value);
        setSelected(list[0]);
      }
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

  }, [accessibleDomains, domains, isAdmin])

  const isAuthorized = useMemo(() => {
    let bool = true;
    if (isLoading) {
      return true
    } else if (isAdmin) {
      return true
    } else if (accessibleDomains?.length > 0 && accessibleDomains.map(({ siteUrl }) => siteUrl).length > 0) {
      if (currentDomain) {
        let domain = currentDomain;
        bool = (accessibleDomains.map(({ siteUrl }) => siteUrl).includes(domain?.toLowerCase()))
      }
      else if (selected?.value) {
        let domain = selected.value
        bool = (accessibleDomains.map(({ siteUrl }) => siteUrl).includes(domain?.toLowerCase()))
      }
      else {
        bool = true
      }
    }
    if (bool === false && email && (currentDomain || selected?.value) && (domainsList || accessibleDomains)) {
      supabase
        .from('user_history')
        .insert({ email: email, domain: currentDomain || selected?.value, transaction_data: { domains: domainsList || accessibleDomains }, product: en.product, action: "Unauthorized My Content", type: "UNAUTHORIZED" })
        .select('*')
        .then(res => {
        })
    }
    return bool
  }, [currentDomain, selected, domainsList, accessibleDomains, isLoading])

  useEffect(() => {
    if (isAdmin) {
      fetchDomains();
    }
  }, [isAdmin])




  if (isAuthorized === false && isLoading === false) {
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

  if (isLoading === false && isLoggedIn === false) {
    return (
      <div className="container-fluid container-xl strip-padding d-flex justify-content-center align-items-center">
        <h1><TypeWriterText string="Please login to continue" withBlink /></h1>
      </div>
    )
  }

  return (
    <>
      {hideTitle ? null :
        <div className='container-fluid container-xl'>
          <div className='card p-3 bg-secondary my-3'>
            <div className='row g-3 align-items-center justify-content-between'>
              {(synopsis && ['bulk-content', 'bulk-posts'].includes(selectedTab) === false) ?
                <>
                  <BrandHeader synopsis={synopsis} />
                </> :
                <div className='col'>
                  <h1 className="text-start mb-0 text-primary"><TypeWriterText string={selectedTab.includes("bulk") ? 'Upload for all domains' : selected ? `Content for ${domain}` : 'Your Content'} withBlink /></h1>
                </div>
              }
              {(domainsList?.length > 0 && ['bulk-content', 'bulk-posts'].includes(selectedTab) === false && !currentDomain) &&
                <div className='col-12 d-flex align-items-center'>
                  <div className='bg-primary card p-3'>
                    <div className='row d-flex align-items-end g-2 min-350'>
                      <div className='col'>
                        <div className='formField'>
                          <label className='formField-label text-white'>Select a Domain or clear input for content by email address</label>
                          <SearchSelect
                            onChange={searchDomainChangeHandler}
                            options={domainsList}
                            isLoading={!domainsList}
                            value={selected || null}
                            placeholder="Select a Domain"
                            bottomSpacing={false}
                            className='w-100'
                          />
                        </div>
                      </div>
                      <div className="col-auto mb-2">
                        <Tooltip>
                          Clear search field to see all content by email
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }
      <div className='container-xl content-fluid rc relative'>
        {/* {isLoading && <LoadSpinner />} */}
        <CustomTabs
          tabs={TabData}
          activeTab={selectedTab}
          onTabChange={setSelectedTab}
          enableRouting={true}
          domain={currentDomain || domain}
          tabsRequiringDomain={[]} // All tabs in MyContent use domain
        >
          <CustomTabContent tabKey="outlines" activeTab={selectedTab}>
            <Suspense fallback={<LoadSpinner />}>
              <OutlinesList active={!loading && selectedTab === 'outlines'} domain_name={currentDomain || domain} />
            </Suspense>
          </CustomTabContent>

          <CustomTabContent tabKey="posts" activeTab={selectedTab}>
            <Suspense fallback={<LoadSpinner />}>
              <PostsList active={!loading && selectedTab === 'posts'} domain_name={currentDomain || domain} />
            </Suspense>
          </CustomTabContent>

          <CustomTabContent tabKey="content-plans" activeTab={selectedTab}>
            <Suspense fallback={<h1>fallback</h1>}>
              <PlansList active={!loading && selectedTab === 'content-plans'} domain_name={currentDomain || domain} />
            </Suspense>
          </CustomTabContent>

          <CustomTabContent tabKey="reports" activeTab={selectedTab}>
            <Reports active={!loading && selectedTab === 'reports'} domain_name={currentDomain || domain} />
          </CustomTabContent>

          <CustomTabContent tabKey="bulk-content" activeTab={selectedTab}>
            <Suspense fallback={<LoadSpinner />}>
              <BulkContentComponent currentDomain={currentDomain} active={!loading && selectedTab === 'bulk-content'} />
            </Suspense>
          </CustomTabContent>

          <CustomTabContent tabKey="bulk-posts" activeTab={selectedTab}>
            <Suspense fallback={<LoadSpinner />}>
              <BulkPostComponent currentDomain={currentDomain} active={!loading && selectedTab === 'bulk-posts'} />
            </Suspense>
          </CustomTabContent>
        </CustomTabs>
        {/* <div className="strip-padding container-fluid container-xl d-flex align-items-center justify-content-center">
            <h2 className='text-center text-primary'><TypeWriterText string="No domain selected" withBlink /></h2>
          </div> */}
      </div>
    </>
  )
}

export default MyContent