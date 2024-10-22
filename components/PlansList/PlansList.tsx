import { useEffect, useMemo, useState } from 'react'
import styles from './PlansList.module.scss'
import Table, { TableColumnArrayProps } from '@/perfect-seo-shared-components/components/Table/Table'
import { deleteContentPlan, getPreviousPlans } from '@/perfect-seo-shared-components/services/services'
import { useRouter } from 'next/navigation'
import * as Modal from '@/perfect-seo-shared-components/components/Modal/Modal'
import moment from 'moment-timezone'
import useViewport from '@/perfect-seo-shared-components/hooks/useViewport'
import Loader from '../Loader/Loader'
import TypeWriterText from '@/perfect-seo-shared-components/components/TypeWriterText/TypeWriterText'
import { useSelector } from 'react-redux'
import { RootState } from '@/perfect-seo-shared-components/lib/store'

export interface PlanListProps {
  domain_name: string;
  active: boolean;
}
const PlansList = ({ domain_name, active }: PlanListProps) => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>()
  const { tablet, phone } = useViewport()
  const [deleteModal, setDeleteModal] = useState(null)
  const [filter, setFilter] = useState('all');
  const router = useRouter();
  const { user, isAdmin } = useSelector((state: RootState) => state);

  const fetchPlans = () => {
    getPreviousPlans(domain_name)
      .then(res => {
        let newData = res.data.filter(obj => {
          return obj.status
        })
        setData(newData)
        setLoading(false)
      })
  }
  useEffect(() => {
    let interval;
    if (domain_name && active) {
      fetchPlans();
      setInterval(fetchPlans, 60000)
    }

    return () => {
      clearInterval(interval);
    }
  }, [domain_name, active])

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
    return (
      <div className='d-flex justify-content-end align-items-center'>
        {isAdmin && <div className='me-2'>{obj?.guid}</div>}
        {(completeStatuses.includes(status)) ?

          <button className="btn btn-primary" onClick={clickHandler} title={`View GUID: ${obj.guid}`}>View Plan</button>
          :
          <span className='text-primary'>
            <TypeWriterText string={status} withBlink />
          </span>
        }
        <button className='btn btn-warning d-flex align-items-center justify-content-center ms-2' onClick={deleteClickHandler} title={`View GUID: ${obj.guid}`}><i className="bi bi-trash pt-1" /></button>
      </div>
    )
  }

  const filteredData = useMemo(() => {
    let newData;
    if (!data) {
      return null
    }
    if (filter === 'all') {
      newData = data
    }
    else if (filter === 'completed') {
      newData = data.filter((post) => post.status === 'Finished')
    }
    else if (filter === 'other') {
      newData = data.filter((post) => post.status !== 'Finished')
    }

    return newData.sort((a, b) => (b.timestamp + 'Z').localeCompare(a.timestamp + 'Z'))
  }, [data, filter])

  const handleFilterChange = (e) => {
    setFilter(e.target.value)
  }

  const renderTitle = (obj) => {
    return (
      <div>
        <p className='mb-0'>
          {obj.target_keyword}
        </p>
        {user?.email !== obj?.email && <span> by <span className="text-primary">{obj?.email}</span></span>}
      </div>
    )
  }

  const columnArray: TableColumnArrayProps[] = useMemo(() => {
    if (phone || tablet) {
      return [
        { id: 'target_keyword', Header: 'Target Keyword', accessor: renderTitle },
        { id: 'guid', Header: 'Actions', accessor: renderStatusCell, headerClassName: 'text-end pe-3', cellClassName: 'max-325' },
      ];
    }
    else {
      return [
        { id: 'target_keyword', Header: 'Target Keyword', accessor: renderTitle, disableSortBy: false },
        { id: 'timestamp', Header: 'Timestamp', accessor: (obj) => moment(obj.timestamp + 'Z').format("dddd, MMMM Do, YYYY h:mma"), disableSortBy: false },
        { id: 'guid', Header: 'Actions', accessor: renderStatusCell, headerClassName: 'text-end pe-3', cellClassName: 'max-325' },
      ];
    }
  }, [phone, tablet])

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
  return (
    <div className={styles.wrap}>
      <div className='row d-flex justify-content-between align-items-end my-3'>
        <div className='col-12 col-md-auto d-flex align-items-end'>
          <h2 className='text-primary mb-0'>
            <TypeWriterText string="Content Plans" withBlink />
          </h2>
          {filteredData?.length > 0 && <p className='badge rounded-pill text-bg-primary ms-3 d-flex align-items-center mb-1'>{filteredData.length}</p>}
        </div>
        <div className='col-auto me-2'>
          <div className="form-group">
            <label className="form-label"><strong>Filter</strong></label>
            <select className="form-control" value={filter} onChange={handleFilterChange}>
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="other">Processing</option>
            </select>
          </div>
        </div>
      </div>
      {loading ? <Loader />
        : filteredData?.length > 0 ?
          <Table rawData={filteredData} isLoading={loading} sortedBy={[{ id: 'timestamp', desc: true }]} columnArray={columnArray} />
          :
          <h5><TypeWriterText withBlink string="The are no results for the given parameters" /></h5>
      }
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


