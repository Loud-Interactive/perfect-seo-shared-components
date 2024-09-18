import { RootState } from '@/perfect-seo-shared-components/lib/store'
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from 'react'
import { reset, setAdmin, setLoading, setLoggedIn, setUser } from '@/perfect-seo-shared-components/lib/features/User'
import { createClient } from '@/perfect-seo-shared-components/utils/supabase/client'
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { urlSanitization } from '../utils/conversion-utilities';
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
      .eq('domain', urlSanitization(domain))
      .select()
      .then(res => {
        if (res.data.length === 0) {
          console.log("Domain not found")
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

    return data.siteEntry.map(obj => {
      return ({
        type: obj.siteUrl.split(":")[0],
        siteUrl: urlSanitization(obj.siteUrl.split(":")[1]),
        permissionLevel: obj.permissionLevel,
        originalUrl: obj.siteUrl.split(":")[1]
      })
    })
  }

  useEffect(() => {
    const fetchData = async () => {
      if (userData && token) {
        if (!userData.email) {
          userData.email = user.email
        }
        if (!userData.full_name) {
          userData.full_name = userData?.user_matadata?.full_name
        }
        let domain_access = await fetchAllDomains()
        if (userData?.domainAccess) {
          domain_access = [...domain_access, ...userData.domainAccess.filter(obj => obj.permissionLevel === "added")]
        }
        let domains = await fetchAllDomains();
        domains = domains.map(obj => urlSanitization(obj.siteUrl))
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

        let profileObj: any = { meta_data: userData, email: userData.email, domains: domains, domain_access: domain_access, products: products };
        profileObj.updated_at = new Date().toISOString()
        dispatch(setUser(userData))
        supabase
          .from('profiles')
          .update(profileObj)
          .eq('id', userData.id)
          .select("*")
          .then(res => {

          })

      }
    };
    if (userData && token) {
      fetchData();
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