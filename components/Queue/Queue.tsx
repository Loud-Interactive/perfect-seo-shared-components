'use client'

import TypeWriterText from "@/perfect-seo-shared-components/components/TypeWriterText/TypeWriterText";
import { QueueItemProps } from "@/perfect-seo-shared-components/data/types";
import { addQueueItem, removeQueueItem, selectEmail, selectLoader, selectQueue, selectShowQueue, setLoader, setQueue, setShowQueue, updateDomainInfo, updateQueueItem } from "@/perfect-seo-shared-components/lib/features/User";
import { createClient } from "@/perfect-seo-shared-components/utils/supabase/client";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import QueueCard from "./QueueCard";
import LoadSpinner from "@/perfect-seo-shared-components/components/LoadSpinner/LoadSpinner";
import { getBatchStatus, getSpecificPairs } from "@/perfect-seo-shared-components/services/services";
import classNames from "classnames";

const Queue = ({ sidebar = false }) => {
  const email = useSelector(selectEmail)
  const data = useSelector(selectQueue)
  const dispatch = useDispatch()
  const showQueue = useSelector(selectShowQueue)
  const loaderKey = 'queue'
  const loader = useSelector(selectLoader)
  const [batchStatus, setBatchStatus] = useState<{ guid: string, status: string }[]>(null)
  const supabase = createClient()



  const activeBulkIds = useMemo(() => {
    let guids: string[] = []
    setBatchStatus(null)

    data?.forEach((item) => {
      if (item.type === 'post' && item.isComplete === false) {
        guids.push(item.guid)
      }
    })

    return guids

  }, [data])

  useEffect(() => {
    const getBatchStatuses = () => {
      getBatchStatus(activeBulkIds)
        .then(res => {
          setBatchStatus(res.data.map((item) => { return { guid: item.content_plan_outline_guid, status: item.status } }))
        })
    }
    let interval;
    if (activeBulkIds?.length > 0) {
      interval = setInterval(getBatchStatuses, 30000)
    }
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [activeBulkIds])


  const fetchInfo = () => {

    dispatch(setLoader({ loading: true, key: loaderKey }))

    supabase
      .from('user_queues')
      .select('*')
      .eq('email', email)
      .then(res => {
        if (res.data?.length > 0) {
          dispatch(setQueue(res.data))
        }
        else {
          dispatch(setQueue(res.data))
        }
        dispatch(setLoader({ loading: false, key: loaderKey }))
      })
  }


  const loading = useMemo(() => {
    let loading = loader.find((item) => item.key === loaderKey)?.loading
    return loading
  }, [loader])




  const listenerHandler = (payload) => {
    switch (payload.eventType) {
      case 'INSERT':
        dispatch(addQueueItem(payload.new as QueueItemProps))
        break;
      case 'DELETE':
        return dispatch(removeQueueItem(payload.old as QueueItemProps))
      case 'UPDATE':
        dispatch(updateQueueItem(payload.new as QueueItemProps))
        break;
      default:
        break;
    }
  }

  useEffect(() => {
    let userQueuesChannel;
    if (email) {
      fetchInfo()
      userQueuesChannel = supabase.channel('queues-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'user_queues', filter: 'email=eq.' + email },
          (payload) => {
            console.log(payload)
            listenerHandler(payload)
          }
        )
        .subscribe()
    }

  }, [email])


  const removeItem = (obj) => {
    supabase
      .from('user_queues')
      .delete()
      .eq('id', obj.id)
      .select("*")
      .then(res => {
      })
  }

  const [show, setShow] = useState({ contentPlans: true, outlines: true, posts: true })

  const columnClasses = classNames(
    {
      'col-12': sidebar,
      'col-12 col-lg-4': !sidebar,
    }
  )
  const contentPlans = useMemo(() => {
    return data?.filter((item) => item.type === 'contentPlan')
  }, [data])

  const outlines = useMemo(() => {
    return data?.filter((item) => item.type === 'outline')
  }, [data])

  const posts = useMemo(() => {
    return data?.filter((item) => item.type === 'post')
  }, [data])

  const domains = useMemo(() => {
    let domains = []
    if (data) {
      data.forEach((item) => {
        if (item.domain) {
          if (!domains.includes(item.domain)) {
            domains.push(item.domain)
          }
        }
      })
    }
    return domains
  }, [data])


  useEffect(() => {
    if (domains?.length > 0) {
      domains.forEach((domain) => {
        getSpecificPairs(domain, ['domain', 'brand_name', 'guid'])
          .then(res => {
            dispatch(updateDomainInfo(res.data))
          })
      })

    }
  }, [domains])



  const metrics = useMemo(() => {
    let newMetrics = { posts: { completed: 0, total: 0, percentage: 0 }, outlines: { completed: 0, total: 0, percentage: 0 }, contentPlans: { completed: 0, total: 0, percentage: 0 } }
    if (data) {
      data.forEach((item) => {
        if (item.type === 'post') {
          newMetrics.posts.total++
          if (item.isComplete === true) {
            newMetrics.posts.completed++
          }
        }
        else if (item.type === 'outline') {
          newMetrics.outlines.total++
          if (item.isComplete === true) {
            newMetrics.outlines.completed++
          }
        }
        else if (item.type === 'contentPlan') {
          newMetrics.contentPlans.total++
          if (item.isComplete === true) {
            newMetrics.contentPlans.completed++
          }
        }
      })
    }
    if (newMetrics.posts?.total >= 0) {
      if (newMetrics.posts?.total === 0) {
        newMetrics.posts.percentage = 0
      }
      else {
        newMetrics.posts.percentage = Math.round((newMetrics.posts.completed / newMetrics.posts.total) * 100)
      }
    }
    if (newMetrics.outlines?.total >= 0) {
      if (newMetrics.outlines?.total === 0) {
        newMetrics.outlines.percentage = 0
      }
      else {
        newMetrics.outlines.percentage = Math.round((newMetrics.outlines.completed / newMetrics.outlines.total) * 100)
      }
    }
    if (newMetrics.contentPlans?.total >= 0) {
      if (newMetrics.contentPlans?.total === 0) {
        newMetrics.contentPlans.percentage = 0
      }
      else {
        newMetrics.contentPlans.percentage = Math.round((newMetrics?.contentPlans?.completed / newMetrics.contentPlans.total) * 100)
      }
    }
    return newMetrics
  }, [data])

  useEffect(() => {
    if (sidebar !== true) {
      dispatch(setShowQueue(false))
    }
  }, [sidebar])

  const renderHeader = (type: string) => {
    const { completed, total, percentage } = metrics[type]

    const renderHeader = () => {
      switch (type) {
        case 'contentPlans':
          return 'Content Plans'
        case 'outlines':
          return 'Outlines'
        case 'posts':
          return 'Posts'
        default:
          return 'Queue'
      }
    }

    const toggleShowHandler = () => {
      switch (type) {
        case 'contentPlans':
          setShow({ ...show, contentPlans: !show.contentPlans })
          break;
        case 'outlines':
          setShow({ ...show, outlines: !show.outlines })
          break;
        case 'posts':
          setShow({ ...show, posts: !show.posts })
          break;
        default:
          break;
      }
    }
    return (
      <div className="bg-dark px-3 py-2 mx-0 card">
        <div className="row d-flex g-2 align-items-center justify-content-around">
          <div className="col">
            <h3 className="text-start mb-0">{renderHeader()}</h3>
          </div>
          <div className="col-auto">
            {(sidebar && (metrics[type].total > 0)) ? <button className="btn btn-primary p-0 btn-round" onClick={toggleShowHandler}>
              {show[type] ? <i className="bg bi-caret-up-fill" /> : <i className="bg bi-caret-down-fill" />}
            </button> : !sidebar ?
              <span className="input-group">
                <span className="badge bg-secondary">{total || 0}</span>
                <span className="badge bg-success">{completed || 0}</span>
                <span className="badge bg-secondary">{percentage || 0}%</span>
              </span>
              : null
            }
          </div>
        </div>
      </div>
    )
  }

  const wrapClasses = classNames(
    {
      'container-fluid': !sidebar,
      'queue-sidebar bg-secondary': sidebar
    }
  )

  return (
    <div className={wrapClasses}>
      {loading ? <LoadSpinner /> :
        <div className="row g-0 d-flex align-items-flex justify-content-center">
          {sidebar ?
            <div className="col-auto">
              <div className="queue-sidebar-button">
                <button className="btn btn-dark" onClick={(e) => {
                  e.preventDefault();
                  dispatch(setShowQueue(!showQueue))
                }
                }>
                  {showQueue ? <i className="bg bi-caret-right-fill" /> : <i className="bg bi-caret-left-fill" />}
                </button>
              </div>
            </div>
            :
            <div className="col-12">
              <h1 className="text-center"><TypeWriterText string="Queue" withBlink /></h1>
            </div>
          }
          {(sidebar && !showQueue) ? null : <div className="col">
            <div className="row g-1 d-flex align-items-flex justify-content-center">
              <div className={columnClasses}>
                {renderHeader('contentPlans')}
                {(contentPlans?.length > 0 && show?.contentPlans) &&
                  <div className="card bg-dark p-2">
                    <div className="row g-2 d-flex align-items-stretch justify-content-center">

                      {contentPlans.map((plan, i) => {
                        return (
                          <QueueCard queue={plan} i={i} removeItem={removeItem} key={i} />
                        )
                      })}</div>
                  </div>}
              </div>
              <div className={columnClasses}>
                {renderHeader('outlines')}
                {(outlines?.length > 0 && show?.outlines) && <div className="card bg-dark p-2">
                  <div className="row g-2 d-flex align-items-stretch justify-content-center">

                    {outlines.map((outline, i) => {
                      return (
                        <QueueCard queue={outline} i={i} removeItem={removeItem} key={i} />
                      )
                    })}</div>
                </div>}
              </div>
              <div className={columnClasses}>
                {renderHeader("posts")}
                {(posts?.length > 0 && show?.posts) &&
                  <div className="card bg-dark p-2">
                    <div className="row g-2 d-flex align-items-stretch justify-content-center">
                      {posts.map((post, i) => {
                        let bulkStatus = batchStatus?.find((item) => item.guid === post.guid)?.status || null
                        return (
                          <QueueCard bulkStatus={bulkStatus} queue={post} i={i} removeItem={removeItem} key={i} />
                        )
                      })}</div>
                  </div>}
              </div>
            </div>
          </div>}
        </div>}
    </div >
  )
}

export default Queue;