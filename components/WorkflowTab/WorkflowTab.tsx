'use client'
import { useEffect, useMemo, useState } from 'react'
import { deletePost, getPostsByDomain, getPostsByEmail, updateLiveUrl } from '@/perfect-seo-shared-components/services/services'
import usePaginator from '@/perfect-seo-shared-components/hooks/usePaginator'
import { useSelector } from 'react-redux'
import { selectEmail } from '@/perfect-seo-shared-components/lib/features/User'

import { PostProps, WorkflowPanels } from '@/perfect-seo-shared-components/data/types'
import WorkflowRow from './WorkflowRow'
import * as Modal from '@/perfect-seo-shared-components/components/Modal/Modal'
import Form from "../Form/Form"
import TextInput from "../Form/TextInput"
import useForm from "@/perfect-seo-shared-components/hooks/useForm"
import { urlValidator } from '@/perfect-seo-shared-components/utils/validators'


export interface WorkflowTabProps {
  currentDomain: string;
  active: boolean;
}
const WorkflowTab = ({ currentDomain, active }: WorkflowTabProps) => {
  const email = useSelector(selectEmail)
  const paginator = usePaginator()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>()
  const [selected, setSelected] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [livePost, setLivePost] = useState<PostProps>(null)
  const form = useForm()

  useEffect(() => {
    if (livePost) {
      form.setState(livePost)
    }
    else {
      form.setState({})
    }
  }, [livePost])

  const saveLiveUrl = () => {
    let url = form.getState.live_post_url
    if (url) {
      if (form.validate({ requiredFields: ['live_post_url'], validatorFields: ['live_url'] })) {
        updateLiveUrl(livePost?.task_id, url || '')
          .then(res => {
            let newData = data.map((post) => {
              if (post?.task_id === livePost.task_id) {
                return { ...post, live_post_url: url }
              }
              else {
                return post
              }
            })
            setData(newData)
          })
      }

    }
    else {
      updateLiveUrl(livePost?.task_id, '')
        .then(res => {
          let newData = data.map((post) => {
            if (post?.task_id === livePost.task_id) {
              return { ...post, live_post_url: '' }
            }
            else {
              return post
            }
          })
          setData(newData)
        })
    }

  }


  const getPosts = () => {
    setLoading(true)
    setData(null)
    if (active) {
      if (currentDomain) {
        getPostsByDomain(currentDomain)
          .then(res => {
            if (res.data) {
              paginator.setItemCount(res.count)
              setData(res.data)
              setLoading(false)
            }
            else {
              setLoading(false);
              setData(null)
              paginator.setItemCount(0)
            }
          })
      }
      else {
        getPostsByEmail(email)
          .then(res => {
            if (res.data) {
              paginator.setItemCount(res.count)
              setData(res.data)
              setLoading(false)
            }
            else {
              setLoading(false);
              setData(null)
              paginator.setItemCount(0)
            }
          })
      }
    }
  }

  const deleteHandler = (guid) => {
    deletePost(guid)
      .then(res => {
        getPosts()
        setDeleteModal(null)
      })
      .catch(err => {
        console.log(err)
      })
  }


  useEffect(() => {
    let interval;
    if (active) {
      getPosts();
      // interval = setInterval(getPosts, 60000)
    }

    return () => {
      clearInterval(interval);
    }
  }, [currentDomain, active, paginator.currentPage, paginator.limit])

  const reorderRow = (draggedPost: PostProps, type: WorkflowPanels) => {
    console.log(draggedPost, type)
    if (type === WorkflowPanels.LIVE) {
      setLivePost(draggedPost)
    }
  }


  const sortedPosts = useMemo(() => {
    let sortedData = {
      generated: [],
      live: [],
      indexed: []
    }
    if (data) {
      data.forEach((post) => {
        if (post.index_status === 'indexed') {
          sortedData.indexed.push(post)
        }
        else if (post.live_post_url) {
          sortedData.live.push(post)
        }
        else {
          sortedData.generated.push(post)
        }

      })
    }
    return sortedData

  }, [data])

  if (!active) return null
  else
    return (
      <>
        <div className="row d-flex g-3">
          <div className="col-4">
            <h2 className='text-primary mb-3'>
              Generated Posts
            </h2>
            <WorkflowRow posts={sortedPosts.generated} reorderRow={reorderRow} selected={selected} setSelected={setSelected} type={WorkflowPanels.GENERATED} />
          </div>
          <div className="col-4">
            <h2 className='text-primary mb-3'>
              Live Posts
            </h2>
            <WorkflowRow posts={sortedPosts.live} reorderRow={reorderRow} selected={selected} setSelected={setSelected} type={WorkflowPanels.LIVE} />
          </div>
          <div className="col-4">
            <h2 className='text-primary mb-3'>
              Indexed Posts
            </h2>
            <WorkflowRow posts={sortedPosts.indexed} reorderRow={reorderRow} selected={selected} setSelected={setSelected} type={WorkflowPanels.INDEXED} />
          </div>

        </div>
        <Modal.Overlay closeIcon open={!!livePost} onClose={() => setLivePost(null)} className="modal-small">
          <Modal.Title title="Add Live URL" />
          <div className="card bg-secondary p-3 w-100">
            <Form controller={form}>
              <TextInput fieldName="live_url" label="Live URL" validator={urlValidator} required
                button={<button className="btn btn-primary" onClick={saveLiveUrl} type="submit" ><i className="bi bi-floppy-fill" /></button>} />
            </Form>
          </div>
        </Modal.Overlay>
      </>
    )

}

export default WorkflowTab



