'use client';
import { signIn, signOut } from "next-auth/react";
import Link from 'next/link';
import styles from './Header.module.scss';
import classNames from 'classnames';
import useViewport from '@/perfect-seo-shared-components/hooks/useViewport';
import { useDispatch, useSelector } from 'react-redux';
import { selectEmail, selectIsAdmin, selectIsLoading, selectIsLoggedIn, selectPoints, selectQueue, selectUser, setLoading, updatePoints } from '@/perfect-seo-shared-components/lib/features/User';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { BrandStatus, Links, LinkType } from '@/perfect-seo-shared-components/data/types';
import { useEffect, useMemo, useState } from 'react';
import { Brands } from '@/perfect-seo-shared-components/assets/Brands';
import { renderIcon, renderLogo } from '@/perfect-seo-shared-components/utils/brandUtilities';
import { usePathname } from 'next/navigation';
import useGoogleUser from "@/perfect-seo-shared-components/hooks/useGoogleUser";
import { addUserCredit, checkUserCredits, createUserCreditAccount } from "@/perfect-seo-shared-components/services/services";
import { SEOPerfectLogo } from "@/perfect-seo-shared-components/assets/brandIcons";
import axiosInstance from "@/perfect-seo-shared-components/utils/axiosInstance";
import { createClient } from "@/perfect-seo-shared-components/utils/supabase/client";
import en from '@/assets/en.json';
import Queue from "@/perfect-seo-shared-components/components/Queue/Queue";
import { useRouter } from "next/navigation";

export interface HeaderProps {
  links?: Links[];
  current: string;
  menuHeader?: any;
  hasLogin?: boolean;
  getCredits?: boolean;
  hasQueue?: boolean
}

