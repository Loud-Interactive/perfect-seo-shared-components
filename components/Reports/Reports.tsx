import { useEffect, useMemo, useState } from 'react'
import styles from './Reports.module.scss'
import Table, { TableColumnArrayProps } from '@/perfect-seo-shared-components/components/Table/Table'
import { deleteContentPlan, getAhrefsDomainRating, getContentPlansByDomain, getContentPlansByEmail, getGSCSearchAnalytics } from '@/perfect-seo-shared-components/services/services'
import { useRouter } from 'next/navigation'
import * as Modal from '@/perfect-seo-shared-components/components/Modal/Modal'
import moment from 'moment-timezone'
import useViewport from '@/perfect-seo-shared-components/hooks/useViewport'
import TypeWriterText from '@/perfect-seo-shared-components/components/TypeWriterText/TypeWriterText'
import { useDispatch, useSelector } from 'react-redux'
import usePaginator from '@/perfect-seo-shared-components/hooks/usePaginator'
import { addToast, selectEmail, selectIsAdmin } from '@/perfect-seo-shared-components/lib/features/User'
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
  const [data, setData] = useState<any>()
  const { tablet, phone } = useViewport()
  const [deleteModal, setDeleteModal] = useState(null)
  const [newModal, setNewModal] = useState(false)
  const [duplicateInfo, setDuplicateInfo] = useState(null)
  const supabase = createClient()
  const email = useSelector(selectEmail)
  const isAdmin = useSelector(selectIsAdmin)
  const router = useRouter();
  const dispatch = useDispatch()
  const [startDate, setStartDate] = useState('2021-01-01');
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"))

  const paginator = usePaginator()

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

  const fetchPlans = () => {
    let reqObj: Request.GSCRequest = {
      domain: domain_name,
      start_date: startDate,
      end_date: endDate
    }
    getGSCSearchAnalytics(reqObj)
      .then(res => {
        setLoading(false);
      })
    getAhrefsDomainRating(reqObj)
      .then(res => {
        setData(res.data)
        console.log(res.data.data)
      })

  }


  const addToQueue = (obj) => {
    let newObject: QueueItemProps = {
      type: 'contentPlan',
      domain: obj?.domain_name,
      guid: obj?.guid,
      email,
      isComplete: obj?.status === 'Finished' ? true : false,
    }
    supabase
      .from('user_queues')
      .insert(newObject)
      .select("*")
      .then(res => {
        dispatch(addToast({ title: "Content Plan Added Content to Watchlist", type: "info", content: `${obj?.target_keyword} Content Plan for ${obj?.domain_name} added to Watchlist` }))
      })
  }

  useEffect(() => {
    let interval;
    if (active && !newModal) {
      setLoading(true)
      fetchPlans();
      interval = setInterval(fetchPlans, 300000)
    }

    return () => {
      clearInterval(interval);
    }
  }, [domain_name, active, paginator.currentPage, paginator.limit, newModal])

  const completeStatuses = ["Finished", "Your Content Plan Has Been Created"]


  const columnArray: TableColumnArrayProps[] = useMemo(() => {

    return [
      { id: 'date', Header: 'Date', accessor: (obj) => moment(obj.date + 'Z', "YYYY-MM-DD").format("dddd, MMMM Do, YYYY"), disableSortBy: false },
      { id: 'domain_rating', Header: 'Rating', accessor: 'domain_rating', headerClassName: 'text-end', cellClassName: 'text-end' },
    ];
  }, [phone, tablet, domain_name])

  const deleteHandler = (guid) => {
    deleteContentPlan(guid)
      .then(res => {
        setDeleteModal(null)
        fetchPlans()
      })
      .catch(err => {
        setDeleteModal(null)
      }
      )
  }

  const newCloseHandler = () => {
    setDuplicateInfo(null)
    setTimeout(() => fetchPlans(), 60000)
    return setNewModal(false)
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
      <div className='row d-flex justify-content-center'>
        <div className='col-12'>
          <h3>AHREFs Domain Rating | <span className='ms-2'>{domainRatings?.average}</span></h3>
        </div>
        {data?.data?.length > 0 ?
          <>

            <Table rawData={data.data} isLoading={loading} columnArray={columnArray} />
            <div className='col-auto d-flex justify-content-center'>
              {paginator.renderComponent()}
            </div>
          </>
          : domainRatings?.average > 0 ?
            <h5><TypeWriterText withBlink string="The are no results for the given parameters" /></h5>
            : null}
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
