import Link from 'next/link'
import styles from './Header.module.scss'
import { PerfectSEOLogo } from '@/perfect-seo-shared-components/assets/brandIcons'
import { loginWithGoogle, logout } from '@/utils/supabase/actions'
import { useRouter } from 'next/router'
import classNames from 'classnames'
import useViewport from '@/perfect-seo-shared-components/hooks/useViewport'
import { useDispatch, useSelector } from 'react-redux'
import { StateTree } from '@/store/reducer'
import { reduxReset } from '@/store/actions'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { BrandStatus, Links } from '@/perfect-seo-shared-components/data/types'
import { useEffect, useState } from 'react'
import useManageUser from '@/perfect-seo-shared-components/hooks/useManageUser'
import { Brands } from '@/perfect-seo-shared-components/assets/Brands'
import { renderLogo } from '@/perfect-seo-shared-components/utils/brandUtilities'

export interface HeaderProps {
  links?: Links[],
  current: string,
  menuHeader?: any
}
const Header = ({ links, menuHeader, current }: HeaderProps) => {
  const { isLoggedIn, user, isAdmin } = useSelector((state: StateTree) => state);

  const router = useRouter()
  const dispatch = useDispatch()
  const { phone } = useViewport()
  const [currentPage, setCurrentPage] = useState('')
  useManageUser()

  useEffect(() => {
    const updateRoute = (url) => {
      setCurrentPage(url)
    }
    updateRoute(router.pathname)
    router.events.on('routeChangeComplete', updateRoute)
    return () => {
      router.events.off('routeChangeComplete', updateRoute)
    }
  }, [])

  const signOutHandler = (e) => {
    e.preventDefault()
    logout()
      .then(res => {
        if (res.error) {

        }
        else {
          dispatch(reduxReset())
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
            {(isLoggedIn && user) ?
              <>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger className={styles.menuButton}>
                    <i className="bi bi-grid-3x3-gap-fill" />
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Portal>
                    <DropdownMenu.Content align="end" sideOffset={25} className='bg-dark card z-100'>
                      <div className={styles.menu}>
                        <div>
                          <div className='card-header'>
                            <div className='row justify-content-between'>
                              <div className='col-auto'>
                                <strong className='me-2'>Logged in as</strong>
                                {user?.email}</div>
                              <div className='col-auto'><a onClick={signOutHandler}>Sign Out</a>
                              </div>
                            </div>
                            {menuHeader}
                          </div>
                          {links?.length > 0 && <div className='row g-2 justify-content-end p-3'>
                            {currentPage !== "/" && <div className='col-12'>
                              <Link href="/">Return Home</Link>
                            </div>}
                            {links.map((link, index) => {
                              return (
                                <div className='col-12' key={link.href}>
                                  <Link href={link.href} className={currentPage == link.href ? 'text-white no-underline' : ''}>{link.label}</Link>
                                </div>
                              )
                            })}
                          </div>}

                        </div>
                        <div className='card-body d-flex align-items-end'>
                          <div className='row g-3'>
                            <div className='col-12'>
                              <span className='fs-2'>Our Products</span>
                            </div>
                            {Brands.filter((obj) => obj.status === BrandStatus.LIVE).map((brand, index) => {

                              return (
                                <div key={index} className='col-4 text-center'>
                                  <a href={brand.url} className={styles.brandUrl} target="_blank"><img src={brand.icon} className={styles.brandIcon} />
                                    <br />
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
              </>
              :
              <button className="btn btn-google ms-3" onClick={loginWithGoogle}><img src="/images/google-icon.png" /> Login</button>
            }
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header