'use client'
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from 'react'
import { reset, selectDomainsInfo, selectIsLoggedIn, selectProfile, selectUser, setAdmin, setDomainInfo, setLoading, setLoggedIn, setProfile, setUser, setUserSettings } from '@/perfect-seo-shared-components/lib/features/User'
import { createClient } from '@/perfect-seo-shared-components/utils/supabase/client'
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { urlSanitization } from '../utils/conversion-utilities';
import { useSession } from 'next-auth/react';
import { SettingsProps } from '../data/types';
import { getSynopsisInfo, populateBulkGSC } from '../services/services';
import { ConsoleView } from "react-device-detect";
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
    if (profile?.email && isLoggedIn) {
      getSettings()
      settingsChannel = supabase.channel('settings-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'settings', filter: `email=eq.${profile?.email}` },
          (payload) => {
            dispatch(setUserSettings(payload.new as SettingsProps))
          }
        )
        .subscribe()
    }
    return () => {
      if (settingsChannel) {
        settingsChannel.unsubscribe()
      }
    }
  }, [profile, isLoggedIn])

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
    }
    else if (session === null) {
      dispatch(reset())
      sessionStorage.removeItem('google-api-token')
    }
    if (sessionData?.access_token) {
      setToken(sessionData.access_token)
      if (sessionData?.token.refresh_token) {
        populateBulkGSC({ access_token: sessionData.access_token, refresh_token: sessionData.token.refresh_token })
        let googleApiObject = JSON.stringify({ access_token: sessionData.access_token, refresh_token: sessionData.token.refresh_token })
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
      .update({ products: products, updated_at: new Date().toISOString() })
      .eq('email', user?.email)
      .select("*")
      .then(res => {
      })
  }




  // update user 
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
            dispatch(setProfile(res.data[0]))
          }
        }
        else if (res?.data?.length === 0) {
          let profileObj: any = { email: user.email }
          if (user.email.includes("atidiv") || user.email.includes('loud.us')) {
            profileObj = { ...profileObj, admin: true }
          }
          supabase
            .from('profiles')
            .insert(profileObj)
            .select("*")
            .then(res => {
              if (!res.error) {
                setUserData(profileObj)
              }
            })
        }
      })
  }

  // update user if email is available 
  useEffect(() => {
    if (user?.email && !profile) {
      updateUser()
    }
  }, [user?.email, profile])

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
  const fetchAllDomains = async () => {
    try {
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
      else return null
    }
    catch (err) {
      console.log(err)
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
  const checkUserDomains = async () => {
    let domain_access = [];
    try {
      domain_access = await fetchAllDomains()
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
          .update(profileObj)
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
          .update({ full_name: user.name })
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