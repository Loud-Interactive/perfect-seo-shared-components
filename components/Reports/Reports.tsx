import { useEffect, useState } from 'react'
import styles from './Reports.module.scss'
import Table, { TableColumnArrayProps } from '@/perfect-seo-shared-components/components/Table/Table'
import { getAhrefsDomainRating, getAhrefsUrlRating, getGSCLiveURLReport, getGSCSearchAnalytics, getPostsByDomain, populateBulkGSC } from '@/perfect-seo-shared-components/services/services'
import moment from 'moment-timezone'
import TypeWriterText from '@/perfect-seo-shared-components/components/TypeWriterText/TypeWriterText'
import usePaginator from '@/perfect-seo-shared-components/hooks/usePaginator'
import LoadSpinner from '../LoadSpinner/LoadSpinner'
import * as Request from "@/perfect-seo-shared-components/data/requestTypes";
export interface PlanListProps {
  domain_name: string;
  url?: string;
  active: boolean;
}
const Reports = ({ domain_name, active }: PlanListProps) => {
  const [loading, setLoading] = useState(false)

  const [startDate, setStartDate] = useState(moment().subtract(28, "days").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"))
  const paginator = usePaginator()

  const [tableData, setTableData] = useState<any[]>([])
  const [urlData, setUrlData] = useState<any[]>(null)

  useEffect(() => {
    let googleToken;
    try {
      googleToken = sessionStorage.getItem('google-api-token')
    }
    catch (e) {
      console.log(e)
    }
    if (googleToken) {
      let token = JSON.parse(googleToken)
      populateBulkGSC(token)
    }


  }, [])



  const fetchInfo = async () => {
    setLoading(true)
    setUrlData(null)
    let gscReqObj: Request.GSCRequest = {
      domain: domain_name,
      start_date: startDate,
      end_date: endDate,
    }

    // const ahrefsGlobalData = await getAhrefsDomainRating({ ...gscReqObj, domain: domain_name })
    // let rating = ahrefsGlobalData.data?.data?.reduce((acc, obj) => acc + obj?.domain_rating || 0, 0)
    // if (rating > 0) {
    //   rating = (rating / ahrefsGlobalData?.data?.data.length).toFixed(1)
    // }
    // else rating = null
    const { data: summaryData } = await getGSCLiveURLReport({
      domain: domain_name,
      start_date: startDate,
      end_date: endDate,
      limit: 1,
    })
    let newData = await Object.entries(summaryData).map(([key, value], i) => {
      let newObj: any = { ...value as object, title: key.split("_").map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") }
      // if (i === 0) {
      //   return { ...newObj, ahref_rating: rating }
      // }
      // else if(i === 1){
      if (i <= 1) {
        return newObj
      }
      else {
        return { ...newObj[0], title: newObj.title }
      }

    })
    const postResults = await getPostsByDomain(domain_name, { ...paginator.paginationObj, page: paginator.currentPage, has_live_post_url: true })
    paginator.setItemCount(postResults.data.total)
    const postData = postResults.data.records
    setTableData([...newData, ...postData])
    return setLoading(false)
  }

  const retrievePostsGscInfo = async (data) => {
    let newGSCData = await Promise.all(data.map(async (obj, i) => {
      if (i === 0) return obj
      let reqObj = {
        start_date: startDate,
        end_date: endDate,
        page_url: obj.live_post_url,
        keyword: false
      }
      const { data } = await getGSCSearchAnalytics({ ...reqObj, domain: domain_name })
      let newData = {
        ...obj,
        title: obj.title,
        total_clicks: data.data.reduce((prev, curr) => prev + curr?.total_clicks, 0),
        total_impressions: data.data.reduce((prev, curr) => prev + curr?.total_impressions, 0),
        avg_ctr_percent: data.data.reduce((prev, curr) => prev + curr?.avg_ctr_percent, 0),
        avg_position: data.data.reduce((prev, curr) => prev + curr?.avg_position, 0),
        keyword_total: data.data.length,
        keywords: data.data
      }
      // const ahrefsData = await getAhrefsUrlRating(reqObj)
      // let ahref_rating: any = ahrefsData.data?.data?.reduce((acc, obj) => acc + obj?.url_rating || 0, 0)
      // if (ahref_rating > 0) {
      //   ahref_rating = (ahref_rating / ahrefsData?.data?.data.length).toFixed(1)
      // }
      // else {
      //   ahref_rating = null
      // }
      // if (ahref_rating) {
      //   return { ...newData, ahref_rating }
      // }
      // else 
      return newData
    }))
    setUrlData(newGSCData)
  }

  useEffect(() => {
    if (tableData?.length > 1) {
      retrievePostsGscInfo(tableData)
    }
  }, [tableData])


  useEffect(() => {
    let interval;
    if (active) {
      fetchInfo();
      interval = setInterval(fetchInfo, 300000)
    }

    return () => {
      clearInterval(interval);
    }
  }, [domain_name, paginator?.currentPage, paginator?.limit, active])

  const renderTotalClicks = (obj, i) => {
    if (i < 5) {
      if (obj?.total_clicks === 0) return null
      return obj?.total_clicks?.toLocaleString()
    }
    else if (urlData?.length > 0) {
      let newPost = urlData.find(post => post.title === obj.title)
      let totalClicks = newPost?.total_clicks > 0 ? newPost?.total_clicks?.toLocaleString() : null

      return totalClicks

    }
    else {
      return null
    }
  }
  const renderTotalImpression = (obj, i) => {
    if (i <= 5) {
      if (obj?.total_impressions === 0) return null
      return obj?.total_impressions?.toLocaleString()
    }
    else if (urlData?.length > 0) {
      let newPost = urlData.find(post => post.title === obj.title)
      let totalImpressions = newPost?.total_impressions > 0 ? newPost?.total_impressions?.toLocaleString() : null

      return totalImpressions

    }
    else {
      return null
    }
  }
  const renderAverageCTR = (obj, i) => {
    if (i <= 5) {
      if (obj?.avg_ctr_percent === 0 || !obj?.avg_ctr_percent) return null
      return `${obj?.avg_ctr_percent?.toFixed(1)}%`
    }
    else if (urlData?.length > 0) {
      let newPost = urlData.find(post => post.title === obj.title)
      let avgCTR = newPost?.avg_ctr_percent > 0 ? `${newPost?.avg_ctr_percent.toFixed(1)}%` : null

      return avgCTR

    }
    else {
      return <LoadSpinner withBackground={false} />
    }
  }
  const renderAveragePosition = (obj, i) => {
    if (i <= 5) {
      if (obj?.avg_position === 0) return null
      return obj?.avg_position?.toFixed(3)
    }
    else if (urlData?.length > 0) {
      let newPost = urlData.find(post => post.title === obj.title)
      let totalImpressions = newPost?.avg_position > 0 ? newPost?.avg_position?.toFixed(3) : null

      return totalImpressions

    }
    else {
      return null
    }
  }

  const renderTitle = (obj) => (
    <div className="d-flex flex-column">
      <p className='mb-0'>{obj.title}</p>
      {obj.live_post_url && <a href={obj.live_post_url} target="_blank" rel="noreferrer" className='text-primary text-wrap title-max mb-0 pb-0'>...{obj.live_post_url.replace("https://", "").replace("www.", "").replace(obj.client_domain, "")}</a>
      }
    </div>
  )

  const gscColumnArray: TableColumnArrayProps[] = [
    { id: 'title', Header: 'Title', accessor: renderTitle, disableSortBy: false, cellClassName: 'title-max', headerClassName: 'bg-transparent text-white' },
    { id: 'total_clicks', Header: 'Total Clicks', accessor: renderTotalClicks, disableSortBy: false, headerClassName: 'bg-transparent text-white' },
    { id: 'total_impressions', Header: 'Total Impressions', accessor: renderTotalImpression, disableSortBy: false, headerClassName: 'bg-transparent text-white' },
    { id: 'avg_ctr_percent', Header: 'Average CTR', accessor: renderAverageCTR, disableSortBy: false, cellClassName: "relative", headerClassName: 'bg-transparent text-white' },
    { id: 'avg_position', Header: 'Average Position', accessor: renderAveragePosition, disableSortBy: false, headerClassName: 'bg-transparent text-white' },
    // { id: 'ahref_rating', Header: 'AHREFs Rating', accessor: 'ahref_rating', disableSortBy: false, headerClassName: 'bg-transparent text-white' },
  ];




  return (
    <div className={styles.wrap}>
      <div className='row g-3 d-flex justify-content-between align-items-end mb-3'>
        <div className='col-12 d-flex justify-content-between align-items-end'>
          <h2 className='text-white'>
            <TypeWriterText string="Google Search Console and AHREF Ratings" withBlink />
          </h2>
          <p className='mb-0'>
            <span className="text-primary me-2">Dates</span>
            {moment(startDate).format("M/D/YY")} to {moment(endDate).format("M/D/YY")}</p>
        </div>
      </div>
      <div className='row d-flex justify-content-between align-items-start g-3'>
        <div className='col-12'>
          {tableData.length >= 0 && <div className='col-12 relative'>
            {tableData.length > 0 ? <Table pinnedRows={['0', '1', '2', '3', '4', '5']} rawData={tableData} columnArray={gscColumnArray} />
              : loading ? <LoadSpinner /> : <h5><TypeWriterText withBlink string="The are no results for the given parameters" /></h5>}
          </div>}
          <div className='col-auto d-flex justify-content-center'>
            {paginator.renderComponent()}
          </div>
        </div>
      </div>
    </div>
  )

}

export default Reports
