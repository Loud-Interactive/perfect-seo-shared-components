import classNames from 'classnames';
import React, { useMemo, useState } from 'react';
import useViewport from './useViewport';
import { PaginationRequest } from '@/perfect-seo-shared-components/data/types';

export interface PaginatorMetricsProps {
  pages: number[]
  pageCount: number
  startIndex: number
  endIndex: number
  groupStart: number
  groupEnd: number
  currentPage: number
}

export interface PaginatorMaxButtonTypes {
  phone?: number
  tablet?: number
  desktop?: number
}

interface PaginatorController {
  metrics: PaginatorMetricsProps,
  renderComponent: () => any
  currentPage: number,
  setCurrentPage: (number) => any,
  itemCount: number,
  setItemCount: (number) => any,
  limit: number,
  setLimit: (number) => any,
  paginationObj: PaginationRequest,
  maxButtons: PaginatorMaxButtonTypes,
  setMaxButtons?: (obj: PaginatorMaxButtonTypes) => void
}

const usePaginator = (): PaginatorController => {

  const [currentPage, setCurrentPage] = useState(1);
  const [itemCount, setItemCount] = useState(0);
  const [limit, setLimit] = useState(10);
  const [maxButtons, setMaxButtons] = useState<PaginatorMaxButtonTypes>({ phone: 5, tablet: 7, desktop: 7 });
  const { phone, tablet } = useViewport();

  const groupMax = useMemo(() => {
    if (phone) {
      return maxButtons.phone;
    } else if (tablet) {
      return maxButtons.tablet;
    } else return maxButtons.desktop;
  }, [phone, tablet]);

  const pageDataMetrics = useMemo((): PaginatorMetricsProps => {
    console.log(itemCount, limit, groupMax)
    let pageCount = Math.ceil(itemCount / limit);
    console.log(pageCount)
    let pages = new Array(pageCount).fill(1).map((obj, i) => i + 1);
    let groupStart, groupEnd;
    if (!itemCount || itemCount === 0) {

    }
    else if (pageCount <= groupMax) {
      console.log(pageCount, itemCount, limit, groupMax, 1)
      groupEnd = pageCount;
      groupStart = 0;
    } else if (currentPage < groupMax) {
      console.log(itemCount, 2)
      groupStart = 0;
      groupEnd = groupMax - 1;
    } else if (currentPage >= pageCount - groupMax + 3) {
      console.log(itemCount, 3)
      groupStart = pageCount - groupMax + 1;
      groupEnd = pageCount;

    } else if (currentPage >= groupMax - 1 && currentPage < pageCount - groupMax + 2) {
      console.log(itemCount, 4)
      groupEnd = currentPage + groupMax - 3;
      groupStart = currentPage - 1;
    }

    let startIndex = currentPage * limit;
    let endIndex = startIndex + limit;

    if (currentPage === pageCount) {
      endIndex = itemCount;
    }

    return (
      { pageCount, pages, startIndex, endIndex, groupStart, groupEnd, currentPage }
    );
  }, [currentPage, phone, itemCount, limit]);

  const Paginator = () => {

    const { pages, pageCount, groupStart, groupEnd } = pageDataMetrics;

    const onClick = (number) => {
      if (number >= 0 && number <= pageCount) {
        setCurrentPage(number);
      }
    };

    const leftArrowButtonClasses = classNames(' page-link me-2', {
      'text-black': currentPage === 1
    });
    const rightArrowButtonClasses = classNames(' page-link ms-2', {
      'text-black': currentPage === pageCount
    });

    const pageOneClasses = classNames('page-item',
      { 'active': currentPage === 1 }
    )

    if (pageCount > 1) {
      return (
        <nav className="paginator d-flex align-items-center">
          <button className={leftArrowButtonClasses} onClick={() => onClick((currentPage - 1))} disabled={currentPage === 1}><i className='bi bi-caret-left-fill' /></button>
          <ul className="pagination mb-0">
            {pageCount > groupMax && groupStart !== 0 ? <li className={pageOneClasses}>
              <button className="page-link" onClick={() => onClick(1)} >1</button>
            </li> : null}
            {pageCount > groupMax && groupStart !== 0 ? <li className='page-item'>
              <button className="page-link text-black disabled" disabled><i className="bi bi-three-dots" /></button>
            </li> : null}
            {pages.slice(groupStart, groupEnd).map((num, i) => {
              const buttonClassNames = classNames('page-item', {
                'active': num === currentPage,
              });

              return (
                <li className={buttonClassNames} key={i}>
                  <button className='page-link' onClick={() => onClick((num))}>{num}</button>
                </li>
              );
            })}

            {(pageCount > groupMax && groupEnd !== pageCount) ?
              <li className='page-item'>
                <button className="page-link text-black disabled" disabled><i className="bi bi-three-dots" /></button>
              </li> : null}
            {(pageCount > groupMax && groupEnd !== pageCount) ?
              <li className='page-item'>
                <button className="page-link" onClick={() => onClick(pageCount)} >{pageCount}</button>
              </li> : null}
          </ul>

          <button className={rightArrowButtonClasses} onClick={() => onClick((currentPage + 1))} disabled={currentPage === pageCount}><i className='bi bi-caret-right-fill' /></button>
        </nav >
      );
    } else return null;
  };

  return {
    metrics: pageDataMetrics,
    currentPage,
    setCurrentPage,
    limit,
    setLimit,
    itemCount,
    setItemCount,
    renderComponent: () => (<Paginator />),
    paginationObj: { page_size: limit, page: currentPage },
    setMaxButtons,
    maxButtons,
  };
};

export default usePaginator;

