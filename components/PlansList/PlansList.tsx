import { useEffect, useMemo, useState } from 'react'
import styles from './PlansList.module.scss'
import Table, { TableColumnArrayProps } from '@/perfect-seo-shared-components/components/Table/Table'
import { deleteContentPlan, getPreviousPlans } from '@/perfect-seo-shared-components/services/services'
import { useRouter } from 'next/navigation'
import * as Modal from '@/perfect-seo-shared-components/components/Modal/Modal'
import moment from 'moment-timezone'
import useViewport from '@/perfect-seo-shared-components/hooks/useViewport'
import Loader from '../../../components/Templates/Loader/Loader'
import TypeWriterText from '@/perfect-seo-shared-components/components/TypeWriterText/TypeWriterText'


const PlansList = ({ domain_name, active }) => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>()
  const { tablet, phone } = useViewport()
  const [deleteModal, setDeleteModal] = useState(null)
  const [filter, setFilter] = useState('all');
  const router = useRouter();

  const fetchPlans = () => {
    getPreviousPlans(domain_name)
      .then(res => {
        setData(res.data.filter(obj => obj.status && obj.target_keyword))
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



  const renderStatusCell = (obj) => {

    const { status } = obj;
    const clickHandler = (e) => {
      e.preventDefault();
      if (status === 'Finished') {
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
      <div className='d-flex justify-content-end'>
        {(status === 'Finished') ?

          <button className="btn btn-primary" onClick={clickHandler} title={`View GUID: ${obj.guid}`}>View Plan</button>
          :
          <span className='text-primary'>
            <TypeWriterText string={status} withBlink />
          </span>
        }
        {/* <button className='btn btn-warning d-flex align-items-center justify-content-center ms-2' onClick={deleteClickHandler} title={`View GUID: ${obj.guid}`}><i className="bi bi-trash pt-1" /></button> */}
      </div>)
  }

  const filteredData = useMemo(() => {
    if (!data) {
      return null
    }
    if (filter === 'all') return data
    else if (filter === 'completed') return data.filter((post) => post.status === 'Finished')
    else if (filter === 'other') return data.filter((post) => post.status !== 'Finished')
  }, [data, filter])

  const handleFilterChange = (e) => {
    setFilter(e.target.value)
  }



  const columnArray: TableColumnArrayProps[] = useMemo(() => {
    if (phone) {
      return [
        { id: 'target_keyword', Header: 'Target Keyword', accessor: 'target_keyword' },
        { id: 'guid', Header: 'GUID', accessor: renderStatusCell, headerClassName: 'text-end pe-3', cellClassName: 'max-325' },
      ];
    }
    else {
      return [
        { id: 'target_keyword', Header: 'Target Keyword', accessor: 'target_keyword', disableSortBy: false },
        { id: 'timestamp', Header: 'Timestamp', accessor: (obj) => moment(obj.timestamp).format("MMMM Do, 'YY hA"), disableSortBy: false },
        { id: 'guid', Header: 'GUID', accessor: renderStatusCell, headerClassName: 'text-end pe-3', cellClassName: 'max-325' },
      ];
    }
  }, [phone, tablet])

  const deleteHandler = (guid) => {
    deleteContentPlan(guid)
      .then(res => {
        setDeleteModal(null)
        fetchPlans()
      })
  }
  return (
    <div className={styles.wrap}>
      <div className='row d-flex justify-content-between align-items-center'>
        <div className='col-12 col-md-auto'>
          <h2 className='text-primary my-3'>
            <TypeWriterText string="Content Plans" withBlink />
          </h2>
        </div>
        <div className='col-auto me-2 my-3'>
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
        :
        <Table rawData={filteredData} isLoading={loading} sortedBy={[{ id: 'timestamp', desc: true }]} columnArray={columnArray} />
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


