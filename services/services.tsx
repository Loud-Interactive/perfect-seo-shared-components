import axiosInstance from "@/perfect-seo-shared-components/utils/axiosInstance";
import * as Request from "@/perfect-seo-shared-components/data/requestTypes";
import { urlSanitization } from "@/perfect-seo-shared-components/utils/conversion-utilities";
import axios from "axios";
import { PaginationRequest } from "@/perfect-seo-shared-components/data/types";
import { createClient } from "../utils/supabase/client";
export interface PlanItemProps {
  brand_name: string;
  domain_name: string;
  email: string;
  entity_voice?: string;
  inspiration_url_1?: string;
  inspiration_url_2?: string;
  inspiration_url_3?: string;
  priority1?: "high" | "medium" | "low";
  priority2?: "high" | "medium" | "low";
  priority3?: "high" | "medium" | "low";
  target_keyword?: string;
}

const supabase = createClient();

const API_URL = "https://planperfectapi.replit.app";

const NEW_CONTENT_API_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/api`
const headers = {
  "X-API-Key": process.env.NEXT_PUBLIC_API_KEY,
  "Content-Type": "application/json",
};
const newContentAPIHeader = {
  "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
};

const parseQueries = (obj: object) => {
  return Object.keys(obj).reduce(
    (prev, curr, i) => {
      if (i === Object.keys(obj).length - 1) {
        return prev + curr + "=" + obj[curr]
      }
      else {
        return prev + curr + "=" + obj[curr] + "&"
      }
    },
    "?",
  );
};

// UNUSED SERVICE - No references found in contentPerfect app
export const generateSynopsis = (domain) => {
  let newDomain = urlSanitization(domain);
  return axiosInstance.get(`https://synopsisperfectai.replit.app/domain/${newDomain}`)
}

// used by: contentPerfect
export const getSynopsisInfo = (domain) => {
  return supabase
    .from('pairs') // Replace with your actual table name
    .select('key, value, last_updated')
    .eq('domain', domain)
    .order('last_updated', { ascending: false })
    .then((res) => {
      if (res?.data.length === 0) {
        // Handle case where no data is found
        return { data: [], error: { message: 'No data found for the provided domain' } };
      }
      const result: any = res.data.reduce((acc, { key, value }) => {
        if (!acc[key]) {
          acc[key] = value;
        }
        return acc;
      }, {});


      return { ...res, data: [result] }
    })

};

// used by: contentPerfect
export const updateImpression = (domain: string, obj: any) => {
  let newData = Object.keys(obj).reduce((prev, curr) => {
    let newObj = { domain: domain, key: curr, value: obj[curr] }
    return [...prev, newObj]
  }, [])

  return supabase
    .from('pairs')
    .upsert(newData)
    .eq('domain', domain)
    .select('*')
    .then((res) => {
      let newRes = res;
      newRes.data = [res.data.reduce((prev, curr) => ({ ...prev, [curr.key]: curr.value }), {})]
      return newRes
    })


};


// used by: contentPerfect
export const addIncomingPlanItem = (reqObj: PlanItemProps) => {
  return axiosInstance.post(`${API_URL}/add_incoming_plan_item`, reqObj);
};

// used by: contentPerfect
export const getPlanStatus = (id: string) => {
  return axiosInstance.get(`${API_URL}/status/${id}`);
};

// used by: contentPerfect
export const getCompletedPlan = (id: string, server?: boolean) => {
  if (server) {
    return axios.get(`${API_URL}/get_content_plan/${id}`);
  }
  else {
    return axiosInstance.get(`${API_URL}/get_content_plan/${id}`);
  }
};


// used by: contentPerfect
export const saveContentPlanPost = (reqObj: Request.SaveContentPost) => {
  return axiosInstance.post(`${API_URL}/post_outline`, reqObj);
};

// used by: contentPerfect
export const generateContentPlanOutline = (
  reqObj: Request.PostOutlineGenerateRequest,
) => {
  return axiosInstance.post('/api/outlines/generate', reqObj);
  // return axiosInstance.post(`${API_URL}/get_outline`, reqObj);
};

