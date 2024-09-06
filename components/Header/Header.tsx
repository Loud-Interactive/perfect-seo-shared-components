import Link from 'next/link'
import styles from './Header.module.scss'
import { PerfectSEOLogo } from '@/assets/global-assets/brandIcons'
import { loginWithGoogle, logout } from '@/utils/supabase/actions'
import { useRouter } from 'next/router'
import classNames from 'classnames'
import useViewport from '@/hooks/useViewport'
import { useDispatch, useSelector } from 'react-redux'
import { StateTree } from '@/store/reducer'
import { reduxReset } from '@/store/actions'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Brands } from '@/assets/global-assets/Brands'
import { BrandStatus } from '@/perfect-seo-shared-components/types'
import { useEffect, useState } from 'react'
import useManageUser from '@/hooks/useManageUser'

const Header = () => {
  const { isLoggedIn, user, isAdmin } = useSelector((state: StateTree) => state);

  const router = useRouter()
  const dispatch = useDispatch()
  const { phone } = useViewport()
  const [currentPage, setCurrentPage] = useState('')
  useManageUser()

  useEffect(() => {
    const updateRoute = (url) => {
      setCurrentPage(url.split("/")[1])
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

  const signInHandler = (e) => {
    e.preventDefault();
    router.push('/login')
  }
  const signedInClass = classNames('col-auto d-flex align-items-center',
    {
      'justify-content-end': !phone,
      'justify-content-center': phone
    }
  )


  const headerClasses = classNames(styles.header,
    { 'bg-dark': true }
  )
  return (
    <header className={headerClasses}>
      <div className='container'>
        <div className='row g-3 d-flex justify-content-between align-items-center'>

          <div className="col d-flex align-items-center justify-content-start">
            <Link href="/">
              <div className={styles.logo}>
                <PerfectSEOLogo />
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
                          </div>

                          <div className='row g-2 justify-content-end p-3'>
                            {currentPage && <div className='col-12'>
                              <Link href="/">Return Home</Link>
                            </div>}
                            {/* <div className='col-12 p-3'>
                            <Link href="/blog">Blog</Link>
                          </div> */}
                            {isAdmin && <div className='col-12'>
                              <Link href="/admin" className={currentPage === 'admin' ? 'text-white' : ''}>Admin Dashboard</Link>
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