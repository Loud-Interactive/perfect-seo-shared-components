'use client'

import React, { ReactNode, useCallback } from 'react';
import classNames from 'classnames';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export interface TabItem {
  key: string;
  title: string;
  disabled?: boolean;
}

export interface CustomTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange?: (tabKey: string) => void;
  children: ReactNode;
  className?: string;
  enableRouting?: boolean;
  domain?: string | null;
  tabsRequiringDomain?: string[];
}

export interface CustomTabContentProps {
  tabKey: string;
  activeTab: string;
  children: ReactNode;
  className?: string;
}

export const CustomTabContent: React.FC<CustomTabContentProps> = ({
  tabKey,
  activeTab,
  children,
  className
}) => {
  const isActive = tabKey === activeTab;

  return (
    <div
      className={classNames(
        'tab-pane fade',
        { 'show active': isActive },
        className
      )}
      id={tabKey}
      role="tabpanel"
      aria-labelledby={`${tabKey}-tab`}
    >
      <div className='tab p-3'>
        {children}
      </div>
    </div>
  );
};

const CustomTabs: React.FC<CustomTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  children,
  className,
  enableRouting = true,
  domain,
  tabsRequiringDomain = []
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Create query string helper
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const handleTabClick = (e: React.MouseEvent, tabKey: string) => {
    e.preventDefault();
    if (!tabs.find(tab => tab.key === tabKey)?.disabled) {
      if (enableRouting) {
        // Build URL with tab parameter
        let url = `${pathname}?tab=${tabKey}`;

        // Add domain parameter if domain exists and tab requires it
        if (domain && tabsRequiringDomain.includes(tabKey)) {
          url += `&domain=${domain}`;
        } else if (domain && tabsRequiringDomain.length === 0) {
          // If no specific tabs require domain, add to all tabs
          url += `&domain=${domain}`;
        }

        router.replace(url);
      }

      // Call the external tab change handler if provided
      if (onTabChange) {
        onTabChange(tabKey);
      }
    }
  };

  return (
    <div className={className}>
      <ul className="nav nav-tabs mb-0 w-100">
        {tabs.map((tab) => {
          const tabClasses = classNames('nav-link', {
            'active': tab.key === activeTab,
            'disabled': tab.disabled
          });
          const tabKey = `${tab.key}-tab`;

          return (
            <li className="nav-item" key={tabKey}>
              <button
                onClick={(e) => handleTabClick(e, tab.key)}
                id={tabKey}
                data-bs-toggle={tab.key}
                data-bs-target={`#${tab.key}`}
                role={tab.key}
                aria-controls={tab.key}
                aria-selected={activeTab === tab.key}
                className={tabClasses}
                name={tab.key}
                disabled={tab.disabled}
              >
                {tab.title}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="tab-content mb-3" id="customTabContent">
        {children}
      </div>
    </div>
  );
};

export default CustomTabs;
