import { useEffect, useMemo, useState } from 'react'
import styles from './PlansList.module.scss'
import Table, { TableColumnArrayProps } from '@/perfect-seo-shared-components/components/Table/Table'
import { deleteContentPlan, getContentPlansByDomain, getContentPlansByEmail } from '@/perfect-seo-shared-components/services/services'
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

export interface PlanListProps {
  domain_name: string;
  active: boolean;
}
const PlansList = ({ domain_name, active }: PlanListProps) => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>()
  const { tablet, phone } = useViewport()
  const [deleteModal, setDeleteModal] = useState(null)
  const [newModal, setNewModal] = useState(false)
  const [duplicateInfo, setDuplicateInfo] = useState(null)
  const supabase = createClient()
  const email = useSelector(selectEmail)
  const isAdmin = useSelector(selectIsAdmin)
  const router = useRouter();
  const dispatch = useDispatch()

  const paginator = usePaginator()

  const fetchPlans = () => {
    if (domain_name) {
      getContentPlansByDomain(domain_name, paginator.paginationObj)
        .then(res => {
          let newData = res.data.items.map(obj => {
            let newObj = obj;
            newObj.target_keyword = newObj?.keyword || 'N/A'
            return newObj;
          }
          )
          paginator.setItemCount(res.data.total)
          setData(newData)
          setLoading(false)
        })

        .catch(err => {
          paginator.setItemCount(0)
          setLoading(false);
          setData(null)
        })
    }
    else {
      getContentPlansByEmail(email, paginator.paginationObj)
        .then(res => {
          let newData = res.data.items.map(obj => {

            let newObj = obj;
            newObj.target_keyword = newObj?.keyword || 'N/A'
            return newObj;
          }
          )
          paginator.setItemCount(res.data.total)
          setData(newData)
          setLoading(false)
        })

        .catch(err => {
          paginator.setItemCount(0)
          setLoading(false);
          setData(null)
        })
    }
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

  const renderStatusCell = (obj) => {

    const { status } = obj;
    const clickHandler = (e) => {
      e.preventDefault();
      if (completeStatuses.includes(status)) {
        router.push(`/dashboard/${obj.guid}`)
      }
      else {
        router.push(`/waiting-room/${obj.guid}`)
      }
    }
    const deleteClickHandler = (e) => {
      e.preventDefault();
      setDeleteModal(obj.guid)
    }

    const duplicateClickHandler = (obj) => {

      let newData = {
        email: obj.email,
        brandName: obj.brand_name,
        domainName: obj.domain_name,
        targetKeyword: obj.target_keyword,
        entityVoice: obj?.entity_voice,
        priorityCode: obj?.priority_code,
        writing_language: obj?.writing_language,
        url1: obj?.inspiration_url_1,
        url2: obj?.inspiration_url_2,
        url3: obj?.inspiration_url_3,
        priority1: obj?.inspirational_url_1_priority,
        priority2: obj?.inspirational_url_2_priority,
        priority3: obj?.inspirational_url_3_priority
      }

      setDuplicateInfo(newData)
      setNewModal(true)
    }

    return (
      <div className='d-flex justify-content-end align-items-center'>
        {/* {isAdmin && <div className='me-2'>{obj?.guid}</div>} */}
        {(completeStatuses.includes(status) === false) &&
          <span className='text-primary'>
            <TypeWriterText string={status} withBlink />
          </span>
        }
        <div className='input-group d-flex justify-content-end'>
          {(completeStatuses.includes(status)) &&
            <button className="btn btn-primary" onClick={clickHandler} title={`View GUID: ${obj.guid}`}>View Plan</button>
          }
          <button className='btn btn-primary d-flex align-items-center justify-content-center' onClick={(e) => { e.preventDefault(); duplicateClickHandler(obj) }} title={`Duplicate: ${obj.guid}`}>
            <i className="bi bi-clipboard-plus-fill" />
          </button>
          {isAdmin && <button className='btn btn-primary d-flex align-items-center justify-content-center' onClick={(e) => { e.preventDefault(); addToQueue(obj) }} title={`Add to Watchlist: ${obj.guid}`}>
            <i className="material-icons">queue</i>
          </button>}
          <button className='btn btn-warning d-flex align-items-center justify-content-center' onClick={deleteClickHandler} title={`View GUID: ${obj.guid}`}><i className="bi bi-trash pt-1" /></button>
        </div>
      </div>
    )
  }


  const RenderTitle = ({ obj }) => {
    let domain = obj.domain_name.replace("https://", "").replace("http://", "").replace("www.", "").replaceAll("/", "")
    return (
      <div>
        <p className='mb-0'>
          {obj.target_keyword} {(domain !== domain_name) && <span className='badge bg-primary ms-2'>{obj.brand_name}</span>}
        </p>
        {email !== obj?.email && <span> by <span className="text-primary">{obj?.email}</span></span>}
      </div>
    )
  }

  const columnArray: TableColumnArrayProps[] = useMemo(() => {
    if (phone || tablet) {
      return [
        {
          id: 'target_keyword', Header: 'Target Keyword', accessor: (obj) => <RenderTitle obj={obj} />
        },
        { id: 'guid', Header: 'Actions', accessor: renderStatusCell, headerClassName: 'text-end pe-3', cellClassName: 'max-325' },
      ];
    }
    else {
      return [
        { id: 'target_keyword', Header: 'Target Keyword', accessor: obj => <RenderTitle obj={obj} />, disableSortBy: false },
        { id: 'timestamp', Header: 'Timestamp', accessor: (obj) => moment(obj.timestamp + 'Z').format("dddd, MMMM Do, YYYY h:mma"), disableSortBy: false },
        { id: 'guid', Header: 'Actions', accessor: renderStatusCell, headerClassName: 'text-end pe-3', cellClassName: 'max-325' },
      ];
    }
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
            <TypeWriterText string="Content Plans" withBlink />
          </h2>
          <div>
            {paginator?.itemCount > 0 && <p className='badge rounded-pill text-bg-primary ms-3 d-flex align-items-center mb-1'>{paginator?.itemCount}</p>}
          </div>
        </div>
        <div className='col-12 col-md-auto d-flex justify-content-center align-items-center'>
          <div className='input-group'>
            <button onClick={() => setNewModal(true)} className='btn btn-primary'><i className="bi bi-plus" />New Content Plan</button>
            <button onClick={() => fetchPlans()} disabled={loading} className='btn btn-warning'><i className="bi bi-arrow-clockwise" /></button>
          </div>
        </div>
      </div>
      {loading && <LoadSpinner />}
      {data?.length > 0 ?

        <div className='row d-flex justify-content-center'>
          <Table rawData={data} isLoading={loading} columnArray={columnArray} />
          <div className='col-auto d-flex justify-content-center'>
            {paginator.renderComponent()}
          </div>
        </div>
        :
        <h5><TypeWriterText withBlink string="The are no results for the given parameters" /></h5>
      }
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

export default PlansList