const Header = ({ links, menuHeader, current, hasLogin, getCredits, hasQueue }: HeaderProps) => {
  const points = useSelector(selectPoints);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const isAdmin = useSelector(selectIsAdmin);
  const isLoading = useSelector(selectIsLoading);
  const user = useSelector(selectUser);
  const email = useSelector(selectEmail)
  const [open, setOpen] = useState(true);
  const dispatch = useDispatch();
  const { phone, desktop } = useViewport();
  const [currentPage, setCurrentPage] = useState('');
  const pathname = usePathname();
  const queue = useSelector(selectQueue)
  const router = useRouter();
  const metricClickHandler = () => {
    router.push('/watchlist')
  }
  // Function to load credit data for the user
  const loadCreditData = () => {
    checkUserCredits(email)
      .then((res) => {
        dispatch(updatePoints(res?.data?.credits));
      })
      .catch((err) => {
        createUserCreditAccount(email)
          .then((res1) => {
            if (res1?.data?.credits === 0) {
              addUserCredit(email, 9000)
                .then((res2) => {
                  dispatch(updatePoints(res2?.data?.credits));
                });
            } else {
              dispatch(updatePoints(res1?.data?.credits));
            }
          })
          .catch((err) => {
            console.log("Error in creating user credits", err);
          });
      });
  };

  // Find the current brand based on the title
  const brand = Brands.find((brand) => brand.title === current);

  // Effect to load credit data when user or getCredits changes
  useEffect(() => {
    if (email) {
      if (getCredits) {
        loadCreditData();
      }
    }
  }, [email, getCredits]);

  // Initialize Supabase client
  const supabase = createClient();

  // Effect to set up an interceptor for axios responses to log errors to Supabase
  useEffect(() => {
    axiosInstance.interceptors.response.use(
      response => response,
      error => {
        supabase
          .from('user_history')
          .insert({ email: user?.email, transaction_data: error, product: en.product, type: "ERROR", action: "API Error" })
          .select('*');
        return Promise.reject(error);
      }
    );
  }, []);

  // Custom hook to handle Google user
  useGoogleUser(current);

  // Effect to update the current page route
  useEffect(() => {
    const updateRoute = (url) => {
      setOpen(false);
      if (url.includes("?")) {
        setCurrentPage(url.split("?")[0]);
      } else {
        setCurrentPage(url);
      }
    };
    updateRoute(pathname);
  }, [pathname]);

  // Handler for Google login
  const loginWithGoogleHandler = (e) => {
    e?.preventDefault();
    signIn('google', { callbackUrl: `${window.location.href}/` });
  };

  // Handler for sign out
  const signOutHandler = (e) => {
    e.preventDefault();
    signOut().then(() => {
      dispatch(setLoading(false));
      setOpen(false);
    });
  };

  // Class names for signed-in state
  const signedInClass = classNames('col-auto d-flex align-items-center', {
    'justify-content-end': !phone,
    'justify-content-center': phone,
  });

  // Memoized dynamic links based on user state
  const dynamicLinks = useMemo(() => {
    if (!links) return [];
    if (isAdmin) {
      return links;
    } else if (isLoggedIn) {
      return links.filter((link) => link.type !== LinkType.ADMIN);
    } else {
      return links.filter((link) => link.type === LinkType.PUBLIC);
    }
  }, [links, isAdmin, isLoggedIn]);

  // Handler for dropdown menu open state change
  const openChangeHandler = (open) => {
    setOpen(open);
  };

  // Handler for image click to toggle menu
  const imageClickHandler = (e) => {
    e.preventDefault();
    setOpen(!open);
  };

  const metrics = useMemo(() => {
    let newMetrics = { posts: { completed: 0, total: 0, percentage: 0 }, outlines: { completed: 0, total: 0, percentage: 0 }, contentPlans: { completed: 0, total: 0, percentage: 0 } }
    if (queue) {
      queue.forEach((item) => {
        if (item.type === 'post') {
          newMetrics.posts.total++
          if (item.isComplete === true) {
            newMetrics.posts.completed++
          }
        }
        else if (item.type === 'outline') {
          newMetrics.outlines.total++
          if (item.isComplete === true) {
            newMetrics.outlines.completed++
          }
        }
        else if (item.type === 'plan') {
          newMetrics.contentPlans.total++
          if (item.isComplete === true) {
            newMetrics.contentPlans.completed++
          }
        }
      })
    }
    if (newMetrics.posts?.total >= 0) {
      if (newMetrics.posts?.total === 0) {
        newMetrics.posts.percentage = 0
      }
      else {
        newMetrics.posts.percentage = Math.round((newMetrics.posts.completed / newMetrics.posts.total) * 100)
      }
    }
    if (newMetrics.outlines?.total >= 0) {
      if (newMetrics.outlines?.total === 0) {
        newMetrics.outlines.percentage = 0
      }
      else {
        newMetrics.outlines.percentage = Math.round((newMetrics.outlines.completed / newMetrics.outlines.total) * 100)
      }
    }
    if (newMetrics.contentPlans?.total >= 0) {
      if (newMetrics.contentPlans?.total === 0) {
        newMetrics.contentPlans.percentage = 0
      }
      else {
        newMetrics.contentPlans.percentage = Math.round((newMetrics?.contentPlans?.completed / newMetrics.contentPlans.total) * 100)
      }
    }
    return newMetrics
  }, [queue])

  const metricClasses = classNames('d-flex align-items-center mt-2 p-0',
    {
      'cursor-pointer': isAdmin && queue?.length > 0 && currentPage !== '/watchlist',
      'justify-content-end': desktop,
      'justify-content-center': !desktop
    }
  )
  return (
    <header className={styles.header}>
      {(!desktop && hasQueue) && <div className="d-none"><Queue /></div>}
      <div className='container-fluid container-xl'>
        <div className='row g-3 d-flex justify-content-between align-items-center'>
          <div className="col d-flex align-items-center justify-content-start">
            <Link href="/">
              <div className={styles.logo}>
                {renderLogo(current)}
              </div>
            </Link>
          </div>
          {isLoading === false && (
            <div className={signedInClass}>
              {hasLogin && (
                <div className='col-auto flex-column pe-3 d-flex align-items-end'>
                  {isLoggedIn ? desktop ? (
                    <>
                      <div>
                        <strong className='me-2 text-primary'>Logged in as</strong>
                        {user?.email}
                      </div>
                      {(isAdmin && queue?.length > 0) ?
                        <div className={metricClasses} onClick={metricClickHandler}>
                          {metrics?.contentPlans?.total > 0 && <>
                            <span className="py-0 px-2" id="basic-addon1"><strong>Plans</strong></span>
                            <span className="badge bg-primary py-1 px-2">{metrics?.contentPlans?.percentage}%</span>
                          </>}
                          {metrics?.outlines?.total > 0 && <>
                            <span className="py-0 px-2" id="basic-addon1"><strong>Outlines</strong></span>
                            <span className="badge bg-primary py-1 px-2">{metrics?.outlines?.percentage}%</span>
                          </>}
                          {metrics?.posts?.total > 0 && <>    <span className="py-0 px-2" id="basic-addon1"><strong>Posts</strong></span>
                            <span className="py-1 px-2 badge bg-primary">{metrics?.posts?.percentage}%</span>
                          </>}
                        </div> : points ? (
                          <div>
                            <strong className='text-primary'>Credits</strong> {points.toLocaleString()}
                          </div>
                        ) : null}
                    </>
                  ) : null : (
                    <button className="btn btn-google" onClick={loginWithGoogleHandler}>
                      <img src="/images/google-icon.png" /> Login
                    </button>
                  )}
                </div>
              )}
              {user?.image && (
                <div className="col-auto me-3">
                  <img src={user?.image} className="user-icon cursor-pointer" onClick={imageClickHandler} />
                </div>
              )}
              <DropdownMenu.Root modal defaultOpen open={open} onOpenChange={openChangeHandler}>
                <DropdownMenu.Trigger className={styles.menuButton}>
                  <i className="bi text-primary bi-grid-3x3-gap-fill" />
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content align="end" sideOffset={25} className='bg-dark card z-100'>
                    <div className={styles.menu}>
                      <div>
                        {(hasLogin && !desktop && !isLoading) && (
                          <div className='card-header bg-secondary text-white'>
                            <div className='row justify-content-between d-flex'>
                              {isLoggedIn ? (
                                <>
                                  <div className='col-12 text-white'>
                                    <strong className='me-2 text-primary'>Logged in as</strong>
                                    {user?.email}
                                  </div>
                                  {(isAdmin && queue?.length > 0) ?
                                    <div className={metricClasses} onClick={metricClickHandler}>
                                      <span className="py-0 px-2" id="basic-addon1"><strong>Plans</strong></span>
                                      <span className="badge bg-primary py-1 px-2">{metrics?.contentPlans?.percentage}%</span>
                                      <span className="py-0 px-2" id="basic-addon1"><strong>Outlines</strong></span>
                                      <span className="badge bg-primary py-1 px-2">{metrics?.outlines?.percentage}%</span>
                                      <span className="py-0 px-2" id="basic-addon1"><strong>Posts</strong></span>
                                      <span className="py-1 px-2 badge bg-primary">{metrics?.posts?.percentage}%</span>
                                    </div> :
                                    points ? (
                                      <div className='col-12 d-flex justify-content-start'>
                                        <strong className='me-2 text-primary'>Credits</strong> {points.toLocaleString()}
                                      </div>
                                    ) : null}
                                </>
                              ) : (
                                <button className="btn btn-google" onClick={loginWithGoogleHandler}>
                                  <img src="/images/google-icon.png" alt="google logo for login" /> Login
                                </button>
                              )}
                            </div>
                            {menuHeader ? menuHeader : null}
                          </div>
                        )}
                        <div className='row g-2 justify-content-end p-3'>
                          {dynamicLinks?.length > 0 && (
                            <>
                              {currentPage !== "/" && (
                                <div className='col-12'>
                                  <Link href="/">
                                    <i className="bi bi-house-fill me-2 text-white" />Return Home
                                  </Link>
                                </div>
                              )}
                              {dynamicLinks.map((link, index) => {
                                let href = typeof link.href === 'function' ? link.href(user) : link.href;
                                return (
                                  <div className='col-12' key={link.href}>
                                    <Link href={href} className={currentPage === href ? 'text-white' : 'text-primary'}>
                                      {link?.type === LinkType.ADMIN ? (
                                        <i className="bi text-white bi-shield-lock-fill me-2" title="Admin Only" />
                                      ) : link?.type === LinkType.PRIVATE ? (
                                        <i className="bi text-white bi-person-check-fill me-2" title="Logged In Only" />
                                      ) : null}
                                      {link.label}
                                      {link?.href === '/watchlist' &&
                                        <div className="input-group">
                                        </div>}
                                    </Link>
                                  </div>
                                );
                              })}
                            </>
                          )}
                          {hasLogin && isLoggedIn && (
                            <div className='col-12'>
                              <a className="text-primary" onClick={signOutHandler}>
                                <i className="bi text-white bi-unlock-fill me-2" />Sign Out
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className='card-body d-flex align-items-end'>
                        <div className='row g-3 justify-content-start'>
                          <div className='col-4 text-end d-flex align-items-center justify-content-center'>
                            <span className='fs-2 mb-3'>Our Products</span>
                          </div>
                          {Brands.filter((obj) => obj.status === BrandStatus.LIVE).map((brand, index) => (
                            <div key={index} className='col-4 text-center'>
                              <a href={brand.url} className={styles.brandUrl} target="_blank">
                                <div className={styles.brandIcon}>{renderIcon(brand.title)}</div>
                                {brand.title.replace(".ai", "")}
                              </a>
                            </div>
                          ))}
                          <div className="col-12 d-flex justify-content-center align-items-center">
                            <div className="h-100 w-75">
                              <a href='https://seoperfect.ai/' className="w-100" target="_blank">
                                <SEOPerfectLogo />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          )}
        </div>
      </div>

    </header>
  );
};

export default Header;