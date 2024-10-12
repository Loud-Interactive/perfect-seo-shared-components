'use client'
import { RootState } from '@/perfect-seo-shared-components/lib/store'
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from 'react'
import { setAdmin, setLoading, setLoggedIn, setProfile, setUser } from '@/perfect-seo-shared-components/lib/features/User'
import { createClient } from '@/perfect-seo-shared-components/utils/supabase/client'
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { urlSanitization } from '../utils/conversion-utilities';
import { useSession } from 'next-auth/react';
import en from '@/assets/en.json';
const useGoogleUser = (appKey) => {
  const { user, isLoggedIn, profile } = useSelector((state: RootState) => state);
  const [token, setToken] = useState(null)
  const [userData, setUserData] = useState<any>(null)
  const dispatch = useDispatch();
  const supabase = createClient()

  const { data: session, status } = useSession()


  //set status based on loading of session
  useEffect(() => {
    let sessionData: any = session;
    switch (status) {
      case 'loading':
        dispatch(setLoading(true));
        break;
      case 'authenticated':
        dispatch(setLoading(false));
        dispatch(setLoggedIn(true));
        break;
      case 'unauthenticated':
        dispatch(setLoading(false));
        dispatch(setLoggedIn(false));
        break;
    }
    if (session) {
      if (session?.user) {
        console.log("dispatching user")
        dispatch(setUser(session.user))
        localStorage.setItem('email', session.user.email)
      }
    }
    if (sessionData?.access_token) {
      setToken(sessionData.access_token)
    }
  }, [status])

  useEffect(() => {
    if (token) {
      checkUserDomains();
    }
  }, [token])

  const updateProducts = () => {
    let products = { ...userData.products }
    delete products?.perfectSEO
    let key = appKey.replace(".ai", "");
    if (products) {
      if (products[key]) {
        products[key] = new Date().toISOString()
      }
      else {
        products = { ...products, [key]: new Date().toISOString() }

      }
    }
    supabase
      .from('profiles')
      .update({ products: products, updated_at: new Date().toISOString() })
      .eq('email', user?.email)
      .select("*")
      .then(res => {

      })
  }

  const updateUser = () => {
    supabase
      .from('profiles')
      .select("*")
      .eq('email', user.email)
      .select()
      .then(res => {
        if (res?.data && res?.data?.length > 0) {
          if (res?.data[0]) {
            setUserData(res.data[0])
            dispatch(setAdmin(res.data[0]?.admin))
          }
          else if (user?.email) {
            setUserData({ email: user.email })
          }
          else {
            setUserData({})
          }
        }
        else {
          setUserData({ email: user.email })
        }
      })
  }
  useEffect(() => {
    if (session && userData && isLoggedIn) {
      updateProducts()
    }
  }, [session, userData])

  useEffect(() => {
    if (user?.email) {
      updateUser()
    }
  }, [user])

  function getDecodedAccessToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch (Error) {
      return 'failed';
    }
  }

  const checkDomain = (domain) => {
    supabase
      .from('domains')
      .select("*")
      .eq('domain', urlSanitization(domain))
      .select()
      .then(res => {
        if (res.data.length === 0) {
          supabase
            .from('domains')
            .insert([
              { 'domain': urlSanitization(domain) }
            ])
            .select()
        }
      })
  }

  const fetchAllDomains = async () => {
    const { data } = await axios.get('https://www.googleapis.com/webmasters/v3/sites', { headers: { Authorization: `Bearer ${token}` } })
    if (data?.siteEntry) {
      return data.siteEntry.map(obj => {
        return ({
          type: obj.siteUrl.split(":")[0],
          siteUrl: urlSanitization(obj.siteUrl.split(":")[1]),
          permissionLevel: obj.permissionLevel,
          originalUrl: obj.siteUrl.split(":")[1]
        })
      })

    }
    else return []
  }

  const checkUserDomains = async () => {
    let domain_access = userData?.domain_access || [];
    try {
      domain_access = await fetchAllDomains()
      let domains = domain_access.map(({ siteUrl }) => urlSanitization(siteUrl))


      domains = domains.filter(obj => obj !== 'google' && obj !== "gmail").reduce((prev, curr) => {
        if (prev.includes(curr)) return prev
        else {
          return [...prev, urlSanitization(curr)]
        }
      }, [])
      domains = domains.sort((a, b) => a.localeCompare(b))
      domain_access = domain_access.sort((a, b) => a.siteUrl.localeCompare(b.siteUrl))
      domains = domains.filter((domain) => {
        checkDomain(domain);
        return domain !== ""
      })

      if (domain_access?.length > 0) {
        let profileObj: any = { ...userData, domain_access, domains };
        dispatch(setProfile(profileObj))
        supabase
          .from('profiles')
          .update(profileObj)
          .select("*")
          .then(res => {
          })
      }
    }
    catch (err) {
      console.log(err)
    }
  }

  const fetchData = async () => {
    if (userData && token) {
      if (!userData.full_name) {
        userData.full_name = userData?.user_matadata?.full_name
      }
      if (!userData?.email) {
        userData.email = user.email
      }


      let products = userData.products
      let key = appKey.replace(".ai", "");
      if (products) {
        if (products[key]) {
          products[key] = new Date().toISOString()
        }
        else {
          products = { ...products, [key]: new Date().toISOString() }

        }
      }
      let profileObj: any = { email: userData.email, products: products };
      profileObj.updated_at = new Date().toISOString()
      if (user) {
        profileObj.user_metadata = user
      }
      dispatch(setProfile(profileObj))
      supabase
        .from('profiles')
        .update(profileObj)
        .eq('email', user?.email)
        .select("*")
        .then(res => {
          if (res.data?.length === 0) {
            supabase
              .from('profiles')
              .insert(profileObj)
              .select("*")
              .then(res => {
              })
          }
        })
    }
  };

  useEffect(() => {
    let profiles;
    if (userData) {
      fetchData();
      profiles = supabase.channel('custom-filter-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles', filter: `email=eq.${user?.email}` },
          (payload) => {
            dispatch(setProfile(payload.new))
          }
        )
        .subscribe()
    }
    return () => {
      if (profiles) {
        profiles.unsubscribe()
      }
    }
  }, [userData])


  return ({ userData, updateUser, checkDomain, fetchAllDomains, getDecodedAccessToken })
}

export default useGoogleUser;