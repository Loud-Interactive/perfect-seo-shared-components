'use client'
import { signIn, useSession } from "next-auth/react"
import Link from 'next/link'
import styles from './Header.module.scss'
import { loginWithGoogle, logout } from '@/perfect-seo-shared-components/utils/supabase/actions'
import classNames from 'classnames'
import useViewport from '@/perfect-seo-shared-components/hooks/useViewport'
import { useDispatch, useSelector } from 'react-redux'
import { reset, setLoading, setLoggedIn } from '@/perfect-seo-shared-components/lib/features/User'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Brand, BrandStatus, Links, LinkType } from '@/perfect-seo-shared-components/data/types'
import { useEffect, useMemo, useState } from 'react'
import useManageUser from '@/perfect-seo-shared-components/hooks/useManageUser'
import { Brands } from '@/perfect-seo-shared-components/assets/Brands'
import { renderIcon, renderLogo } from '@/perfect-seo-shared-components/utils/brandUtilities'

import { loadCreditData } from '@/perfect-seo-shared-components/store/thunks'
import { usePathname, useRouter } from 'next/navigation'
import { RootState } from '@/perfect-seo-shared-components/lib/store'
import useGoogleUser from "@/perfect-seo-shared-components/hooks/useGoogleUser"

export interface HeaderProps {
  links?: Links[],
  current: string,
  menuHeader?: any,
  hasLogin?: boolean;
  getCredits?: boolean;
}
const Header = ({ links, menuHeader, current, hasLogin, getCredits }: HeaderProps) => {
  const { isLoggedIn, user, isAdmin, points, isLoading } = useSelector((state: RootState) => state);
  const [open, setOpen] = useState(true)
  const router = useRouter()
  const dispatch = useDispatch()
  const { phone } = useViewport()
  const [currentPage, setCurrentPage] = useState('')
  const pathname = usePathname()

  const brand = Brands.find((brand) => brand.title === current)
  useEffect(() => {
    if (user && getCredits) {
      dispatch(loadCreditData(user?.email) as any); // Add 'as any' to cast the action to 'UnknownAction'
    }
  }, [user, getCredits, dispatch]) // Add 'dispatch' to the dependency array

  // useManageUser(current)
  useGoogleUser(current)


  useEffect(() => {
    const updateRoute = (url) => {
      setOpen(false)
      if (url.includes("?")) {
        setCurrentPage(url.split("?")[0])
      }
      else {
        setCurrentPage(url)
      }
    }
    updateRoute(pathname)
  }, [pathname])

  const loginWithGoogleHandler = (e) => {
    e?.preventDefault();
    dispatch(setLoading(true))
    // loginWithGoogle()
    signIn('google', { callbackUrl: `${window.location.origin}/` })

  }

  const signOutHandler = (e) => {
    e.preventDefault()
    logout()
      .then(res => {
        setOpen(false)
        if (res.error) {
          console.log(res.error)
        }
        else {
          dispatch(reset())
          router.push('/')
        }
      })

  }


  const signedInClass = classNames('col-auto d-flex align-items-center',
    {
      'justify-content-end': !phone,
      'justify-content-center': phone
    }
  )

  const dynamicLinks = useMemo(() => {
    if (!links) return []
    if (isAdmin) {
      return links
    }
    else if (isLoggedIn) {

      return links.filter((link) => link.type !== LinkType.ADMIN)
    }

    else return links.filter((link) => link.type === LinkType.PUBLIC);
  }, [links, isAdmin, isLoggedIn])

  const openChangeHandler = (open) => {
    setOpen(open)
  }

  return (
    <header className={styles.header}>
      <div className='container'>
        <div className='row g-3 d-flex justify-content-between align-items-center'>

          <div className="col d-flex align-items-center justify-content-start">
            <Link href="/">
              <div className={styles.logo}>
                {renderLogo(current)}
              </div>
            </Link>
          </div>
          <div className={signedInClass}>
            {(hasLogin && !phone && !isLoading) && <div className='col-auto flex-column pe-3 d-flex align-items-end'>

              {isLoggedIn ? <>
                <div>
                  <strong className='me-2 text-primary'>Logged in as</strong>
                  {user?.email}</div>

                {points ? <div><strong className='text-primary'>Credits</strong> {points.toLocaleString()}</div> : null}
              </>
                :

                <button className="btn btn-google" onClick={loginWithGoogleHandler}><img src="/images/google-icon.png" /> Login</button>

              }
            </div>}
            <DropdownMenu.Root defaultOpen open={open} onOpenChange={openChangeHandler}>
              <DropdownMenu.Trigger className={styles.menuButton}>
                <i className="bi text-primary bi-grid-3x3-gap-fill" />
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" sideOffset={25} className='bg-dark card z-100'>
                  <div className={styles.menu}>
                    <div>
                      {(hasLogin && phone && !isLoading) && <div className='card-header bg-secondary text-white'>
                        <div className='row justify-content-between d-flex'>

                          {isLoggedIn ? <>
                            <div className='col-12 text-white'>
                              <strong className='me-2 text-primary'>Logged in as</strong>
                              {user?.email}</div>

                            {points ? <div className='col-12 d-flex justify-content-start'><strong className='me-2 text-primary'>Credits</strong> {points.toLocaleString()}</div> : null}
                          </>
                            :

                            <button className="btn btn-google" onClick={loginWithGoogleHandler}><img src="/images/google-icon.png" /> Login</button>

                          }
                        </div>
                        {menuHeader ? menuHeader : null}
                      </div>}
                      <div className='row g-2 justify-content-end p-3'>
                        {dynamicLinks?.length > 0 && <>
                          {currentPage !== "/" && <div className='col-12'>
                            <Link href="/">Return Home</Link>
                          </div>}
                          {dynamicLinks.map((link, index) => {
                            let href = typeof link.href === 'function' ? link.href(user) : link.href
                            return (
                              <div className='col-12' key={link.href}>
                                <Link href={href} className={currentPage === href ? 'text-white' : 'text-primary'}>{link?.type === LinkType.ADMIN ? <i className="bi text-white bi-shield-lock-fill me-2" title="Admin Only" /> : link?.type === LinkType.PRIVATE ? <i className="bi text-white bi-person-check-fill me-2" title="Logged In Only" /> : null}{link.label}</Link>
                              </div>
                            )
                          })}
                        </>}
                        {isAdmin && <>
                          {brand?.developmentUrl && <div className='col-12'>
                            <Link target='_blank' className='text-primary'
                              href={brand.developmentUrl}><i className="bi text-white bi-shield-lock-fill me-2" title="Admin Only" />View Development Env</Link>
                          </div>}
                          {brand?.stagingUrl && <div className='col-12'>
                            <Link href={brand?.stagingUrl} target='_blank' className='text-primary'><i className="bi text-white bi-shield-lock-fill me-2" title="Admin Only" />View Staging Env</Link>
                          </div>}
                        </>}
                        {(hasLogin && isLoggedIn) && <div className='col-12'>
                          <a className="text-primary" onClick={signOutHandler}><i className="bi text-white bi-unlock-fill me-2" />Sign Out</a>
                        </div>}
                      </div>
                    </div>
                    <div className='card-body d-flex align-items-end'>
                      <div className='row g-3'>
                        <div className='col-12'>
                          <span className='fs-2'>Our Products</span>
                        </div>
                        {Brands.filter((obj) => obj.status === BrandStatus.LIVE).map((brand, index) => {

                          return (
                            <div key={index} className='col-4 text-center'>
                              <a href={brand.url} className={styles.brandUrl} target="_blank"><div className={styles.brandIcon}>{renderIcon(brand.title)}</div>
                                {brand.title.replace(".ai", "")}
                              </a>
                            </div>
                          )
                        })}
                      </div>

                    </div>

                  </div>


                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
      </div>
    </header >
  )
}

export default Header