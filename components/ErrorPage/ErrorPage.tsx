'use client'
import { RootState } from "@/perfect-seo-shared-components/lib/store";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import en from '@/assets/en.json'
import { createClient } from "@/perfect-seo-shared-components/utils/supabase/client";
import TypeWriterText from "@/perfect-seo-shared-components/components/TypeWriterText/TypeWriterText";

function ErrorPage({ statusCode, err }) {

  const { user, profile } = useSelector((state: RootState) => state);
  const supabase = createClient()
  useEffect(() => {
    let email;
    try {
      email = localStorage.getItem('email')
    }
    catch (e) {
      email = user?.email || profile?.email
    }
    supabase
      .from('user_history')
      .insert({ email, transaction_data: { ...err }, product: en?.product, type: "Error Page" })
      .select('*')
  }, [err])




  return (
    <div className="strip-padding container-fluid container-xl bg-primary d-flex align-items-center justify-content-center">
      <h2 className="text-white">
        <TypeWriterText string={statusCode
          ? `An error ${statusCode} occurred on server`
          : 'An error occurred on client'} withBlink />
      </h2>
    </div>
  )
}


export default ErrorPage