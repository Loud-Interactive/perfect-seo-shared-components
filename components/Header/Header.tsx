import Link from 'next/link'
import styles from './Header.module.scss'
import { loginWithGoogle, logout } from '@/utils/supabase/actions'
import { useRouter } from 'next/router'
import classNames from 'classnames'
import useViewport from '@/perfect-seo-shared-components/hooks/useViewport'
import { useDispatch, useSelector } from 'react-redux'
import { StateTree } from '@/store/reducer'
import { reduxReset } from '@/store/actions'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { BrandStatus, Links, LinkType } from '@/perfect-seo-shared-components/data/types'
import { useEffect, useMemo, useState } from 'react'
import useManageUser from '@/perfect-seo-shared-components/hooks/useManageUser'
import { Brands } from '@/perfect-seo-shared-components/assets/Brands'
import { renderIcon, renderLogo } from '@/perfect-seo-shared-components/utils/brandUtilities'


export interface HeaderProps {
  links?: Links[],
  current: string,
  menuHeader?: any,
  hasLogin?: boolean;
}
const Header = ({ links, menuHeader, current, hasLogin }: HeaderProps) => {
  const { isLoggedIn, user, isAdmin } = useSelector((state: StateTree) => state);
  const [open, setOpen] = useState(true)
  const router = useRouter()
  const dispatch = useDispatch()
  const { phone } = useViewport()
  const [currentPage, setCurrentPage] = useState('')
  useManageUser()

  useEffect(() => {
    const updateRoute = (url) => {
      setOpen(false)
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

            <DropdownMenu.Root defaultOpen open={open} onOpenChange={openChangeHandler}>
              <DropdownMenu.Trigger className={styles.menuButton}>
                <i className="bi bi-grid-3x3-gap-fill" />
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" sideOffset={25} className='bg-dark card z-100'>
                  <div className={styles.menu}>
                    <div>
                      {hasLogin && <div className='card-header'>
                        <div className='row justify-content-between'>

                          {isLoggedIn ? <>
                            <div className='col-auto'>
                              <strong className='me-2'>Logged in as</strong>
                              {user?.email}</div>
                            <div className='col-auto'><a onClick={signOutHandler}>Sign Out</a>
                            </div></>
                            :

                            <button className="btn btn-google" onClick={loginWithGoogle}><img src="/images/google-icon.png" /> Login</button>

                          }
                        </div>
                        {menuHeader}
                      </div>}
                      {dynamicLinks?.length > 0 && <div className='row g-2 justify-content-end p-3'>
                        {currentPage !== "/" && <div className='col-12'>
                          <Link href="/">Return Home</Link>
                        </div>}
                        {dynamicLinks.map((link, index) => {
                          let href = typeof link.href === 'function' ? link.href(user) : link.href
                          return (
                            <div className='col-12' key={link.href}>
                              <Link href={href} className={currentPage === href ? 'text-white' : ''}>{link.label}</Link>
                            </div>
                          )
                        })}
                      </div>}
                    </div>
                    <div className='card-body d-flex align-items-end'>
                      <div className='row g-3'>
                        <div className='col-12'>
                          <span className='fs-2'>Our Other Products</span>
                        </div>
                        {Brands.filter((obj) => obj.status === BrandStatus.LIVE && obj.title !== current).map((brand, index) => {

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
    </header>
  )
}

export default Header