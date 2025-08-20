'use client'

import { selectDomains, selectIsAdmin } from "@/perfect-seo-shared-components/lib/features/User"
import { createClient } from "@/perfect-seo-shared-components/utils/supabase/client"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import Table from "@/perfect-seo-shared-components/components/Table/Table"
import usePaginator from "@/perfect-seo-shared-components/hooks/usePaginator"
import { getDomains } from "@/perfect-seo-shared-components/services/services"

const DomainsList = () => {
  const domain_access = useSelector(selectDomains)
  const [domains, setDomains] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all') // 'all', 'hidden', 'visible'
  const isAdmin = useSelector(selectIsAdmin)
  const itemsPerPage = 10

  const paginator = usePaginator()

  const supabase = createClient();

  const fetchDomains = async () => {
    if (!domain_access?.length) return;

    setLoading(true)

    // Convert filter to boolean or null for getDomains
    let hiddenFilter = null;
    if (filter === 'hidden') {
      hiddenFilter = true;
    } else if (filter === 'visible') {
      hiddenFilter = false;
    }
    let domains = isAdmin ? null : domain_access.map(obj => obj.siteUrl)

    getDomains(domains, hiddenFilter, paginator.paginationObj)
      .then(res => {
        console.log(res)
        paginator.setItemCount(res.count || 0)
        setLoading(false)
        setDomains(res.data || [])
      }
      )
  }

  const handleHideDomain = async (domain: string) => {
    try {
      const { error } = await supabase
        .from('domains')
        .update({ hidden: true })
        .eq('domain', domain)

      if (error) {
        console.error('Error hiding domain:', error)
      } else {
        // Refresh the current page
        fetchDomains()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleUnhideDomain = async (domain: string) => {
    try {
      const { error } = await supabase
        .from('domains')
        .update({ hidden: false })
        .eq('domain', domain)

      if (error) {
        console.error('Error unhiding domain:', error)
      } else {
        // Refresh the current page
        fetchDomains()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }


  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter)
    paginator.setCurrentPage(1) // Reset to first page when filter changes
    fetchDomains()
  }

  useEffect(() => {
    if (domain_access?.length > 0) {
      fetchDomains()
    }
  }, [domain_access, paginator?.currentPage, paginator?.limit, filter])

  const columns = [
    {
      id: 'domain',
      key: 'domain',
      Header: 'Domain',
      accessor: (row: any) => (
        <span className={row.hidden ? 'text-muted text-decoration-line-through' : ''}>{row.domain}</span>
      )
    },
    {
      id: 'hidden',
      key: 'hidden',
      label: 'Status',
      accessor: (row: any) => (
        <span className={`badge ${row.hidden ? 'bg-secondary' : 'bg-success'}`}>
          {row.hidden ? 'Hidden' : 'Visible'}
        </span>
      )
    },
    {
      id: 'actions',
      key: 'actions',
      label: 'Actions',
      accessor: (row: any) => (
        <div className="d-flex gap-2">
          {!row.hidden && (
            <button
              className="btn btn-sm btn-outline-warning"
              onClick={() => handleHideDomain(row.domain)}
            >
              Hide Domain
            </button>
          )}
          {row.hidden && (
            <button
              className="btn btn-sm btn-outline-success"
              onClick={() => handleUnhideDomain(row.domain)}
            >
              Restore
            </button>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="container">
      <h2>Domains Management</h2>
      <p className="text-muted mb-3">
        Manage your accessible domains. You can hide/show domains using the hidden flag.
      </p>

      {/* Filter Controls */}
      <div className="mb-3">
        <div className="btn-group" role="group" aria-label="Domain filter">
          <button
            type="button"
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleFilterChange('all')}
          >
            All Domains
          </button>
          <button
            type="button"
            className={`btn ${filter === 'visible' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleFilterChange('visible')}
          >
            Visible Domains
          </button>
          <button
            type="button"
            className={`btn ${filter === 'hidden' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleFilterChange('hidden')}
          >
            Hidden Domains
          </button>
        </div>
      </div>

      <Table
        rawData={domains}
        columnArray={columns}
        isLoading={loading}
      />
      {paginator.renderComponent()}
    </div>
  )
}

export default DomainsList