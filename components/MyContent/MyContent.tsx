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
import Loader from '@/components/Templates/Loader/Loader'
export interface MyContentProps {
  currentDomain?: string;
  startDate?: string;
  endDate?: string;
  hideTitle?: boolean;
}
const MyContent = ({ currentDomain, startDate, endDate, hideTitle = false }: MyContentProps) => {
  const { user, isAdmin, isLoading, isLoggedIn, profile } = useSelector((state: RootState) => state);
  const [selectedTab, setSelectedTab] = useState('posts')
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('tab');
  const router = useRouter();
  const pathname = usePathname()
  const [domain, setDomain] = useState(currentDomain || profile?.domains[0])
  const [selected, setSelected] = useState(null)


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
  ]
  const searchUserChangeHandler = (e) => {
    setDomain(e.value);
    setSelected(e)
  };

  const domainsList = useMemo(() => {
    let domains;
    if (profile?.domains) {
      domains = [...profile?.domains];
      domains = domains?.sort((a, b) => a.localeCompare(b)).map((domain) => ({ label: domain, value: domain }))
    }

    return domains;

  }, [profile?.domains])

  useEffect(() => {
    if (profile?.domains?.length > 0 && !currentDomain) {
      setDomain(profile?.domains[0])
      setSelected({ label: profile?.domains[0], value: profile?.domains[0] })
    }
  }, [profile?.domains, currentDomain])

  const isAuthorized = useMemo(() => {
    let bool = false;
    if (isAdmin) {
      bool = true
    } else if (user?.email) {
      bool = (profile?.domains.includes(currentDomain?.toLowerCase()) || user?.email.split('@')[1] === currentDomain || isAdmin)
    }
    return bool
  }, [user, isAdmin, currentDomain])
  if (isLoading) return <Loader />
  else if (!isAuthorized) {
    return (
      <div className="container strip-padding d-flex align-items-center">
        <h1 className="text-3xl font-bold text-center mb-3"><TypeWriterText string={isLoggedIn ? 'You are not authorized to view this domains content' : 'Log in to view your content'} withBlink /></h1>
      </div>
    )
  }
  return (
    <div className='container-xl content-fluid'>
      {!hideTitle && <div className='row d-flex justify-content-between'>
        <div className='col'>
          <h1 className="text-3xl font-bold text-start mb-5"><TypeWriterText string={`Content for ${domain}`} withBlink /></h1>
        </div>
        {(!currentDomain && profile?.domains?.length > 1) && <div className='col-12 col-md-4'>
          <SearchSelect
            onChange={searchUserChangeHandler}
            options={domainsList}
            value={selected}
            placeholder="Search Domain..."
          />
        </div>}
      </div>}
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
          <div className={`tab-pane fade ${selectedTab === 'posts' && 'show active'}`} id="posts" role="tabpanel" aria-labelledby="posts-tab">
            <div className='tab p-3'>
              <PostsList startDate={startDate} endDate={endDate} active={selectedTab === 'posts'} domain_name={domain} />
            </div>
          </div>
          <div className={`tab-pane fade ${selectedTab === 'content-plan' && 'show active'}`} id="content-plan" role="tabpanel" aria-labelledby="content-plan-tab">
            <div className='tab p-3'>
              <PlansList startDate={startDate} endDate={endDate} active={selectedTab === 'content-plan'} domain_name={domain} />
            </div>
          </div>

        </div>
      </div>
    </div >
  )
}

export default MyContent