'use client'
import { signIn, signOut } from "next-auth/react"
import Link from 'next/link'
import styles from './Header.module.scss'
import classNames from 'classnames'
import useViewport from '@/perfect-seo-shared-components/hooks/useViewport'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading, updatePoints } from '@/perfect-seo-shared-components/lib/features/User'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { BrandStatus, Links, LinkType } from '@/perfect-seo-shared-components/data/types'
import { useEffect, useMemo, useState } from 'react'
import { Brands } from '@/perfect-seo-shared-components/assets/Brands'
import { renderIcon, renderLogo } from '@/perfect-seo-shared-components/utils/brandUtilities'
import { usePathname, useRouter } from 'next/navigation'
import { RootState } from '@/perfect-seo-shared-components/lib/store'
import useGoogleUser from "@/perfect-seo-shared-components/hooks/useGoogleUser"
import { addUserCredit, checkUserCredits, createUserCreditAccount } from "@/perfect-seo-shared-components/services/services"
import { SEOPerfectLogo } from "@/perfect-seo-shared-components/assets/brandIcons"

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

  const loadCreditData = (email: string) => {

    checkUserCredits(email).then((res) => {
      dispatch(updatePoints(res?.data?.credits))
    })
      .catch(err => {
        createUserCreditAccount(email)
          .then(res1 => {
            if (res1?.data?.credits === 0) {
              addUserCredit(email, 9000)
                .then(res2 => {
                  dispatch(updatePoints(res2?.data?.credits))
                })
            } else {
              dispatch(updatePoints(res1?.data?.credits))
            }
          })
          .catch(err => {
            console.log("Error in creating user credits", err)
          })
      })
  };


  const brand = Brands.find((brand) => brand.title === current)

  useEffect(() => {
    if (user?.email && getCredits) {
      loadCreditData(user.email)
    }
  }, [user, getCredits])

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

    signIn('google', { callbackUrl: `${window.location.href}/` })

  }

  const signOutHandler = (e) => {
    e.preventDefault()
    signOut()
      .then(res => {
        setOpen(false)
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

  const imageClickHandler = (e) => {
    e.preventDefault();
    setOpen(!open)
  }

  return (
    <header className={styles.header}>
      <div className='container-fluid container-xl'>
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
            {user?.image && <div className="col-auto me-3">
              <img src={user?.image} className="user-icon cursor-pointer" onClick={imageClickHandler} />
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
                      <div className='row g-3 justify-content-start'>
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
                        <div className="col-4">
                          <div className="h-100 pt-2">
                            <a href='https://seoperfect.ai/' className="h-100 w-100 d-flex align-items-center" target="_blank">  <SEOPerfectLogo /></a>
                          </div>
                        </div>
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