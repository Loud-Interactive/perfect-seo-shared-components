'use client'

import { selectDomains, selectIsAdmin } from "@/perfect-seo-shared-components/lib/features/User"
import { createClient } from "@/perfect-seo-shared-components/utils/supabase/client"
import { useEffect, useState, useCallback } from "react"
import { useSelector } from "react-redux"
import Table from "@/perfect-seo-shared-components/components/Table/Table"
import usePaginator from "@/perfect-seo-shared-components/hooks/usePaginator"
import { getDomains } from "@/perfect-seo-shared-components/services/services"

const DomainsList = () => {
  const domain_access = useSelector(selectDomains)
  const [domains, setDomains] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all') // 'all', 'hidden', 'visible'
  const [searchTerm, setSearchTerm] = useState('')
  const isAdmin = useSelector(selectIsAdmin)

  const paginator = usePaginator()
  const supabase = createClient();

  // Debounced search function that queries Supabase
  const debounceSearch = useCallback((searchValue: string) => {
    const timer = setTimeout(() => {
      fetchDomains(searchValue)
    }, 300)

    return () => clearTimeout(timer)
  }, [filter, paginator.paginationObj])

  const fetchDomains = async (searchQuery?: string) => {
    if (!isAdmin && !domain_access?.length) return;

    setLoading(true)

    // Convert filter to boolean or null for getDomains
    let hiddenFilter = null;
    if (filter === 'hidden') {
      hiddenFilter = true;
    } else if (filter === 'visible') {
      hiddenFilter = false;
    }

    let domainsFilter = isAdmin ? null : domain_access.map(obj => obj.siteUrl)

    // Build query with search term
    let query = supabase.from('domains')
      .select('*', { count: 'exact' })
      .order('domain', { ascending: true })

    // Apply domain access filter
    if (domainsFilter && domainsFilter.length > 0) {
      query = query.in('domain', domainsFilter)
    }

    // Apply hidden filter
    if (hiddenFilter !== null && hiddenFilter !== undefined) {
      query = query.eq('hidden', hiddenFilter)
    }

    // Apply search filter
    if (searchQuery && searchQuery.trim() !== '') {
      query = query.ilike('domain', `%${searchQuery}%`)
    }

    // Apply pagination
    if (paginator.paginationObj) {
      const startIndex = paginator.paginationObj.page === 1 ? 0 : (paginator.paginationObj.page - 1) * paginator.paginationObj.page_size;
      const endIndex = startIndex + paginator.paginationObj.page_size - 1;
      query = query.range(startIndex, endIndex)
    }

    try {
      const res = await query
      console.log(res)
      paginator.setItemCount(res.count || 0)
      setLoading(false)
      setDomains(res.data || [])
    } catch (error) {
      console.error('Error fetching domains:', error)
      setLoading(false)
    }
  }

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)

    // Clear previous debounce and start new one
    debounceSearch(value)
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
        setSearchTerm('');
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
  }

  useEffect(() => {
    if (isAdmin || domain_access?.length > 0) {
      fetchDomains(searchTerm)
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

      {/* Search Input */}
      <div className="mb-3">
        <div className="row">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Search domains..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

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