// used by: contentPerfect
export const generateSchema = (content_plan_outline_guid) => {
  return axiosInstance.post('/api/post/generate-schema', { content_plan_outline_guid });
}

// used by: contentPerfect
export const generateImagePrompt = (content_plan_outline_guid) => {
  return axiosInstance.post('/api/post/generate-image-prompt', { content_plan_outline_guid });
}

// used by: contentPerfect
export const updateContentPlan = (guid, reqObj, other?) => {
  let reqBody: any = {
    guid,
    content_plan_table: reqObj,
  }
  if (other) {
    reqBody = { ...other, ...reqBody }
    delete reqBody.content_plan_json
    delete reqBody?.content_plan
  }

  return axiosInstance.post(`${API_URL}/update_content_plan`, reqBody);
};

// used by: contentPerfect
export const createPost = (reqObj: Request.GenerateContentPost) => {
  // return axiosInstance.post(
  //   `/api/post/generate-content-from-outline-guid`,
  //   reqObj
  // );
  return axiosInstance.post(
    `https://content-v5.replit.app/generate_content_from_outline_guid`,
    reqObj
  );
};

// UNUSED SERVICE - No references found in contentPerfect app
export function processTsvUrl(url: string) {
  return axiosInstance.post<Request.ProcessTsvUrlResponse>('/process-tsv-url', { url }, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

// used by: contentPerfect
export const regenerateOutline = (
  content_plan_outline_guid,
  other?
) => {
  let reqObj: any = {
    guid: content_plan_outline_guid,
  }

  if (other) {
    reqObj = { ...reqObj, ...other }
  }
  if (reqObj?.domain) {
    reqObj.client_domain = reqObj?.domain
    delete reqObj?.domain
  }
  return axiosInstance.post(
    `https://planperfectapi.replit.app/regenerate_outline`,
    reqObj
  );
};

// used by: contentPerfect
export const regeneratePost = (
  guid, other?
) => {
  let reqObj = {
    content_plan_outline_guid: guid,
  }

  if (other) {
    reqObj = { ...reqObj, ...other }
  }
  // return axiosInstance.post(
  //   `/api/post/generate-content-from-outline-guid`,
  //   reqObj
  // );
  return axiosInstance.post(
    `https://content-v5.replit.app/generate_content_from_outline_guid`,
    reqObj
  );
};


// used by: contentPerfect
export const getPostStatus = (guid: string) => {
  return axiosInstance.get(`${NEW_CONTENT_API_URL}/content/status/${guid}`, { headers: newContentAPIHeader });
};

// used by: contentPerfect
export const getLatestStatusByOutlineGUID = (guid: string) => {
  return supabase
    .from('tasks')
    .select('*')
    .eq('content_plan_outline_guid', guid)
    .order('last_updated_at', { ascending: false })
}

// used by: contentPerfect
export const createUserCreditAccount = (email: string) => {
  return axiosInstance.post(
    "https://lucsperfect.replit.app/users/",
    { email, amount: 9000 },
    { headers: headers },
  );
};

// used by: contentPerfect
export const addUserCredit = (email: string, amount: number) => {
  return axiosInstance.put(
    "https://lucsperfect.replit.app/users/add_credits",
    { email, amount },
    { headers: headers },
  );
};
// UNUSED SERVICE - No references found in contentPerfect app
export const deductUserCredit = (email: string, amount: number) => {
  return axiosInstance.put(
    "https://lucsperfect.replit.app/users/deduct_credits",
    { email, amount },
    { headers: headers },
  );
};

// UNUSED SERVICE - No references found in contentPerfect app
export const deleteUserCreditAccount = (email: string) => {
  return axiosInstance.delete(`https://lucsperfect.replit.app/users/${email}`, { headers: headers });
};

// used by: contentPerfect
export const checkUserCredits = (email: string) => {
  return axiosInstance.get(`https://lucsperfect.replit.app/users/${email}/credits`, {
    headers: headers,
  });
};

// used by: contentPerfect
export const fetchOutlineStatus = (guid: string) => {
  return supabase
    .from('content_plan_outline_statuses')
    .select('*')
    .order('timestamp', { ascending: false })
    .eq('outline_guid', guid)
};
// used by: contentPerfect
export const fetchOutlineData = (guid: string) => {
  return supabase
    .from('content_plan_outlines')
    .select('*')
    .eq('guid', guid)
};


// used by: contentPerfect
export const getBatchStatus = (guids: string[]) => {
  return axiosInstance.post(
    `${NEW_CONTENT_API_URL}/content/status/batch`,
    guids,
    { headers: newContentAPIHeader });
};


// used by: contentPerfect
export const getPostsByDomain = (domain: string, reqObj?: any) => {
  const startIndex = reqObj?.page === 1 ? 0 : (reqObj.page - 1) * reqObj.page_size;
  const endIndex = startIndex + reqObj.page_size - 1;

  const baseQuery = supabase
    .from('tasks')
    .select('*', { count: 'exact' })
    .eq("client_domain", domain)
    .neq("is_deleted", true)
    .range(startIndex, endIndex)
    .order('last_updated_at', { ascending: false });

  if (reqObj?.has_live_post_url !== undefined) {
    if (reqObj.has_live_post_url === true) {
      return baseQuery.neq("live_post_url", null);
    } else {
      return baseQuery.is("live_post_url", null);
    }
  } else if (reqObj?.status) {
    if (reqObj.status === 'completed') {
      return baseQuery.eq("status", "Complete").is("live_post_url", null);
    } else {
      return baseQuery.neq("status", "Complete");
    }
  } else {
    return baseQuery;
  }
};

// used by: contentPerfect
export const getPostsByEmail = (email: string, reqObj?: any) => {
  const startIndex = reqObj?.page === 1 ? 0 : (reqObj.page - 1) * reqObj.page_size;
  const endIndex = startIndex + reqObj.page_size - 1;

  const baseQuery = supabase
    .from('tasks')
    .select('*', { count: 'exact' })
    .eq("email", email)
    .neq("is_deleted", true)
    .range(startIndex, endIndex)
    .order('last_updated_at', { ascending: false });

  if (reqObj?.has_live_post_url !== undefined) {
    if (reqObj.has_live_post_url === true) {
      return baseQuery.neq("live_post_url", null);
    } else {
      return baseQuery.is("live_post_url", null);
    }
  } else if (reqObj?.status) {
    if (reqObj.status === 'completed') {
      return baseQuery.eq("status", "Complete").is("live_post_url", null);
    } else {
      return baseQuery.neq("status", "Complete");
    }
  } else {
    return baseQuery;
  }
};

// used by: contentPerfect
export const deleteContentPlan = (guid: string) => {
  return axiosInstance.delete(`${API_URL}/delete_content_plan/${guid}`);
}

// used by: contentPerfect
export const deletePost = (task_guid: string) => {
  return supabase.from('tasks')
    .update({ is_deleted: true })
    .eq("task_id", task_guid)
    .select('*')
  return axiosInstance.delete(`${NEW_CONTENT_API_URL}/content/delete/${task_guid}`, { headers: newContentAPIHeader });
}

// used by: contentPerfect
export const updateLiveUrl = (guid, url) => {
  let reqObj = {
    content_plan_outline_guid: guid,
    live_post_url: url || ''
  }
  return axiosInstance.post(`/api/post/update-live-url`, reqObj);
}

// factcheckPerfect apis 
// used by: contentPerfect
export const getFactCheckStatus = (guid: string) => {
  return axiosInstance.get(`https://factcheck-perfectai.replit.app/status/${guid}`);
}

// used by: contentPerfect
export const postFactCheck = (reqObj) => {
  return axiosInstance.post(`https://factcheck-perfectai.replit.app/fact_check_html`, reqObj, { headers: { "Content-Type": "multipart/form-data" } });
}

// UNUSED SERVICE - No references found in contentPerfect app
export const generateVoicePrompts = (domain) => {
  return axiosInstance.get(`https://voice-perfect-api.replit.app/GenerateVoicePrompt?domain=${urlSanitization(domain)}`)
}

// UNUSED SERVICE - No references found in contentPerfect app
export const saveDetails = (data) => {
  return axiosInstance.post('https://voice-perfect-api.replit.app/SaveUserDetails', data)
}


// Social Perfect apis 
// UNUSED SERVICE - No references found in contentPerfect app
export const getSocialContent = (url: string) => {
  return axiosInstance.post('https://socialperfectapi.replit.app/get-content', { url });
};

// UNUSED SERVICE - No references found in contentPerfect app
export const createSocialPost = async (postData: Request.SocialPostCreate) => {
  return axiosInstance.post('https://socialperfectapi.replit.app/create_post', postData)
};


// UNUSED SERVICE - No references found in contentPerfect app
export const getSocialPost = async (id: string) => {
  return axiosInstance.get(`https://socialperfectapi.replit.app/socialposts/${id}`);

};
// UNUSED SERVICE - No references found in contentPerfect app
export const updateSocialPost = async (reqObj) => {
  return axiosInstance.patch(`https://socialperfectapi.replit.app/socialposts/${reqObj.id || reqObj.uuid}`, reqObj);

};

// UNUSED SERVICE - No references found in contentPerfect app
export const generateSocialPost = async (reqObj: Request.GenerateSocialPostProps) => {
  return axiosInstance.post(`https://socialperfectapi.replit.app/generate_post/${reqObj.uuid}`, reqObj, { headers: { 'Content-Type': 'application/json' } }
  );

}
// UNUSED SERVICE - No references found in contentPerfect app
export const regenerateSocialPost = async (guid, platform) => {
  return axiosInstance.post(`https://socialperfectapi.replit.app/regenerate_post/${guid}/${platform}`
  );
}

// used by: contentPerfect
export const getOutlinesByContentPlan = async (content_plan_guid: string, paginator?: PaginationRequest) => {
  if (paginator) {
    let startIndex = paginator?.page === 1 ? 0 : (paginator.page - 1) * paginator.page_size;
    let endIndex = startIndex + paginator.page_size - 1
    return supabase.from('content_plan_outlines')
      .select('*', { count: 'exact' })
      .eq("content_plan_guid", content_plan_guid)
      .range(startIndex, endIndex)
      .order('updated_at', { ascending: false })
  }
  else {
    return supabase.from('content_plan_outlines')
      .select('*')
      .eq("content_plan_guid", content_plan_guid)
      .order('updated_at', { ascending: false })
  }

}
// completed
// used by: contentPerfect
export const getContentPlanOutlinesByDomain = (domain: string, paginator: PaginationRequest, status?: string) => {
  let startIndex = paginator?.page === 1 ? 0 : (paginator.page - 1) * paginator.page_size;
  let endIndex = startIndex + paginator.page_size - 1
  const baseQuery = supabase.from('content_plan_outlines')
    .select('*', { count: 'exact' })
    .eq("domain", domain)
    .range(startIndex, endIndex)
    .neq("is_deleted", true)
    .order('created_at', { ascending: false })

  if (!!status) {
    switch (status) {
      case 'completed':
        return baseQuery.eq("status", "completed")
      case 'in-progress':
        return baseQuery.neq("status", "completed")
      case 'error':
        return baseQuery.like('status', '%err%')
      default:
        return baseQuery.eq("status", status)
    }
  }
  else return baseQuery
}

// used by: contentPerfect
export const getContentPlanOutlinesByEmail = (email: string, paginator: PaginationRequest, status?: string) => {
  let startIndex = paginator?.page === 1 ? 0 : (paginator.page - 1) * paginator.page_size;
  let endIndex = startIndex + paginator.page_size - 1
  if (status) {
    console.log("Status provided:", status);
  }
  const baseQuery = supabase.from('content_plan_outlines')
    .select('*', { count: 'exact' })
    .eq("email", email)
    .neq("is_deleted", true)
    .range(startIndex, endIndex)
    .order('created_at', { ascending: false })
  if (status) {
    switch (status) {
      case 'completed':
        return baseQuery.eq("status", "completed")
      case 'in-progress':
        return baseQuery.neq("status", "completed")
      case 'failed':
        return baseQuery.like('status', '%fail%')
      default:
        return baseQuery.eq("status", status)
    }
  }
  else return baseQuery
}

// used by: contentPerfect
export const getContentPlansByEmail = (email: string, paginator: PaginationRequest) => {
  let startIndex = paginator?.page === 1 ? 0 : (paginator.page - 1) * paginator.page_size;
  let endIndex = startIndex + paginator.page_size - 1
  return supabase.from('content_plans')
    .select('*', { count: 'exact' })
    .eq("email", email)
    .range(startIndex, endIndex)
    .order('timestamp', { ascending: false })
}
// used by: contentPerfect
export const getContentPlansByDomain = (domain: string, paginator: PaginationRequest) => {
  let startIndex = paginator?.page === 1 ? 0 : (paginator.page - 1) * paginator.page_size;
  let endIndex = startIndex + paginator.page_size - 1
  return supabase.from('content_plans')
    .select('*', { count: 'exact' })
    .eq("domain_name", domain)
    .range(startIndex, endIndex)
    .order('timestamp', { ascending: false })
}


// used by: contentPerfect
export const deleteOutline = (guid: string) => {
  return supabase.from('content_plan_outlines')
    .update({ is_deleted: true })
    .eq("guid", guid)
    .select('*')

  return axiosInstance.delete(`https://planperfectapi.replit.app/delete_outline/${guid}`);
}

// used by: contentPerfect
export const patchPost = (guid: string, field: string, value: string) => {
  return axiosInstance.patch(`${NEW_CONTENT_API_URL}/content/update/${guid}/field`, { "field": field, "value": value }, { headers: { 'Content-Type': 'application/json' } });
}

// used by: contentPerfect
export const factCheckByPostGuid = (reqObj: any) => {
  return axiosInstance.post(`https://factcheck-perfectai.replit.app/fact_check_content_by_guid`, reqObj)
}

// GSC and AHREF Reporting 
// used by: contentPerfect
export const getGSCSearchAnalytics = (reqObj: Request.GSCRequest) => {
  return axiosInstance.get(`https://search-analytics-api-dev456.replit.app/gsc_search_analytics_data${parseQueries(reqObj)}`);
}

// used by: contentPerfect
export const getAhrefsDomainRating = (reqObj: Request.DomainReportsRequest) => {
  return axiosInstance.get(`https://search-analytics-api-dev456.replit.app/ahrefs_domain_rating${parseQueries(reqObj)}`);
}

// used by: contentPerfect
export const getAhrefsUrlRating = (reqObj: Request.PageRequest) => {
  return axiosInstance.get(`https://search-analytics-api-dev456.replit.app/ahrefs_url_rating${parseQueries(reqObj)}`);
}

// used by: contentPerfect
export const getGSCLiveURLReport = (reqObj: Request.GSCTotalsRequest) => {
  return axiosInstance.get(`https://search-analytics-api-dev456.replit.app/gsc_benchmarks${parseQueries(reqObj)}`);
}

// used by: contentPerfect
export const populateBulkGSC = (reqObj) => {
  return axiosInstance.post(`https://gsc-batch-job-dev456.replit.app/trigger_gsc_job`, reqObj);
}

// used by: contentPerfect
export const regenerateHTML = (reqObj: Request.RegeneratePost) => {
  // return axiosInstance.post(`/api/post/regenerate-html${parseQueries(reqObj)}`, reqObj);
  return axiosInstance.post(`https://content-v5.replit.app/regenerate_html${parseQueries(reqObj)}`, reqObj);
}
// used by: contentPerfect
export const regenerateHTMLfromDoc = (reqObj: Request.RegeneratePost) => {
  // return axiosInstance.post(`/api/post/regenerate-html-from-outline-guid${parseQueries(reqObj)}`, reqObj);
  return axiosInstance.post(`https://content-v5.replit.app/regenerate_html_from_outline_guid${parseQueries(reqObj)}`, reqObj);
}

// used by: contentPerfect
export const getPost = (guid: string) => {
  return supabase.from('tasks')
    .select('*').eq('task_id', guid).neq("is_deleted", true).order('created_at', { ascending: false }).single()
}

// used by: contentPerfect
export const getPostStatusFromOutline = (guid: string) => {
  return supabase.from('tasks')
    .select('*').eq('content_plan_outline_guid', guid).neq("is_deleted", true).order('created_at', { ascending: false })
}

// used by: contentPerfect
export const publishToWordPress = async (guid: string) => {
  return axiosInstance.post('/api/post/wordpress-publish', { content_plan_outline_guid: guid })
}

// used by: contentPerfect
export const getContentPlanChildren = async (guid: string) => {
  return axiosInstance.post(`/api/content-plan/get-child-content`, { content_plan_guid: guid });
}

// UNUSED SERVICE - No references found in contentPerfect app
export const getDomains = async (domains?: string[], hidden?: boolean | null, blocked?: boolean | null, paginator?: PaginationRequest) => {
  if (paginator) {
    let startIndex = paginator?.page === 1 ? 0 : (paginator.page - 1) * paginator.page_size;
    let endIndex = startIndex + paginator.page_size - 1

    let query = supabase.from('domains')
      .select('*', { count: 'exact' })
      .range(startIndex, endIndex)
      .order('domain', { ascending: true })
    if (blocked === true) {
      query = query.eq('blocked', true)
    }
    else {
      query = query.eq('blocked', false)
    }

    if (domains && domains.length > 0) {
      query = query.in('domain', domains)
    }

    if (hidden !== null && hidden !== undefined) {
      query = query.eq('hidden', hidden)
    }

    return query
  }
  else {
    let query = supabase.from('domains')
      .select('*')
      .order('domain', { ascending: true })

    if (domains && domains.length > 0) {
      query = query.in('domain', domains)
    }

    if (hidden !== null && hidden !== undefined) {
      query = query.eq('hidden', hidden)
    }

    return query
  }
}

/**
 * Store or update CSS file in Supabase storage via API route (uses admin Supabase client)
 * @param domain - The domain name to use as the filename
 * @param cssContent - The CSS content from post_style_tag_main field
 * @returns Promise with the result of the file upload/update operation
 */
// UNUSED SERVICE - No references found in contentPerfect app
export const storeCSSFile = async (domain: string, cssContent: string) => {
  console.log('🎨 [storeCSSFile] Starting CSS file storage via API route');
  console.log('🎨 [storeCSSFile] Domain:', domain);
  console.log('🎨 [storeCSSFile] CSS content length:', cssContent?.length || 0, 'characters');

  try {
    const response = await fetch('/api/store-css', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domain,
        cssContent
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('🎨 [storeCSSFile] ❌ API request failed:', result.error?.message);
      return { data: null, error: result.error };
    }

    console.log('🎨 [storeCSSFile] ✅ API request successful:', result.data?.action);

    // Return the response following the same pattern as other services
    return {
      data: result.data,
      error: result.error
    };
  } catch (error) {
    console.error('🎨 [storeCSSFile] ❌ Network error:', error);
    return { data: null, error: { message: 'Network error: ' + error.message } };
  }
};

// used by: contentPerfect
export const checkDomainCSSFile = async (domain: string) => {
  console.log('🎨 [checkDomainCSSFile] Checking CSS file existence for domain:', domain);
  return axios.post('/api/check-css', { domain });
};