import { useEffect, useMemo, useState } from 'react'
import styles from './OutlinesList.module.scss'
import { deleteContentOutline, getContentPlanOutlinesByDomain, getContentPlanOutlinesByEmail } from '@/perfect-seo-shared-components/services/services'
import * as Modal from '@/perfect-seo-shared-components/components/Modal/Modal'
import Loader from '../Loader/Loader'
import TypeWriterText from '@/perfect-seo-shared-components/components/TypeWriterText/TypeWriterText'
import PostItem from '../PostItem/PostItem'
import { useSelector } from 'react-redux'
import { RootState } from '@/perfect-seo-shared-components/lib/store'

export interface OutlinesListProps {
  domain_name: string;
  active: boolean;
}
const OutlinesList = ({ domain_name, active }: OutlinesListProps) => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>()
  const [deleteModal, setDeleteModal] = useState(null)
  const [filter, setFilter] = useState('all');
  const { user } = useSelector((state: RootState) => state);

  const getOutlines = () => {
    setLoading(true);
    setData(null)
    if (active) {
      if (domain_name) {
        getContentPlanOutlinesByDomain(domain_name)
          .then(res => {
            setData(res.data)
            setLoading(false)
          })
      }
      else {
        getContentPlanOutlinesByEmail(user?.email)
          .then(res => {
            setData(res.data)
            setLoading(false)
          })
      }
    }
  }

  const deleteHandler = (guid) => {
    deleteContentOutline(guid)
      .then(res => {
        getOutlines()
        setDeleteModal(null)
      })
      .catch(err => {
        console.log(err)
      })
  }


  const filteredData = useMemo(() => {
    let newData
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

    return newData.sort((a, b) => b.created_at.localeCompare(a.created_at))
  }, [data, filter])

  useEffect(() => {
    let interval;
    if (active) {
      getOutlines();
      interval = setInterval(getOutlines, 60000)
    }

    return () => {
      clearInterval(interval);
    }
  }, [domain_name, active])

  const handleFilterChange = (e) => {
    setFilter(e.target.value)
  }

  if (!active) return null

  return (
    <div className={styles.wrap}>
      <div className='row d-flex justify-content-between align-items-end my-3'>
        <div className='col-12 col-md-auto d-flex align-items-end'>
          <h2 className='text-primary mb-0'>
            <TypeWriterText string="Generated Outlines" withBlink />
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
          <div className='row d-flex g-3'>
            {filteredData.map((obj, i) => {
              return <PostItem post={obj} key={obj.content_plan_outline_guid} refresh={getOutlines} />
            })}</div> :
          <h5><TypeWriterText withBlink string="The are no results for the given parameters" /></h5>}
      <Modal.Overlay open={deleteModal} onClose={() => { setDeleteModal(null) }}>
        <Modal.Title title="Delete Plan" />
        <Modal.Description>
          Are you sure you want to delete this post?
          <div className='d-flex justify-content-between mt-5'>
            <button onClick={() => { setDeleteModal(null) }} className="btn btn-warning">Cancel</button>
            <button onClick={(e) => { e.preventDefault(); deleteHandler(deleteModal) }} className="btn btn-primary">Yes</button>
          </div>
        </Modal.Description>
      </Modal.Overlay>
    </div>
  )

}

export default OutlinesList



