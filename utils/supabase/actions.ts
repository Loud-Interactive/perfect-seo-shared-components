import { createClient } from '@/perfect-seo-shared-components/utils/supabase/components'

export const login = (formData: any) => {
  const supabase = createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.email as string,
    password: formData.password as string,
  }

  return supabase.auth.signInWithPassword(data)

}

export const signup = (formData: any) => {
  const supabase = createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.email as string,
    password: formData.password as string,
  }

  return supabase.auth.signUp(data)
}
export const logout = () => {
  const supabase = createClient()


  return supabase.auth.signOut()
}

export const loginWithGoogle = () => {
  const supabase = createClient();
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.toString()
    }
  })
}