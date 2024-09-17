import { RootState } from '@/perfect-seo-shared-components/lib/store'
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from 'react'
import { reset, setAdmin, setLoading, setLoggedIn, setUser } from '@/perfect-seo-shared-components/lib/features/User'
import { createClient } from '@/perfect-seo-shared-components/utils/supabase/client'
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
const useManageUser = (appKey) => {
  const { user, isLoading } = useSelector((state: RootState) => state);
  const [userData, setUserData] = useState<any>(null)
  const [token, setToken] = useState(null)
  const dispatch = useDispatch();
  const supabase = createClient()

  const updateUser = (user) => {
    supabase
      .from('profiles')
      .select("*")
      .eq('id', user.id)
      .select()
      .then(res => {
        dispatch(setLoading(false))

        if (res?.data && res?.data?.length > 0) {
          if (res?.data[0]) {

            setUserData({ ...user, ...res.data[0] })
            dispatch(setAdmin(res.data[0]?.admin))
          }
        }
      })
  }



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
      .eq('domain', domain)
      .select()
      .then(res => {
        if (res.data.length === 0) {
          console.log("Domain not found")
          supabase
            .from('domains')
            .insert([
              { 'domain': domain }
            ])
            .select()
        }
      })
  }

  useEffect(() => {
    if (userData && token) {


      if (!userData.email) {
        userData.email = user.email
      }
      if (!userData.full_name) {
        userData.full_name = userData?.user_matadata?.full_name
      }
      let domains;
      if (!userData.domains) {
        domains = [userData?.email?.split("@")[1]]
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
        domains = userData.domains
      }

      axios.get('https://www.googleapis.com/webmasters/v3/sites', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          if (res.data.siteEntry) {

            domains = [...domains, ...res.data.siteEntry.map(obj => {
              let domain = obj.siteUrl.split(":")[1]
              checkDomain(domain)
              return domain
            })]
          }
        })
        .catch(err => {
          console.log(err)
        })

      domains = domains.filter(obj => obj !== 'google' && obj !== "gmail")

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

      let profileObj: any = { meta_data: userData, email: userData.email, domains: domains, products: products };
      profileObj.updated_at = new Date().toISOString()
      dispatch(setUser({ ...userData, domains: domains }))
      supabase
        .from('profiles')
        .update(profileObj)
        .eq('id', userData.id)
        .select("*")

    }
  }, [userData, token])

  useEffect(() => {
    if (isLoading !== false) {
      supabase.auth.getUser()
        .then((res) => {
          if (res.data.user === null) {
            dispatch(setLoading(false))
          }
          else if (res.error !== null) {
            dispatch(reset())
          } else {
            dispatch(setLoggedIn(true))
            return updateUser(res.data.user)
          }
        })
    }
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, _session) => {
      localStorage.setItem('supabase.auth.token', _session?.access_token)
      localStorage.setItem('supabase.provider.token', _session?.provider_token)
      if (_session) {
        setToken(_session?.provider_token)
      }
    })
    return () => subscription.unsubscribe()
  }, [])
}

export default useManageUser;