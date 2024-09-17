import { RootState } from '@/perfect-seo-shared-components/lib/store'
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from 'react'
import { reset, setAdmin, setLoading, setLoggedIn, setUser } from '@/perfect-seo-shared-components/lib/features/User'
import { createClient } from '@/perfect-seo-shared-components/utils/supabase/client'
import { jwtDecode } from 'jwt-decode';
const useManageUser = (appKey) => {
  const { user, isLoading } = useSelector((state: RootState) => state);
  const [userData, setUserData] = useState<any>(null)

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
  useEffect(() => {



  }, [])


  useEffect(() => {
    if (userData) {
      let session;
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, _session) => {
        localStorage.setItem('supabase.auth.token', _session?.access_token)
        localStorage.setItem('supabase.provider.token', _session?.provider_token)
        session = _session
      })
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
      dispatch(setUser({ ...userData, domains: domains, session: session }))
      supabase
        .from('profiles')
        .update(profileObj)
        .eq('id', userData.id)
        .select("*")

    }
    return () => subscription.unsubscribe()
  }, [userData])

  useEffect(() => {
    if (isLoading !== false) {
      let jwt = localStorage.getItem('supabase.auth.token')
      supabase.auth.getUser(jwt)
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
  }, [])
}

export default useManageUser;