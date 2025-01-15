import { useEffect, useMemo, useState } from 'react'
import styles from './Reports.module.scss'
import Table, { TableColumnArrayProps } from '@/perfect-seo-shared-components/components/Table/Table'
import { deleteContentPlan, getAhrefsDomainRating, getAhrefsUrlRating, getGSCSearchAnalytics, getPostsByDomain } from '@/perfect-seo-shared-components/services/services'
import { useRouter } from 'next/navigation'
import * as Modal from '@/perfect-seo-shared-components/components/Modal/Modal'
import moment from 'moment-timezone'
import TypeWriterText from '@/perfect-seo-shared-components/components/TypeWriterText/TypeWriterText'
import { useDispatch, useSelector } from 'react-redux'
import usePaginator from '@/perfect-seo-shared-components/hooks/usePaginator'
import { selectEmail } from '@/perfect-seo-shared-components/lib/features/User'
import LoadSpinner from '../LoadSpinner/LoadSpinner'
import ContentPlanForm from '@/perfect-seo-shared-components/components/ContentPlanForm/ContentPlanForm'
import { createClient } from '@/perfect-seo-shared-components/utils/supabase/client'
import { QueueItemProps } from '@/perfect-seo-shared-components/data/types'
import * as Request from "@/perfect-seo-shared-components/data/requestTypes";
export interface PlanListProps {
  domain_name: string;
  url?: string;
  active: boolean;
}
const Reports = ({ domain_name, active }: PlanListProps) => {
  const [loading, setLoading] = useState(false)
  const [postsLoading, setPostsLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [GSCData, setGSCData] = useState<any>(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [newModal, setNewModal] = useState(false)
  const [duplicateInfo, setDuplicateInfo] = useState(null)
  const supabase = createClient()
  const email = useSelector(selectEmail)
  const dispatch = useDispatch()
  const [startDate, setStartDate] = useState(moment().subtract(90, "days").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"))
  const [showDetails, setShowDetails] = useState(true)
  const [posts, setPosts] = useState<any[]>([])
  const paginator = usePaginator()
  const postPaginator = usePaginator()

  const domainRatings = useMemo(() => {
    let ratings = {
      total: 0, count: 0, average: 0, data: []
    }

    if (data) {
      ratings.total = data.data.reduce((prev, acc) => prev + acc.domain_rating, 0)
      ratings.count = data.meta.total_records
      ratings.average = ratings.total / ratings.count
      ratings.data = data.data
      setLoading(false);
    }

    return ratings
  }, [data])

  const fetchAHREFSData = () => {
    let reqObj: Request.GSCRequest = {
      domain: domain_name,
      start_date: startDate,
      end_date: endDate,
      limit: paginator.limit,
      page: paginator.currentPage
    }

    getAhrefsDomainRating(reqObj)
      .then(res => {
        setLoading(false);
        setData(res.data)
        paginator.setItemCount(res.data.meta.total_records)
      })
      .catch(() => {
        setLoading(false);
        setData(null)
      })

  }

  const fetchGSCData = () => {
    let reqObj: Request.GSCRequest = {
      domain: domain_name,
      start_date: startDate,
      end_date: endDate,
    }
    getGSCSearchAnalytics(reqObj)
      .then(res => {

        setGSCData(res.data)
      })
      .catch(() => {

        setGSCData(null)
      })
  }

  const fetchPosts = () => {
    setPostsLoading(true)
    if (active) {
      getPostsByDomain(domain_name, { ...postPaginator.paginationObj, page: postPaginator.currentPage, has_live_post_url: true })
        .then(res => {
          postPaginator.setItemCount(res.data.total)
          setPosts(res.data.records)
          setPostsLoading(false)
        })
        .catch(err => {
          postPaginator.setItemCount(0)
          setPostsLoading(false);
          setPosts(null)
        })
    }
  }



  useEffect(() => {
    let interval;
    if (active && !newModal) {
      setLoading(true)
      fetchAHREFSData();
      interval = setInterval(fetchAHREFSData, 300000)
    }

    return () => {
      clearInterval(interval);
    }
  }, [domain_name, paginator?.currentPage, paginator?.limit, active, newModal])

  useEffect(() => {
    if (active && !newModal) {
      fetchGSCData();
    }
  }, [domain_name, startDate, endDate, active, newModal])

  useEffect(() => {
    let interval;
    if (active && !newModal) {
      fetchPosts();
      interval = setInterval(fetchPosts, 300000)
    }

    return () => {
      clearInterval(interval);
    }
  }, [domain_name, active, postPaginator.currentPage, postPaginator.limit, newModal])

  const columnArray: TableColumnArrayProps[] = [
    { id: 'date', Header: 'Date', accessor: (obj) => moment(obj?.date + 'Z', "YYYY-MM-DD").format("dddd, MMMM Do, YYYY"), disableSortBy: false },
    { id: 'domain_rating', Header: 'Rating', accessor: 'domain_rating', headerClassName: 'text-end', cellClassName: 'text-end' },
  ];

  const gscColumnArray: TableColumnArrayProps[] = [
    { id: 'total_clicks', Header: 'Total Clicks', accessor: (obj) => obj?.total_clicks.toLocaleString() },
    { id: 'total_impressions', Header: 'Total Impressions', accessor: (obj) => obj?.total_impressions.toLocaleString() },
    { id: 'avg_ctr', Header: 'Average CTR', accessor: (obj) => obj.avg_ctr.toFixed(3) },
    { id: 'avg_position', Header: 'Average Position', accessor: (obj) => obj.avg_position.toFixed(3) },
  ];

  const AHREFS = ({ obj }) => {
    // console.log(obj)
    const { live_post_url } = obj;
    const [urlRating, setUrlRating] = useState(null)
    const [gscData, setGSCData] = useState(null)

    useEffect(() => {
      let reqObj = {
        start_date: startDate,
        end_date: endDate,
        page_url: live_post_url
      }
      getAhrefsUrlRating(reqObj)
        .then(res => {
          if (res.data?.data.length > 0) {
            let newRating = res.data.data.reduce((prev, curr) => prev + curr.url_rating, 0)
            setUrlRating(newRating / res.data.data.length) // average rating
          }
        })
        .catch(err => {
          console.log(err)
        }
        )
      getGSCSearchAnalytics({ ...reqObj, domain: domain_name })
        .then(res => {
          if (res.data) {
            setGSCData(res.data.data[0]);
          }
        })
        .catch(err => {
          console.log(err)
        }
        )
    }, [live_post_url])

    return (
      <div className='card p-3'>
        <div className='row d-flex align-items-center justify-content-end'>
          <div className='col'>
            {obj.title}
          </div>
          <div className='col-12'>
            <div className='row d-flex align-items-center justify-content-end'>
              {gscData &&
                <>
                  <div className='col-4 col-lg-2'>
                    <p className='mb-0 text-end'>
                      <span className='text-primary me-2'>Total Clicks</span>
                      {gscData.total_clicks.toLocaleString()}
                    </p>
                  </div>
                  <div className='col-4 col-lg-2'>
                    <p className='mb-0 text-end'>
                      <span className='text-primary me-2'>Total Impressions</span>
                      {gscData.total_impressions.toLocaleString()}
                    </p>
                  </div>
                  <div className='col-4 col-lg-2'>
                    <p className='mb-0 text-end'>
                      <span className='text-primary me-2'>Average CTR</span>{gscData.avg_ctr.toFixed(3)}
                    </p>
                  </div>
                  <div className='col-4 col-lg-2'>
                    <p className='mb-0 text-end'>
                      <span className='text-primary me-2'>Average Position</span>{gscData.avg_position.toFixed(3)}
                    </p>
                  </div>
                </>
              }
              {urlRating > 0 && <div className='col-4 col-lg-2'>
                <p className='mb-0 text-end'>
                  <span className='text-primary me-2'>Rating</span>{urlRating.toFixed(2)}
                </p>
              </div>}
            </div>
          </div>
        </div>
      </div>
    )

  }


  const deleteHandler = (guid) => {
    deleteContentPlan(guid)
      .then(res => {
        setDeleteModal(null)
        fetchAHREFSData()
      })
      .catch(err => {
        setDeleteModal(null)
      }
      )
  }

  const newCloseHandler = () => {
    setDuplicateInfo(null)
    setTimeout(() => fetchAHREFSData(), 60000)
    return setNewModal(false)
  }

  const detailClickHandler = (e) => {
    e.preventDefault();
    setShowDetails(!showDetails)
  }

  return (
    <div className={styles.wrap}>
      <div className='row g-3 d-flex justify-content-between align-items-end mb-3'>
        <div className='col col-md-auto d-flex justify-content-center align-items-end'>
          <h2 className='text-white mb-0'>
            <TypeWriterText string="Domain Reporting" withBlink />
          </h2>
          <div>
            {paginator?.itemCount > 0 && <p className='badge rounded-pill text-bg-primary ms-3 d-flex align-items-center mb-1'>{paginator?.itemCount}</p>}
          </div>
        </div>
      </div>
      {loading && <LoadSpinner />}
      <div className='row d-flex justify-content-between align-items-start g-3'>
        <div className='col-12 col-xl-4'>
          <div className='card p-3'>
            <div className='row d-flex align-items-end'>
              <h3 className='col-12'>
                <span className='text-primary'>AHREFs Domain Rating</span>
                <span className='ms-2'>{domainRatings?.average?.toFixed(2)}</span>
              </h3>
              <div className='col-12 mb-2'>
                <a
                  className="text-white" onClick={detailClickHandler}
                >
                  {showDetails ?
                    <i className="bi bi-caret-up-fill me-2" />
                    : <i className="bi bi-caret-down-fill me-2" />
                  }
                  {showDetails ? 'Hide' : 'Show'} Daily Breakdown <i>(Last 30 days)</i></a></div>
            </div>
            {showDetails && <div className='col-12 pb-0'>
              {data?.data?.length > 0 ?
                <div className='mt-2'>

                  <Table rawData={data.data} isLoading={loading} columnArray={columnArray} />
                  <div className='col-auto d-flex justify-content-center'>
                    {paginator.renderComponent()}
                  </div>
                </div>
                : domainRatings?.average > 0 ?
                  <h5><TypeWriterText withBlink string="The are no results for the given parameters" /></h5>
                  : null}
            </div>}
          </div>
        </div>
        <div className='col-12 col-xl-8'>
          <div className='card p-3'>
            <div className='row d-flex'>
              <h3 className='text-primary'>Google Search Console </h3>
            </div>
            {GSCData?.data?.length >= 0 && <div className='col-12'>
              {GSCData?.data?.length > 0 ? <Table rawData={GSCData.data} isLoading={postsLoading} columnArray={gscColumnArray} />
                : <h5><TypeWriterText withBlink string="The are no results for the given parameters" /></h5>}
            </div>}
          </div>
        </div>
        <div className='col-12'>
          <div className='card p-3'>
            <div className='row d-flex'>
              <h3 className='text-primary'>Live Posts </h3>
            </div>
            {posts?.length >= 0 && <div className='col-12'>
              {posts.length > 0 ? <div className='row d-flex g-1'>{posts.map((obj, i) => <AHREFS key={i} obj={obj} />)}</div>
                : <h5><TypeWriterText withBlink string="The are no results for the given parameters" /></h5>}
            </div>}
            <div className='col-auto d-flex justify-content-center'>
              {postPaginator.renderComponent()}
            </div>
          </div>
        </div>
      </div>
      <Modal.Overlay open={newModal} onClose={newCloseHandler} closeIcon>
        <Modal.Title title="New Content Plan" />
        <Modal.Description className={styles.newModal}>
          <ContentPlanForm initialData={duplicateInfo} buttonLabel="Create Plan" submitResponse={newCloseHandler} isModal />
        </Modal.Description>
      </Modal.Overlay>
      <Modal.Overlay open={deleteModal} onClose={() => { setDeleteModal(null) }}>
        <Modal.Title title="Delete Plan" />
        <Modal.Description>
          Are you sure you want to delete this plan?
          <div className='d-flex justify-content-between mt-5'>
            <button onClick={() => { setDeleteModal(null) }} className="btn btn-warning">Cancel</button>
            <button onClick={(e) => { e.preventDefault(); deleteHandler(deleteModal) }} className="btn btn-primary">Yes</button>
          </div>
        </Modal.Description>
      </Modal.Overlay>
    </div>
  )

}

export default Reports
