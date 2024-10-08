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

  // Add a response interceptor
  axios.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    supabase
      .from('user_history')
      .insert({ email: user?.email || profile?.email, transaction_data: { ...response, dev_code: 'text' }, product: en.product })
      .select('*')
    return response;
  }, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    supabase
      .from('user_history')
      .insert({ email: user?.email || profile?.email, transaction_data: error, product: en.product })
      .select('*')

    return Promise.reject(error);
  });

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
        dispatch(setUser(session.user))
      }
    }
    if (sessionData?.access_token) {
      setToken(sessionData.access_token)
    }
  }, [status])

  const updateProducts = () => {
    let products = { ...userData.products }
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
      .update({ products: products })
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
      return null;
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

  const fetchData = async () => {
    if (userData && token) {
      if (!userData.full_name) {
        userData.full_name = userData?.user_matadata?.full_name
      }
      if (!userData?.email) {
        userData.email = user.email
      }
      let domain_access = userData?.domain_access || [];
      try {
        domain_access = await fetchAllDomains()
      }
      catch (err) {
        console.log(err)
      }
      let domains = domain_access.map(({ siteUrl }) => urlSanitization(siteUrl))
      if (!userData.domains) {
        domains = [...domains, userData?.email?.split("@")[1]]
        if (userData?.user_metadata?.custom_claims) {
          let customClaims = Object.keys(userData?.user_metadata.custom_claims).reduce((prev, curr) => {
            if (userData?.user_metadata?.custom_claims[curr] !== domains[0]) {
              return [...prev, userData?.user_metadata?.custom_claims[curr]]
            }
            else return prev
          }, [])
          domains = [...domains, ...customClaims]
        }

      }
      else {
        domains = [...domains, ...userData.domains.map(obj => urlSanitization(obj))]
      }

      domains = domains.filter(obj => obj !== 'google' && obj !== "gmail").reduce((prev, curr) => {
        if (prev.includes(curr)) return prev
        else {
          return [...prev, urlSanitization(curr)]
        }
      }, [])
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
      domains = domains.sort((a, b) => a.localeCompare(b))
      domain_access = domain_access.sort((a, b) => a.siteUrl.localeCompare(b.siteUrl))
      domains = domains.filter((domain) => {
        checkDomain(domain);
        return domain !== ""
      })
      let profileObj: any = { email: userData.email, domains: domains, domain_access: domain_access, products: products };
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