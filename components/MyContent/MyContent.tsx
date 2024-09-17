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

const MyContent = ({ currentDomain }) => {
  const { user } = useSelector((state: RootState) => state);
  const [selectedTab, setSelectedTab] = useState('posts')
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('tab');
  const router = useRouter();
  const pathname = usePathname()
  const [domain, setDomain] = useState(currentDomain || user?.domains[0])
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
    router.replace(pathname + '?' + createQueryString('tab', val))
  }

  useEffect(() => {
    if (queryParam) {
      setSelectedTab(queryParam)
    }
  }, [queryParam])

  useEffect(() => {
    console.log(user?.domains)
  }, [user])
  const TabData = [
    { key: "posts", title: "Generated Posts" },
    { key: "content-plan", title: "Content Plans" },
  ]
  const searchUserChangeHandler = (e) => {
    setDomain(e?.value);
  };

  const domainsList = useMemo(() => {
    let domains;
    if (user?.domains) {
      domains = [...user?.domains];
      domains = domains?.sort((a, b) => a.localeCompare(b)).map((domain) => ({ label: domain, value: domain }))
    }

    return domains;

  }, [user?.domains])
  return (
    <div className='container-xl content-fluid'>
      <div className='row d-flex justify-content-between'>
        <div className='col'>
          <h1 className="text-3xl font-bold text-start mb-5"><TypeWriterText string={`Content for ${domain}`} withBlink /></h1>
        </div>
        {user?.domains?.length > 1 && <div className='col-12 col-md-4'>
          <SearchSelect
            onChange={searchUserChangeHandler}
            options={domainsList}
            placeholder="Search Domain..."
          />
        </div>}
      </div>
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
              <PostsList active={selectedTab === 'posts'} domain_name={domain} />
            </div>
          </div>
          <div className={`tab-pane fade ${selectedTab === 'content-plan' && 'show active'}`} id="content-plan" role="tabpanel" aria-labelledby="content-plan-tab">
            <div className='tab p-3'>
              <PlansList active={selectedTab === 'content-plan'} domain_name={domain} />
            </div>
          </div>

        </div>
      </div>
    </div >
  )
}

export default MyContent