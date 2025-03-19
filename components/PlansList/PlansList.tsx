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
import ContentPlanStatusCell from './ContentPlanStatusCell'

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
    setLoading(true)
    if (domain_name) {
      getContentPlansByDomain(domain_name, paginator.paginationObj)
        .then(res => {
          if (res.data) {
            let newData = res.data.map(obj => {
              let newObj = obj;
              newObj.keyword = newObj?.keyword || 'N/A'
              return newObj;
            }
            )
            paginator.setItemCount(res.count)
            setData(newData)
            setLoading(false)
          }
          else {
            paginator.setItemCount(0)
            setLoading(false);
            setData(null)
          }

        })
    }
    else {
      getContentPlansByEmail(email, paginator.paginationObj)
        .then(res => {
          if (res.data) {
            let newData = res.data.map(obj => {
              let newObj = obj;
              newObj.keyword = newObj?.keyword || 'N/A'
              return newObj;
            }
            )
            paginator.setItemCount(res.count)
            setData(newData)
            setLoading(false)
          }
          else {
            paginator.setItemCount(0)
            setLoading(false);
            setData(null)
          }

        })
    }
  }



  useEffect(() => {
    let interval;
    if (active && !newModal) {
      fetchPlans();
      // interval = setInterval(fetchPlans, 300000)
    }

    return () => {
      clearInterval(interval);
    }
  }, [domain_name, active, paginator.currentPage, paginator.limit, newModal])



  const RenderTitle = ({ obj }) => {
    let domain = obj.domain_name.replace("https://", "").replace("http://", "").replace("www.", "").replaceAll("/", "")
    return (
      <div>
        <p className='mb-0'>
          {obj.keyword} {(domain !== domain_name) && <span className='badge bg-primary ms-2'>{obj.brand_name}</span>}
        </p>
        {(obj?.email && email !== obj?.email) && <span> by <span className="text-primary">{obj?.email}</span></span>}
      </div>
    )
  }

  const columnArray: TableColumnArrayProps[] = useMemo(() => {
    if (phone || tablet) {
      return [
        {
          id: 'keyword', Header: 'Keyword', accessor: (obj) => <RenderTitle obj={obj} />
        },
        { id: 'guid', Header: 'Actions', accessor: (obj) => <ContentPlanStatusCell plan={obj} setDeleteModal={setDeleteModal} setNewModal={setNewModal} setDuplicateInfo={setDuplicateInfo} />, headerClassName: 'text-end pe-3', cellClassName: 'max-325' },
      ];
    }
    else {
      return [
        { id: 'keyword', Header: 'Keyword', accessor: obj => <RenderTitle obj={obj} />, disableSortBy: false },
        { id: 'timestamp', Header: 'Timestamp', accessor: (obj) => moment(obj.timestamp + 'Z').format("dddd, MMMM Do, YYYY h:mma"), disableSortBy: false },
        { id: 'guid', Header: 'Actions', accessor: (obj) => <ContentPlanStatusCell plan={obj} setDeleteModal={setDeleteModal} setNewModal={setNewModal} setDuplicateInfo={setDuplicateInfo} />, headerClassName: 'text-end pe-3', cellClassName: 'max-325' },
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


