'use client'
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from 'react'
import { reset, selectDomainsInfo, selectIsLoggedIn, selectProfile, selectUser, setAdmin, setDomainInfo, setLoading, setLoggedIn, setProfile, setUser, setUserSettings } from '@/perfect-seo-shared-components/lib/features/User'
import { createClient } from '@/perfect-seo-shared-components/utils/supabase/client'
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { urlSanitization } from '../utils/conversion-utilities';
import { signIn, useSession } from 'next-auth/react';
import { SettingsProps } from '../data/types';
import { getSynopsisInfo, populateBulkGSC } from '../services/services';
import en from '@/assets/en.json'
const useGoogleUser = (appKey) => {
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const profile = useSelector(selectProfile)
  const user = useSelector(selectUser)
  const domainsInfo = useSelector(selectDomainsInfo)
  const [token, setToken] = useState(null)
  const [userData, setUserData] = useState<any>(null)
  const dispatch = useDispatch();
  const supabase = createClient()

  const { data: session, status } = useSession()

  const getSettings = () => {
    supabase
      .from('settings')
      .select("*")
      .eq('email', user.email)
      .select()
      .then(res => {
        if (res?.data && res?.data?.length > 0) {
          if (res?.data[0]) {
            dispatch(setUserSettings(res.data[0]))
          }
        }
        else if (res?.data?.length === 0) {
          let settingsObj = { email: user.email }
          supabase
            .from('settings')
            .insert(settingsObj)
            .select("*")
            .then(res => {
              if (!res.error) {

              }
            })
        }
      })
  }


  useEffect(() => {
    let settingsChannel;
    let email = user?.email
    if (email && isLoggedIn) {
      getSettings()
      settingsChannel = supabase.channel('settings-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'settings', filter: `email=eq.${email}` },
          (payload) => {
            console.log(payload)
            if (payload?.new) {
              dispatch(setUserSettings(payload.new as SettingsProps))
            }
          }
        )
        .subscribe()
    }
  }, [user, isLoggedIn])

  useEffect(() => {
    if (session === null) {
      dispatch(setLoggedIn(false))
      dispatch(setLoading(false))
    }
  }, [session])

  //set status based on loading of session
  useEffect(() => {
    switch (status) {
      case 'loading':
        dispatch(setLoading(true));
        break;
      case 'authenticated':
        dispatch(setLoading(false));
        dispatch(setLoggedIn(true));
        break;
      case 'unauthenticated':
        dispatch(reset())
        break;
    }
  }, [status])

  //set status based on loading of session
  useEffect(() => {
    let sessionData: any = session;
    if (session) {
      if (session?.user) {
        dispatch(setLoading(false))
        dispatch(setUser(session.user))
        localStorage.setItem('email', session.user.email)
      }
      supabase
        .from('user_history')
        .insert({ email: session.user.email || user.email || profile.email, transaction_data: session, product: en.product, type: "New Session", action: "INFO" })
        .select('*')
        .then(res => { })
      if (!profile && session?.user?.email) {
        updateUser(session?.user?.email)
      }
    }
    else if (session === null) {
      dispatch(reset())
      sessionStorage.removeItem('google-api-token')
    }
    if (sessionData?.access_token) {
      setToken(sessionData.access_token)
      checkUserDomains(sessionData.access_token)
      let sessionToken = sessionData?.token?.refresh_token || sessionData?.refresh_token
      if (sessionToken) {
        populateBulkGSC({ access_token: sessionData.access_token, refresh_token: sessionToken })
        let googleApiObject = JSON.stringify({ access_token: sessionData.access_token, refresh_token: sessionToken })
        sessionStorage.setItem('google-api-token', googleApiObject)
      }
    }
    else {
      setToken(null)
    }

    if (session && userData && isLoggedIn) {
      updateProducts()
    }
  }, [session])

  //Checks User Domains
  useEffect(() => {
    if (token) {
      checkUserDomains();
    }
  }, [token])

  // updates product use 
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
      .upsert({ products: products, updated_at: new Date().toISOString() })
      .eq('email', user?.email)
      .select("*")
      .then(res => {
      })
  }




  // update user 
  const updateUser = (email?) => {
    supabase
      .from('profiles')
      .select("*")
      .eq('email', email ? email : user?.email || profile?.email)
      .select()
      .then(res => {

        if (res?.data && res?.data?.length > 0) {
          if (res?.data[0]) {
            setUserData(res.data[0])
            dispatch(setAdmin(res.data[0]?.admin))
            dispatch(setProfile(res.data[0]))
            if (res.data[0]?.domain_access?.length <= 0) {
              checkUserDomains();
            }
          }
        }
        else if (res?.data) {
          let profileObj: any = { email: user.email }
          if (user.email.includes("atidiv") || user.email.includes('loud.us')) {
            profileObj = { ...profileObj, admin: true }
          }
          supabase
            .from('profiles')
            .upsert(profileObj)
            .select("*")
            .then(res => {
              checkUserDomains();
              if (!res.error) {
                setUserData(profileObj)
              }
            })
        }
      })
  }

  // update user if email is available 
  useEffect(() => {
    if (user?.email) {
      updateUser(user?.email)
    }
  }, [user?.email])

  // gets decoded token 
  function getDecodedAccessToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch (Error) {
      return 'failed';
    }
  }

  // checks domain to add to loud list 
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

  // pulls all domains from Google 
  const fetchAllDomains = async (manualToken?) => {
    let bearerToken = manualToken || token;
    try {
      const { data } = await axios.get('https://www.googleapis.com/webmasters/v3/sites', { headers: { Authorization: `Bearer ${bearerToken}` } })
      if (data?.siteEntry) {
        supabase
          .from('user_history')
          .insert({ email: session.user.email || user.email || profile.email, transaction_data: data.siteEntry, product: en.product, type: "Check Domains", action: "INFO" })
          .select('*')
          .then(res => { })
        return data.siteEntry.map(obj => {
          return ({
            type: obj.siteUrl.split(":")[0],
            siteUrl: urlSanitization(obj.siteUrl.split(":")[1]),
            permissionLevel: obj.permissionLevel,
            originalUrl: obj.siteUrl.split(":")[1]
          })
        })

      }
      else {
        supabase
          .from('user_history')
          .insert({ email: session.user.email || user.email || profile.email, transaction_data: data, product: en.product, type: "Check Domains - no domains", action: "ERROR" })
          .select('*')
          .then(res => { })
        return null
      }
    }
    catch (err) {
      supabase
        .from('user_history')
        .insert({ email: session.user.email || user.email || profile.email, transaction_data: err, product: en.product, type: "Check Domains - no domains", action: "ERROR" })
        .select('*')
        .then(res => { })
      return null
    }
  }

  const retrieveSynopsisInfo = async (domain) => {
    return getSynopsisInfo(domain, false)
  }
  useEffect(() => {

    if (profile?.domain_access && !domainsInfo) {
      let domains = profile.domain_access.map(({ siteUrl }) => urlSanitization(siteUrl))
      Promise.allSettled(
        domains.map(retrieveSynopsisInfo)).then((results) => {
          let domains = results.map((result: any, index) => {
            return result?.value?.data
          }
          )
          dispatch(setDomainInfo(domains))
        }
        )
    }
  }, [profile?.domain_access, domainsInfo])

  // checks user domains 
  const checkUserDomains = async (token?) => {
    let domain_access = [];
    try {
      domain_access = await fetchAllDomains(token)
      if (domain_access === null) {
        return null;
      }
      let domains = []

      domain_access = domain_access.sort((a, b) => a.siteUrl.localeCompare(b.siteUrl))

      if (domain_access?.length > 0) {
        domains = domain_access.map(({ siteUrl }) => urlSanitization(siteUrl))


        domains = domains.filter(obj => obj !== 'google' && obj !== "gmail").reduce((prev, curr) => {
          if (prev.includes(curr)) return prev
          else {
            return [...prev, urlSanitization(curr)]
          }
        }, [])
        domains = domains?.sort((a, b) => a.localeCompare(b))
        domains = domains.filter((domain) => {
          checkDomain(domain);
          return domain !== ""
        })
        let profileObj: any = { ...userData, domain_access, domains };
        dispatch(setProfile(profileObj))
        supabase
          .from('profiles')
          .upsert(profileObj)
          .eq('email', user?.email || profile?.email)
          .select("*")
          .then(res => {
          })
      }
    }
    catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    let profiles;
    if (userData) {
      if (!profile?.full_name && user?.name) {
        supabase
          .from('profiles')
          .upsert({ full_name: user.name })
          .eq('email', user?.email)
          .select("*")
          .then(res => {
            let profileObj = { ...userData, full_name: user.name }
            dispatch(setProfile(profileObj));
          })
      }
      profiles = supabase.channel('profile-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles', filter: `email=eq.${user?.email}` },
          (payload) => {
            updateUser()
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