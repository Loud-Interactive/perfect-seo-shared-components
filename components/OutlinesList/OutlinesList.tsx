'use client'
import { useEffect, useMemo, useState } from 'react'
import styles from './OutlinesList.module.scss'
import { deleteContentOutline, getContentPlanOutlinesByDomain, getContentPlanOutlinesByEmail } from '@/perfect-seo-shared-components/services/services'
import * as Modal from '@/perfect-seo-shared-components/components/Modal/Modal'
import Loader from '../Loader/Loader'
import TypeWriterText from '@/perfect-seo-shared-components/components/TypeWriterText/TypeWriterText'
import PostItem from '../PostItem/PostItem'
import { useSelector } from 'react-redux'
import { RootState } from '@/perfect-seo-shared-components/lib/store'
import OutlineItem from '../OutlineItem/OutlineItem'
import usePaginator from '@/perfect-seo-shared-components/hooks/usePaginator'
import { selectEmail, selectIsAdmin } from '@/perfect-seo-shared-components/lib/features/User'

export interface OutlinesListProps {
  domain_name: string;
  active: boolean;
}
const OutlinesList = ({ domain_name, active }: OutlinesListProps) => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>()
  const [deleteModal, setDeleteModal] = useState(null)
  const email = useSelector(selectEmail)
  const [modalOpen, setModalOpen] = useState(false)
  const [hasPosts, setHasPosts] = useState(false)

  const paginator = usePaginator()

  const getOutlines = () => {

    if (active) {
      paginator.setItemCount(0)
      setLoading(true);
      setData(null)
      if (domain_name) {
        getContentPlanOutlinesByDomain(domain_name, paginator.paginationObj)
          .then(res => {
            if (res.data) {
              paginator.setItemCount(res.count)
              setData(res.data)
              setLoading(false)
            }
            else {
              setLoading(false);
              setData(null)
            }
          })
      }
      else {
        getContentPlanOutlinesByEmail(email, paginator.paginationObj)
          .then(res => {
            paginator.setItemCount(res.data.total)
            setData(res.data.items)
            setLoading(false)
          })
          .catch(err => {
            setLoading(false);
            setData(null)
          }
          )
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



  useEffect(() => {
    let interval;
    if (active && !modalOpen) {
      getOutlines();
      interval = setInterval(getOutlines, 300000)
    }

    return () => {
      clearInterval(interval);
    }
  }, [active, paginator.currentPage, paginator.limit, modalOpen, domain_name])


  if (!active) return null

  return (
    <div className={styles.wrap}>
      <div className='row d-flex justify-content-between align-items-end mb-3'>
        <div className='col-12 col-md-auto d-flex align-items-end'>
          <h2 className='text-primary mb-0'>
            <TypeWriterText string="Generated Outlines" withBlink />
          </h2>
          {paginator?.itemCount > 0 && <p className='badge rounded-pill text-bg-primary ms-3 d-flex align-items-center mb-1'>{paginator?.itemCount}</p>}
        </div>
      </div>
      {loading ? <Loader />
        : (data?.length > 0 || paginator.itemCount > 0) ?
          <div className='row d-flex justify-content-center g-3'>
            {data.map((obj, i) => {
              return <OutlineItem setModalOpen={setModalOpen} domain_name={domain_name} outline={obj} key={obj.content_plan_outline_guid || i} refresh={getOutlines} />
            })}
            <div className='col-auto d-flex justify-content-center'>
              {paginator.renderComponent()}
            </div>
          </div> :
          <h5><TypeWriterText withBlink string="The are no results for the given parameters" /></h5>}

      <Modal.Overlay open={deleteModal} onClose={() => { setDeleteModal(null) }}>
        <Modal.Title title="Delete Plan" />
        <Modal.Description>
          Are you sure you want to delete this outline?
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



