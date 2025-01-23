import { useEffect, useState } from 'react'
import styles from './Reports.module.scss'
import Table, { TableColumnArrayProps } from '@/perfect-seo-shared-components/components/Table/Table'
import { getAhrefsDomainRating, getAhrefsUrlRating, getGSCSearchAnalytics, getPostsByDomain, populateBulkGSC } from '@/perfect-seo-shared-components/services/services'
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



  const fetchInfo = async () => {
    setUrlData(null)
    let newData = []
    let gscReqObj: Request.GSCRequest = {
      domain: domain_name,
      start_date: startDate,
      end_date: endDate,
    }
    try {
      let googleToken = sessionStorage.getItem('google-api-token')
      if (googleToken) {
        let token = JSON.parse(googleToken)
        console.log("google token", googleToken)
        await populateBulkGSC(token)
      }
    }
    catch (e) {
      console.log(e)
    }

    const { data } = await getGSCSearchAnalytics(gscReqObj)

    const ahrefsGlobalData = await getAhrefsDomainRating({ ...gscReqObj, domain: domain_name })
    let rating = ahrefsGlobalData.data?.data?.reduce((acc, obj) => acc + obj?.domain_rating || 0, 0)
    if (rating > 0) {
      rating = (rating / ahrefsGlobalData?.data?.data.length).toFixed(1)
    }
    else rating = null
    newData = [{ ...data.data[0], title: `Domain: ${domain_name}`, ahref_rating: rating }]
    const postResults = await getPostsByDomain(domain_name, { ...paginator.paginationObj, page: paginator.currentPage, has_live_post_url: true })
    paginator.setItemCount(postResults.data.total)
    const postData = postResults.data.records
    setTableData([...newData, ...postData])
    setLoading(false)
  }

  const retrievePostsGscInfo = async (data) => {
    let newGSCData = await Promise.all(data.map(async (obj, i) => {
      if (i === 0) return obj
      let reqObj = {
        start_date: startDate,
        end_date: endDate,
        page_url: obj.live_post_url,
        keyword: true
      }
      const { data } = await getGSCSearchAnalytics({ ...reqObj, domain: domain_name })
      let newData = {
        title: obj.title,
        total_clicks: data.data.reduce((prev, curr) => prev + curr?.total_clicks, 0),
        total_impressions: data.data.reduce((prev, curr) => prev + curr?.total_clicks, 0),
        avg_ctr_percent: data.data.reduce((prev, curr) => prev + curr?.total_clicks, 0),
        avg_position: data.data.reduce((prev, curr) => prev + curr?.total_clicks, 0),
        keyword_total: data.data.length,
        keywords: data.data
      }
      const ahrefsData = await getAhrefsUrlRating(reqObj)
      let ahref_rating: any = ahrefsData.data?.data?.reduce((acc, obj) => acc + obj?.url_rating || 0, 0)
      if (ahref_rating > 0) {
        ahref_rating = (ahref_rating / ahrefsData?.data?.data.length).toFixed(1)
      }
      else {
        ahref_rating = null
      }
      if (ahref_rating) {
        return { ...newData, ahref_rating }
      }
      else return newData
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
      setLoading(true)
      fetchInfo();
      interval = setInterval(fetchInfo, 300000)
    }

    return () => {
      clearInterval(interval);
    }
  }, [domain_name, paginator?.currentPage, paginator?.limit, active])

  const renderTotalClicks = (obj, i) => {
    if (i === 0) {
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
    if (i === 0) {
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
    if (i === 0) {
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
    if (i === 0) {
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


  const gscColumnArray: TableColumnArrayProps[] = [
    { id: 'title', Header: 'Title', accessor: 'title', disableSortBy: false },
    { id: 'total_clicks', Header: 'Total Clicks', accessor: renderTotalClicks, disableSortBy: false },
    { id: 'total_impressions', Header: 'Total Impressions', accessor: renderTotalImpression, disableSortBy: false },
    { id: 'avg_ctr_percent', Header: 'Average CTR', accessor: renderAverageCTR, disableSortBy: false, cellClassName: "relative" },
    { id: 'avg_position', Header: 'Average Position', accessor: renderAveragePosition, disableSortBy: false },
    { id: 'ahref_rating', Header: 'AHREFs Rating', accessor: 'ahref_rating', disableSortBy: false },
  ];




  return (
    <div className={styles.wrap}>
      <div className='row g-3 d-flex justify-content-between align-items-end mb-3'>
        <div className='col col-md-auto d-flex justify-content-center align-items-end'>
          <h2 className='text-white mb-0'>
            <TypeWriterText string="SEO Reports" withBlink />
          </h2>
          <div>
          </div>
        </div>
      </div>
      <div className='row d-flex justify-content-between align-items-start g-3'>
        <div className='col-12'>
          <div className='card p-3 bg-secondary'>
            <div className='row d-flex'>
              <h3 className='text-primary'>Google Search Console and AHREF Rating </h3>
            </div>
            {tableData.length >= 0 && <div className='col-12'>
              {tableData.length > 0 ? <Table pinnedRows={['0']} rawData={tableData} isLoading={loading} columnArray={gscColumnArray} />
                : <h5><TypeWriterText withBlink string="The are no results for the given parameters" /></h5>}
            </div>}
            <div className='col-auto d-flex justify-content-center'>
              {paginator.renderComponent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

}

export default Reports
