import { useEffect, useMemo, useState } from 'react'
import styles from './PostsList.module.scss'
import Table, { TableColumnArrayProps } from '@/perfect-seo-shared-components/components/Table/Table'
import { deleteContentOutline, getPostsByDomain } from '@/perfect-seo-shared-components/services/services'
import * as Modal from '@/perfect-seo-shared-components/components/Modal/Modal'
import moment from 'moment-timezone'
import useViewport from '@/perfect-seo-shared-components/hooks/useViewport'
import Loader from '../../../components/Templates/Loader/Loader'
import Link from 'next/link'
import TypeWriterText from '@/perfect-seo-shared-components/components/TypeWriterText/TypeWriterText'

export interface PostsListProps {
  domain_name: string;
  active: boolean;
  startDate?: string;
  endDate?: string;
}
const PostsList = ({ domain_name, active, startDate, endDate }: PostsListProps) => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>()
  const { desktop } = useViewport()
  const [deleteModal, setDeleteModal] = useState(null)
  const [filter, setFilter] = useState('all');



  const actionField = (post) => {
    const docClickHandler = (e) => {
      e.preventDefault();
      window.open(post.google_doc_link, '_blank')
    }
    const htmlClickHandler = (e) => {
      e.preventDefault();
      window.open(post.html_link, '_blank')
    }
    const deleteClickHandler = (e) => {
      e.preventDefault()
      setDeleteModal(post.content_plan_outline_guid)
    }
    return (
      <div className='row g-0 d-flex align-items-center justify-content-end px-0 w-100 mx-0'>
        {(post?.google_doc_link && post?.html_link) &&
          <>
            <div className="col-auto">
              <a
                onClick={htmlClickHandler}

                className="btn btn-primary standard-button"

              >
                <i className="bi bi-filetype-html" /> HTML
              </a>
            </div>
            <div className="col-auto pe-0">
              <a
                onClick={docClickHandler}

                className="btn btn-primary standard-button ms-1"

              >
                <i className="bi bi-filetype-doc me-2" /> Google Docs
              </a>
            </div>
          </>}
        <>
          <div className="col-auto text-end px-0">
            <Link
              href={`/dashboard/${post.content_plan_guid}`}
              className="btn btn-primary standard-button ms-1"
            >
              View Content Plan
            </Link>
          </div>
          <div className='col-auto'>
            <button className='btn btn-warning d-flex align-items-center justify-content-center ms-1 standard-button' onClick={deleteClickHandler} title={`View GUID: ${post.guid}`}><i className="bi bi-trash pt-1" /></button>
          </div>
          {post.status !== "Complete" && <div className='col-12 text-end text-primary px-0'>
            <TypeWriterText string={post.status} withBlink />
          </div>}
        </>
      </div>
    )
  }

  const getPosts = () => {
    if (domain_name && active) {
      getPostsByDomain(domain_name)
        .then(res => {
          setData(res.data)
          setLoading(false)
        })
    }
  }

  const deleteHandler = (guid) => {
    deleteContentOutline(guid)
      .then(res => {
        console.log(res)
        getPosts()
        setDeleteModal(null)
      })
      .catch(err => {
        console.log(err)
      })
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
    if (startDate) {
      newData = newData.filter(obj => {
        let startDateInfo = startDate.split('-')
        let endDateInfo = endDate.split('-')
        let newStartDate = new Date(moment().set({ year: parseInt(startDateInfo[0]), month: parseInt(startDateInfo[1]), date: parseInt(startDateInfo[2]) }).toISOString())
        let newEndDate = new Date(moment().set({ year: parseInt(endDateInfo[0]), month: parseInt(endDateInfo[1]), date: parseInt(endDateInfo[2]) }).toISOString())
        console.log(obj)
        return moment(new Date(obj.timestamp)).isBetween(moment(newStartDate).startOf('day'), moment(newEndDate).endOf('day'))
      })
    }
    return newData
  }, [data, filter, startDate, endDate])

  useEffect(() => {
    let interval;
    if (domain_name && active) {
      getPosts();
      setInterval(getPosts, 60000)
    }

    return () => {
      clearInterval(interval);
    }
  }, [domain_name, active])


  const columnArray: TableColumnArrayProps[] = useMemo(() => {
    if (desktop) {

      return [
        { id: 'title', Header: 'Post Titles', accessor: 'title', disableSortBy: false },
        { id: 'created_at', Header: 'Created', accessor: (obj) => moment(obj.created_at).format("MMMM Do, 'YY hA"), disableSortBy: false },
        { id: 'guid', Header: 'GUID', accessor: actionField, headerClassName: 'text-end pe-3', cellClassName: 'max-325' },
      ];
    }
    else {
      return [
        { id: 'title', Header: 'Post Titles', accessor: 'title' },
        { id: 'guid', Header: 'GUID', accessor: actionField, headerClassName: 'text-end pe-3', cellClassName: 'max-325' },
      ];
    }
  }, [desktop])



  const handleFilterChange = (e) => {
    setFilter(e.target.value)
  }

  if (!active) return null

  return (
    <div className={styles.wrap}>
      <div className='row d-flex justify-content-between align-items-center'>
        <div className='col-12 col-md-auto'>
          <h2 className='text-primary my-3'>
            <TypeWriterText string="Generated Posts" withBlink />
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
        : filteredData?.length > 0 ?
          <Table rawData={filteredData} isLoading={loading} sortedBy={[{ id: 'created_at', desc: true }]} columnArray={columnArray} />
          :
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

export default PostsList



