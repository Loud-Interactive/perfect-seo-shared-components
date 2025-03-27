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

const headers = {
  "X-API-Key": process.env.NEXT_PUBLIC_API_KEY,
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

export const generateSynopsis = (domain) => {
  let newDomain = urlSanitization(domain);
  return axiosInstance.get(`https://synopsisperfectai.replit.app/domain/${newDomain}`)
}

// synopsisPerfect APIS 
export const getSynopsisInfo = (domain, regenerate?, server?: boolean) => {
  let newDomain = urlSanitization(domain);
  if (regenerate) {
    newDomain += "?regenerate=true";
  }
  if (server) {
    return axios.get(`https://synopsisperfectai.replit.app/domain/${newDomain}`, { headers: { 'Access-Control-Allow-Origin': '*' } })
      .then((res) => {
        let newRes = res;
        let newData = res.data.reduce((prev, curr) => ({ ...prev, [curr.key]: curr?.value }), {})
        newRes.data = newData;
        return newRes
      })
  }
  else {
    return axiosInstance.get(`https://synopsisperfectai.replit.app/domain/${newDomain}`, { headers: { 'Access-Control-Allow-Origin': '*' } })
      .then((res) => {
        let newRes = res;
        let newData = res.data.reduce((prev, curr) => ({ ...prev, [curr.key]: curr?.value }), {})
        newRes.data = newData;
        return newRes
      })
  }
};

export const updateImpression = (domain: string, obj: any) => {

  return axiosInstance.patch(`https://pp-api.replit.app/pairs/${domain}`, obj, { headers });
};

// check what this endpoint does
export const domainExists = (domain: string) => {
  let newDomain = urlSanitization(domain);
  return axiosInstance.get(`https://pp-api.replit.app/pairs/guid/${newDomain}`);
};

// contentPerfect apis 
export const addIncomingPlanItem = (reqObj: PlanItemProps) => {
  return axiosInstance.post(`${API_URL}/add_incoming_plan_item`, reqObj);
};

export const getPlanStatus = (id: string) => {
  return axiosInstance.get(`${API_URL}/status/${id}`);
};

export const getCompletedPlan = (id: string, server?: boolean) => {
  if (server) {
    return axios.get(`${API_URL}/get_content_plan/${id}`);
  }
  else {
    return axiosInstance.get(`${API_URL}/get_content_plan/${id}`);
  }
};


export const saveContentPlanPost = (reqObj: Request.SaveContentPost) => {
  return axiosInstance.post(`${API_URL}/post_outline`, reqObj);
};

export const generateContentPlanOutline = (
  reqObj: Request.PostOutlineGenerateRequest,
) => {
  return axiosInstance.post('/api/outlines/generate', reqObj);
  // return axiosInstance.post(`${API_URL}/get_outline`, reqObj);
};

export const getPreviousPlans = (domain_name) => {
  return axiosInstance.get(`${API_URL}/incoming_plan_items_by_domain/${domain_name}`);
};

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

export const createPost = (reqBody: Request.GenerateContentPost) => {
  return axiosInstance.post(`https://content-v5.replit.app/generate_content`, reqBody);
};



export function processTsvUrl(url: string) {
  return axiosInstance.post<Request.ProcessTsvUrlResponse>('/process-tsv-url', { url }, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

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

export const regeneratePost = (
  guid, other?
) => {
  let reqObj = {
    content_plan_outline_guid: guid,
  }

  if (other) {
    reqObj = { ...reqObj, ...other }
  }
  return axiosInstance.post(
    `https://content-v5.replit.app/generate_content_from_outline_guid`,
    reqObj
  );
};


export const getPostStatus = (guid: string) => {
  return axiosInstance.get(`https://content-status.replit.app/content/status/${guid}`);
};

export const getLatestStatusByOutlineGUID = (guid: string) => {
  return supabase
    .from('tasks')
    .select('*')
    .eq('content_plan_outline_guid', guid)
    .order('last_updated_at', { ascending: false })
    .limit(1)
}

export const createUserCreditAccount = (email: string) => {
  return axiosInstance.post(
    "https://lucsperfect.replit.app/users/",
    { email, amount: 9000 },
    { headers: headers },
  );
};

export const addUserCredit = (email: string, amount: number) => {
  return axiosInstance.put(
    "https://lucsperfect.replit.app/users/add_credits",
    { email, amount },
    { headers: headers },
  );
};
export const deductUserCredit = (email: string, amount: number) => {
  return axiosInstance.put(
    "https://lucsperfect.replit.app/users/deduct_credits",
    { email, amount },
    { headers: headers },
  );
};

export const deleteUserCreditAccount = (email: string) => {
  return axiosInstance.delete(`https://lucsperfect.replit.app/users/${email}`, { headers: headers });
};

export const checkUserCredits = (email: string) => {
  return axiosInstance.get(`https://lucsperfect.replit.app/users/${email}/credits`, {
    headers: headers,
  });
};

export const getContentPlanOutlines = (guid: string) => {
  return axiosInstance.get(`https://planperfectapi.replit.app/get_content_plan_outlines/${guid}`,);
}

export const fetchOutlineStatus = (guid: string) => {
  return supabase
    .from('content_plan_outline_statuses')
    .select('*')
    .order('timestamp', { ascending: false })
    .eq('outline_guid', guid)
    .then(res => {
      if (res.data) {
        let newData = res.data.sort((a, b) => a.timestamp - b.timestamp);
        res.data = newData;
        return res
      }
      else {
        return res
      }
    })
};
export const fetchOutlineData = (guid: string) => {
  return supabase
    .from('content_plan_outlines')
    .select('*')
    .eq('guid', guid)
};


export const patchContentPlans = (guid: string, data: any) => {
  return axiosInstance.patch(
    `https://planperfectapi.replit.app/update_outline/${guid}`, data
  );
}



export const getBatchStatus = (guids: string[]) => {
  return axiosInstance.post(
    `https://content-status.replit.app/content/status/batch`,
    guids,
  );
};

export const getSpecificPairs = (domain: string, guids: string[]) => {
  return axiosInstance.post(`https://pp-api.replit.app/pairs/${domain}/specific`, guids);
}
export const getPostsByDomain = (domain: string, reqObj?: any) => {
  let startIndex = reqObj?.page === 1 ? 0 : (reqObj.page - 1) * reqObj.page_size;
  let endIndex = startIndex + reqObj.page_size - 1
  if (!!reqObj?.has_live_post_url) {
    if (reqObj?.has_live_post_url === true) {
      return supabase.from('tasks')
        .select('*', { count: 'exact' })
        .eq("client_domain", domain)
        .neq("live_post_url", null)
        .range(startIndex, endIndex)
        .order('created_at', { ascending: false })
    }
    else {
      return supabase.from('tasks')
        .select('*', { count: 'exact' })
        .eq("client_domain", domain)
        .eq("live_post_url", null)
        .range(startIndex, endIndex)
        .order('created_at', { ascending: false })
    }
  }
  else if (reqObj.status) {
    if (reqObj?.status === 'completed') {
      return supabase.from('tasks')
        .select('*', { count: 'exact' })
        .eq("client_domain", domain)
        .eq("status", "Complete")
        .range(startIndex, endIndex)
        .order('created_at', { ascending: false })
    }
    else {
      return supabase.from('tasks')
        .select('*', { count: 'exact' })
        .eq("client_domain", domain)
        .neq("status", "Complete")
        .range(startIndex, endIndex)
        .order('created_at', { ascending: false })
    }
  }
  else {
    return supabase.from('tasks')
      .select('*', { count: 'exact' })
      .eq("client_domain", domain)
      .range(startIndex, endIndex)
      .order('created_at', { ascending: false })
  }
};

export const getPostsByEmail = (email: string, reqObj?: any) => {
  let startIndex = reqObj?.page === 1 ? 0 : (reqObj.page - 1) * reqObj.page_size;
  let endIndex = startIndex + reqObj.page_size - 1
  if (!!reqObj?.has_live_post_url) {
    if (reqObj?.has_live_post_url === true) {
      return supabase.from('tasks')
        .select('*', { count: 'exact' })
        .eq("email", email)
        .neq("live_post_url", null)
        .range(startIndex, endIndex)
        .order('created_at', { ascending: false })
    }
    else {
      return supabase.from('tasks')
        .select('*', { count: 'exact' })
        .eq("email", email)
        .eq("live_post_url", null)
        .range(startIndex, endIndex)
        .order('created_at', { ascending: false })
    }
  }
  else if (reqObj.status) {
    if (reqObj?.status === 'completed') {
      return supabase.from('tasks')
        .select('*', { count: 'exact' })
        .eq("email", email)
        .eq("status", "Complete")
        .range(startIndex, endIndex)
        .order('created_at', { ascending: false })
    }
    else {
      return supabase.from('tasks')
        .select('*', { count: 'exact' })
        .eq("email", email)
        .neq("status", "Complete")
        .range(startIndex, endIndex)
        .order('created_at', { ascending: false })
    }
  }
  else {
    return supabase.from('tasks')
      .select('*', { count: 'exact' })
      .eq("email", email)
      .range(startIndex, endIndex)
      .order('created_at', { ascending: false })
  }
};

export const deleteContentPlan = (guid: string) => {
  return axiosInstance.delete(`${API_URL}/delete_content_plan/${guid}`);
}

export const deleteContentOutline = (content_plan_outline_guid: string) => {
  return axiosInstance.delete(`https://content-status.replit.app/content/delete/${content_plan_outline_guid}`);
}

export const patchOutlineTitle = (guid: string, title: string) => {
  return axiosInstance.patch(`https://planperfectapi.replit.app/update_outline_title/${guid}?new_title=${title.toString()}`, title);
}

export const updateLiveUrl = (guid, url) => {
  let reqObj = {
    content_plan_outline_guid: guid,
    live_post_url: url
  }
  return axiosInstance.post(`/api/post/update-live-url`, reqObj);
}
export const updateHTML = (guid, html) => {
  return axiosInstance.put(`https://content-status.replit.app/content/posts/${guid}/html`, html);
}
export const updateGoogleDoc = (guid, url) => {
  return axiosInstance.put(`https://content-status.replit.app/content/posts/${guid}/google-doc`, url);
}

// pagePerfect apis 
export const submitDomain = (domain: string) => {
  return axiosInstance.get(`https://discoverdomainurls.replit.app/urlcount?domain=${urlSanitization(domain)}`, { headers: { Accept: '*/*' } })
}

export const validatePromoCode = (promoCode, total) => {
  return axiosInstance.get(`
  https://pageperfect.ai/validate_promo_code/${promoCode}/${total.toString()}`)
}

export const sendOptimizeRequest = (request: Request.MetaRequest) => {
  return axiosInstance.post(`https://pageperfectapi.replit.app/optimize_data/`, request);
}

export const getOptimizedData = (guid: string) => {
  return axiosInstance.get(`https://pageperfectapi.replit.app/optimize_data/${guid}`);
}

export const createMetaData = (reqObj: Request.MetaRequest) => {
  return axiosInstance.post(`https://pageperfectapi.replit.app/meta_data/`, reqObj);
}


// factcheckPerfect apis 
export const getFactCheckStatus = (guid: string) => {
  return axiosInstance.get(`https://factcheck-perfectai.replit.app/status/${guid}`);
}

export const postFactCheck = (reqObj) => {
  return axiosInstance.post(`https://factcheck-perfectai.replit.app/fact_check_html`, reqObj, { headers: { "Content-Type": "multipart/form-data" } });
}

export const generateVoicePrompts = (domain) => {
  return axiosInstance.get(`https://voice-perfect-api.replit.app/GenerateVoicePrompt?domain=${urlSanitization(domain)}`)
}

export const saveDetails = (data) => {
  return axiosInstance.post('https://voice-perfect-api.replit.app/SaveUserDetails', data)
}


// Social Perfect apis 
export const getSocialContent = (url: string) => {
  return axiosInstance.post('https://socialperfectapi.replit.app/get-content', { url });
};

export const createSocialPost = async (postData: Request.SocialPostCreate) => {
  return axiosInstance.post('https://socialperfectapi.replit.app/create_post', postData)
};


export const getSocialPost = async (id: string) => {
  return axiosInstance.get(`https://socialperfectapi.replit.app/socialposts/${id}`);

};
export const updateSocialPost = async (reqObj) => {
  return axiosInstance.patch(`https://socialperfectapi.replit.app/socialposts/${reqObj.id || reqObj.uuid}`, reqObj);

};

export const generateSocialPost = async (reqObj: Request.GenerateSocialPostProps) => {
  return axiosInstance.post(`https://socialperfectapi.replit.app/generate_post/${reqObj.uuid}`, reqObj, { headers: { 'Content-Type': 'application/json' } }
  );

}
export const regenerateSocialPost = async (guid, platform) => {
  return axiosInstance.post(`https://socialperfectapi.replit.app/regenerate_post/${guid}/${platform}`
  );
}

export const getOutlinesByContentPlan = async (content_plan_guid: string, paginator?: PaginationRequest) => {
  if (paginator) {
    let startIndex = paginator?.page === 1 ? 0 : (paginator.page - 1) * paginator.page_size;
    let endIndex = startIndex + paginator.page_size - 1
    return supabase.from('content_plan_outlines')
      .select('*', { count: 'exact' })
      .eq("content_plan_guid", content_plan_guid)
      .range(startIndex, endIndex)
      .order('created_at', { ascending: false })
  }
  else {
    return supabase.from('content_plan_outlines')
      .select('*')
      .eq("content_plan_guid", content_plan_guid)
      .order('created_at', { ascending: false })
  }

}

export const getContentPlanOutlinesByDomain = (domain: string, paginator: PaginationRequest) => {
  let startIndex = paginator?.page === 1 ? 0 : (paginator.page - 1) * paginator.page_size;
  let endIndex = startIndex + paginator.page_size - 1
  return supabase.from('content_plan_outlines')
    .select('*', { count: 'exact' })
    .eq("domain", domain)
    .range(startIndex, endIndex)
    .order('created_at', { ascending: false })

}

export const getContentPlanOutlinesByEmail = (email: string, paginator: PaginationRequest) => {
  let startIndex = paginator?.page === 1 ? 0 : (paginator.page - 1) * paginator.page_size;
  let endIndex = startIndex + paginator.page_size - 1
  return supabase.from('content_plan_outlines')
    .select('*', { count: 'exact' })
    .eq("email", email)
    .range(startIndex, endIndex)
    .order('created_at', { ascending: false })
}

export const getContentPlanOutlinesByDomainWithoutPosts = (domain: string, paginator: PaginationRequest) => {
  return axiosInstance.get(`https://planperfectapi.replit.app/get_content_plan_outlines_by_domain/${domain}${parseQueries(paginator)}`);
}

export const getContentPlanOutlinesByEmailWithoutPosts = (email: string, paginator: PaginationRequest) => {
  return axiosInstance.get(`/get_content_plan_outlines_without_posts_by_email/${email}${parseQueries(paginator)}`);
}

export const getContentPlansByEmail = (email: string, paginator: PaginationRequest) => {
  let startIndex = paginator?.page === 1 ? 0 : (paginator.page - 1) * paginator.page_size;
  let endIndex = startIndex + paginator.page_size - 1
  return supabase.from('content_plans')
    .select('*', { count: 'exact' })
    .eq("email", email)
    .range(startIndex, endIndex)
    .order('timestamp', { ascending: false })
}
export const getContentPlansByDomain = (domain: string, paginator: PaginationRequest) => {
  let startIndex = paginator?.page === 1 ? 0 : (paginator.page - 1) * paginator.page_size;
  let endIndex = startIndex + paginator.page_size - 1
  return supabase.from('content_plans')
    .select('*', { count: 'exact' })
    .eq("domain_name", domain)
    .range(startIndex, endIndex)
    .order('timestamp', { ascending: false })
}


export const deleteOutline = (guid: string) => {
  return axiosInstance.delete(`https://planperfectapi.replit.app/delete_outline/${guid}`);
}

export const patchContentPlan = (guid: string, data: any) => {
  return axiosInstance.patch(`https://planperfectapi.replit.app/patch_content_plan/${guid}`, data);
}

export const patchPost = (guid: string, field: string, value: string) => {
  return axiosInstance.patch(`https://content-status.replit.app/content/update/${guid}/field`, { "field": field, "value": value }, { headers: { 'Content-Type': 'application/json' } });
}

export const factCheckByPostGuid = (reqObj: any) => {
  return axiosInstance.post(`https://factcheck-perfectai.replit.app/fact_check_content_by_guid`, reqObj)
}

// GSC and AHREF Reporting 
export const getGSCSearchAnalytics = (reqObj: Request.GSCRequest) => {
  return axiosInstance.get(`https://search-analytics-api-dev456.replit.app/gsc_search_analytics_data${parseQueries(reqObj)}`);
}

export const getAhrefsDomainRating = (reqObj: Request.DomainReportsRequest) => {
  return axiosInstance.get(`https://search-analytics-api-dev456.replit.app/ahrefs_domain_rating${parseQueries(reqObj)}`);
}

export const getAhrefsUrlRating = (reqObj: Request.PageRequest) => {
  return axiosInstance.get(`https://search-analytics-api-dev456.replit.app/ahrefs_url_rating${parseQueries(reqObj)}`);
}
export const getAhrefsKeywords = (reqObj: Request.PageRequest) => {
  return axiosInstance.get(`https://search-analytics-api-dev456.replit.app/ahrefs_keywords${parseQueries(reqObj)}`);
}

export const getGSCLiveURLReport = (reqObj: Request.GSCTotalsRequest) => {
  return axiosInstance.get(`https://search-analytics-api-dev456.replit.app/gsc_benchmarks${parseQueries(reqObj)}`);
}

export const populateBulkGSC = (reqObj) => {
  return axiosInstance.post(`https://gsc-batch-job-dev456.replit.app/trigger_gsc_job`, reqObj);
}

export const regenerateHTML = (reqObj: Request.RegeneratePost) => {
  return axiosInstance.post(`https://content-v5.replit.app/regenerate_html${parseQueries(reqObj)}`, reqObj);
}
export const regenerateHTMLfromDoc = (reqObj: Request.RegeneratePost) => {
  return axiosInstance.post(`https://content-v5.replit.app/regenerate_html_from_outline_guid${parseQueries(reqObj)}`, reqObj);
}

export const getPost = (guid: string) => {
  return supabase.from('tasks').select('*').eq('task_id', guid).order('created_at', { ascending: false })
}

export const getPostStatusFromOutline = (guid: string) => {
  return supabase.from('tasks').select('*').eq('content_plan_outline_guid', guid).order('created_at', { ascending: false })
}