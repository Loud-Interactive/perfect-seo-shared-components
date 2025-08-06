'use client'
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from 'react'
import { selectEmail, selectIsLoggedIn, selectProfile, selectUser, setAdmin, setLoading, setProfile, setUserSettings } from '@/perfect-seo-shared-components/lib/features/User'
import { createClient } from '@/perfect-seo-shared-components/utils/supabase/client'
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { urlSanitization } from '../utils/conversion-utilities';
import { useSession } from 'next-auth/react';
import { SettingsProps } from '../data/types';
import en from '@/assets/en.json'
const useGoogleUser = (appKey) => {
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) console.log('🔄 useGoogleUser: Hook initialized');

  const isLoggedIn = useSelector(selectIsLoggedIn)
  const profile = useSelector(selectProfile)
  const user = useSelector(selectUser)
  const email = useSelector(selectEmail)
  const dispatch = useDispatch();
  const supabase = createClient()

  const { data: session }: any = useSession()

  const getSettings = () => {
    if (isDev) console.log('⚙️ useGoogleUser: getSettings called');
    supabase
      .from('settings')
      .select("*")
      .eq('email', user.email)
      .select()
      .then(res => {
        if (isDev) console.log('⚙️ useGoogleUser: getSettings response', res);
        if (res?.data && res?.data?.length > 0) {
          if (res?.data[0]) {
            dispatch(setUserSettings(res.data[0]))
          }
        }
        else if (res?.data?.length === 0) {
          if (isDev) console.log('⚙️ useGoogleUser: Creating new settings for user');
          let settingsObj = { email: user.email }
          supabase
            .from('settings')
            .insert(settingsObj)
            .select("*")
            .then(res => {
              if (isDev) console.log('⚙️ useGoogleUser: Settings created', res);
              if (!res.error) {

              }
            })
        }
      })
  }

  // Pull user settings on login, establish subscription to listen for changes
  useEffect(() => {
    if (isDev) console.log('🔔 useGoogleUser: Main useEffect triggered', { email, isLoggedIn });

    let settingsChannel;
    let profileChannel;
    if (email && isLoggedIn) {
      if (isDev) console.log('🔔 useGoogleUser: Setting up subscriptions and fetching data');

      // retrieve settings
      getSettings()
      settingsChannel = supabase.channel('settings-channel')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'settings', filter: `email=eq.${email}` },
          (payload) => {
            if (isDev) console.log('🔔 useGoogleUser: Settings channel update', payload);
            if (payload?.new) {
              dispatch(setUserSettings(payload.new as SettingsProps))
            }
          }
        )
        .subscribe()
      profileChannel = supabase.channel('profile-channel')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `email=eq.${email}` },
          (payload) => {
            if (isDev) console.log('🔔 useGoogleUser: Profile channel update', payload);
            if (payload?.new) {
              let newProfile: any = payload.new
              dispatch(setAdmin(newProfile?.admin))
              dispatch(setProfile(newProfile))
            }
            dispatch(setProfile(payload.new))
          }
        )
        .subscribe()
      // retrieve profile 
      if (isDev) console.log('👤 useGoogleUser: Fetching profile data');
      supabase
        .from('profiles')
        .select("*")
        .eq('email', email)
        .then(res => {
          if (isDev) console.log('👤 useGoogleUser: Profile fetch response', res);
          if (res?.data && res?.data?.length > 0) {
            let newProfile = res.data[0]
            let products = updateProducts(res?.data[0])
            if (newProfile.full_name !== user?.name) {
              newProfile.full_name = user?.name
            }
            dispatch(setAdmin(res.data[0]?.admin))
            dispatch(setProfile({ ...newProfile, products }))
            if (!newProfile?.domain_access) {
              fetchAllDomains()
            }
          }
          else if (res?.data?.length === 0) {
            let profileObj: any = { email: user.email, full_name: user?.name }
            if (user.email.includes("atidiv") || user.email.includes('loud.us')) {
              profileObj = { ...profileObj, admin: true }
            }
            supabase
              .from('profiles')
              .upsert(profileObj)
              .eq('email', email)
              .select("*")
              .then(res => {
                if (res?.data && res?.data?.length > 0) {
                  if (res?.data[0]) {
                    let newProfile = res.data[0]
                    let products = updateProducts(res?.data[0])
                    dispatch(setAdmin(res.data[0]?.admin))
                    dispatch(setProfile({ ...newProfile, products }))
                    if (!newProfile?.domain_access?.length) {
                      fetchAllDomains()
                    }
                  }
                }
              })
          }
        })
    }
    return () => {
      if (isDev) console.log('🧹 useGoogleUser: Cleaning up subscriptions');
      if (settingsChannel) {
        settingsChannel.unsubscribe()
      }
      if (profileChannel) {
        profileChannel.unsubscribe()
      }
    }
  }, [user, isLoggedIn])

  useEffect(() => {
    if (isDev) console.log('⏳ useGoogleUser: Loading state useEffect', { isLoggedIn, profile: !!profile });
    dispatch(setLoading(!!(isLoggedIn && !profile)))
  }, [isLoggedIn, profile])

  // updates product use 
  const updateProducts = (profile): any => {
    if (isDev) console.log('📦 useGoogleUser: updateProducts called', { profile, appKey });
    let products: any = profile?.products || {}
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
    return products;
  }

  // gets decoded token 
  function getDecodedAccessToken(token: string): any {
    if (isDev) console.log('🔑 useGoogleUser: getDecodedAccessToken called');
    try {
      return jwtDecode(token);
    } catch (Error) {
      if (isDev) console.error('🔑 useGoogleUser: Token decode failed', Error);
      return 'failed';
    }
  }

  // checks domain to add to loud list 
  const checkDomain = (domain) => {
    if (isDev) console.log('🌐 useGoogleUser: checkDomain called', domain);

    supabase
      .from('domains')
      .select("*")
      .eq('domain', urlSanitization(domain))
      .then(res => {
        if (res.data.length === 0) {
          supabase
            .from('domains')
            .insert(
              { 'domain': urlSanitization(domain) }
            )
            .select()
        }
      })
  }

  // pulls all domains from Google 
  const fetchAllDomains = async () => {
    if (isDev) console.log('🌐 useGoogleUser: fetchAllDomains called');
    let bearerToken = session?.token?.access_token
    try {
      const { data } = await axios.get('https://www.googleapis.com/webmasters/v3/sites', { headers: { Authorization: `Bearer ${bearerToken}` } })
      if (isDev) console.log('🌐 useGoogleUser: Domains fetched from Google', data);
      if (data?.siteEntry) {
        let domains = data?.siteEntry
          .map(obj => {
            return ({
              type: obj?.siteUrl.split(":")[0],
              siteUrl: urlSanitization(obj?.siteUrl.split(":")[1]),
              permissionLevel: obj?.permissionLevel,
              originalUrl: obj?.siteUrl.split(":")[1]
            })
          })
          .filter(domain => !!(domain?.siteUrl?.split(".")?.length <= 2))
        supabase
          .from('user_history')
          .insert({ email: email, transaction_data: { domains, url: window?.location?.href }, product: en.product, type: "Check Domains", action: "INFO" })
          .select('*')

        supabase
          .from('profiles')
          .update({ email: email, domain_access: domains, domains: domains?.map((obj) => obj.siteUrl) })
          .eq('email', email)
          .select('*')

          .then(res => {
            dispatch(setProfile({ ...profile, domain_access: domains, domains: domains?.map((obj) => obj.siteUrl) }))
          }
          )

        return domains


      }
    } catch (error) {
      if (isDev) console.error('🌐 useGoogleUser: fetchAllDomains error', error);
      const currentUrl = window.location.href;
      supabase
        .from('user_history')
        .insert({ email: session.user.email || user.email || profile.email, transaction_data: { error, url: currentUrl, email }, product: en.product, type: "Check Domains", action: "Error" })
        .select('*')
    }
  }

  if (isDev) console.log('🔄 useGoogleUser: Hook render complete');

  return ({ checkDomain, fetchAllDomains, getDecodedAccessToken })
}

export default useGoogleUser;