import { useEffect, useMemo, useState } from 'react'
import styles from './Reports.module.scss'
import Table, { TableColumnArrayProps } from '@/perfect-seo-shared-components/components/Table/Table'
import { deleteContentPlan, getAhrefsDomainRating, getAhrefsUrlRating, getGSCSearchAnalytics, getPostsByDomain } from '@/perfect-seo-shared-components/services/services'
import moment from 'moment-timezone'
import TypeWriterText from '@/perfect-seo-shared-components/components/TypeWriterText/TypeWriterText'
import { useDispatch, useSelector } from 'react-redux'
import usePaginator from '@/perfect-seo-shared-components/hooks/usePaginator'
import { selectEmail } from '@/perfect-seo-shared-components/lib/features/User'
import LoadSpinner from '../LoadSpinner/LoadSpinner'
import ContentPlanForm from '@/perfect-seo-shared-components/components/ContentPlanForm/ContentPlanForm'
import { createClient } from '@/perfect-seo-shared-components/utils/supabase/client'
import { QueueItemProps } from '@/perfect-seo-shared-components/data/types'
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

  const fetchInfo = async () => {
    let newData = []
    let gscReqObj: Request.GSCRequest = {
      domain: domain_name,
      start_date: startDate,
      end_date: endDate,
    }
    const { data } = await getGSCSearchAnalytics(gscReqObj)

    const ahrefsData = await getAhrefsDomainRating({ ...gscReqObj, domain: domain_name })
    let rating = ahrefsData.data?.data?.reduce((acc, obj) => acc + obj?.domain_rating, 0) / ahrefsData?.data?.data.length
    newData = [{ ...data.data[0], title: domain_name, ahref_rating: rating }]
    const postResults = await getPostsByDomain(domain_name, { ...paginator.paginationObj, page: paginator.currentPage, has_live_post_url: true })
    paginator.setItemCount(postResults.data.total)
    let postData = await Promise.all(postResults.data.records.map(async (obj) => {
      let reqObj = {
        start_date: startDate,
        end_date: endDate,
        page_url: obj.live_post_url
      }
      const { data } = await getGSCSearchAnalytics({ ...reqObj, domain: domain_name })
      const ahrefsData = await getAhrefsUrlRating(reqObj)
      let ahref_rating: any = ahrefsData.data?.data?.reduce((acc, obj) => acc + obj?.url_rating, 0) / ahrefsData?.data?.data.length
      if (ahref_rating > 0) {
        ahref_rating = ahref_rating.toFixed(1)
      }
      if (data.data?.length > 0) {
        return { ...obj, ...data.data[0], ahref_rating }
      }
      else if (ahref_rating) {
        return { ...obj, ahref_rating }
      }
      else return obj


    }))
    setTableData([...newData, ...postData])
    setLoading(false)
  }



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


  const gscColumnArray: TableColumnArrayProps[] = [
    { id: 'title', Header: 'Title', accessor: 'title' },
    { id: 'total_clicks', Header: 'Total Clicks', accessor: (obj) => obj?.total_clicks?.toLocaleString() },
    { id: 'total_impressions', Header: 'Total Impressions', accessor: (obj) => obj?.total_impressions?.toLocaleString() },
    { id: 'avg_ctr', Header: 'Average CTR', accessor: (obj) => obj?.avg_ctr ? `${(obj?.avg_ctr * 100).toFixed(1)}%` : null },
    { id: 'avg_position', Header: 'Average Position', accessor: (obj) => obj?.avg_position?.toFixed(3) },
    { id: 'ahref_rating', Header: 'AHREFs Rating', accessor: 'ahref_rating' },
  ];




  return (
    <div className={styles.wrap}>
      <div className='row g-3 d-flex justify-content-between align-items-end mb-3'>
        <div className='col col-md-auto d-flex justify-content-center align-items-end'>
          <h2 className='text-white mb-0'>
            <TypeWriterText string="Domain Reporting" withBlink />
          </h2>
          <div>
          </div>
        </div>
      </div>
      {loading && <LoadSpinner />}
      <div className='row d-flex justify-content-between align-items-start g-3'>
        <div className='col-12'>
          <div className='card p-3 bg-secondary'>
            <div className='row d-flex'>
              <h3 className='text-primary'>Google Search Console </h3>
            </div>
            {tableData.length >= 0 && <div className='col-12'>
              {tableData.length > 0 ? <Table rawData={tableData} isLoading={loading} columnArray={gscColumnArray} />
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
