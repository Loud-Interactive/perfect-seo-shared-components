import axios from "axios";
import * as Request from "@/perfect-seo-shared-components/data/requestTypes";
import { urlSanitization } from "@/perfect-seo-shared-components/utils/conversion-utilities";
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


const API_URL = "https://planperfectapi.replit.app";

const headers = {
  "X-API-Key": process.env.NEXT_PUBLIC_API_KEY,
  "Content-Type": "application/json",
};

const parseQueries = (obj: object) => {
  return Object.keys(obj).reduce(
    (prev, curr) => prev + curr + "=" + obj[curr] + "&",
    "?",
  );
};

// synopsisPerfect APIS 
export const getSynopsisInfo = (domain, regenerate?) => {
  let newDomain = urlSanitization(domain);
  if (regenerate) {
    newDomain += "?regenerate=true";
  }
  return axios.get(`https://pp-api.replit.app/pairs/${newDomain}`, { headers: { 'Access-Control-Allow-Origin': '*' } });
};

export const updateImpression = (domain: string, obj: Object) => {
  let reqObj = {
    domain: domain,
    key_value_pairs: obj,
  };
  return axios.post("https://pp-api.replit.app/pairs", reqObj, { headers });
};

// check what this endpoint does
export const domainExists = (domain: string) => {
  let newDomain = urlSanitization(domain);
  return axios.get(`https://pp-api.replit.app/pairs/guid/${newDomain}`);
};

// contentPerfect apis 
export const addIncomingPlanItem = (reqObj: PlanItemProps) => {
  return axios.post(`${API_URL}/add_incoming_plan_item`, reqObj);
};

export const getPlanStatus = (id: string) => {
  return axios.get(`${API_URL}/status/${id}`);
};

export const getCompletedPlan = (id: string) => {
  return axios.get(`${API_URL}/get_content_plan/${id}`);
};

export const getContentPlanPost = (reqObj: Request.ContentPlanPostRequest) => {
  return axios.post(`${API_URL}/get_content_plan_post`, reqObj);
};

export const saveContentPlanPost = (reqObj: Request.SaveContentPost) => {
  return axios.post(`${API_URL}/post_outline`, reqObj);
};

export const getContentPlanOutline = (
  reqObj: Request.GetPostOutlineRequest,
) => {
  return axios.get(
    `${API_URL}/get_full_outline/${reqObj.content_plan_guid}/${reqObj.post_title}/${reqObj.client_domain}`,
  );
};

export const generateContentPlanOutline = (
  reqObj: Request.GetPostOutlineRequest,
) => {
  return axios.post(`${API_URL}/get_outline`, reqObj);
};

export const getPreviousPlans = (domain_name) => {
  return axios.get(`${API_URL}/incoming_plan_items_by_domain/${domain_name}`);
};

export const updateContentPlan = (guid, reqObj) => {
  return axios.post(`${API_URL}/update_content_plan`, {
    guid,
    content_plan_table: reqObj,
  });
};

export const createPost = (reqBody: Request.GenerateContentPost) => {
  return axios.post(`https://content-v5.replit.app/generate_content`, reqBody);
};

export const regenerateOutline = (
  content_plan_guid,
  post_title,
  client_domain,
  client_name,
) => {
  return axios.post(
    `${API_URL}/regenerate_outline`,
    {
      content_plan_guid: content_plan_guid,
      post_title: post_title,
      client_domain: client_domain,
      client_name: client_name,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
};


export const getPostStatus = (guid: string) => {
  return axios.get(`https://content-status.replit.app/content/status/${guid}`);
};

export const createUserCreditAccount = (email: string) => {
  return axios.post(
    "https://lucsperfect.replit.app/users/",
    { email, amount: 9000 },
    { headers: headers },
  );
};

export const addUserCredit = (email: string, amount: number) => {
  return axios.put(
    "https://lucsperfect.replit.app/users/add_credits",
    { email, amount },
    { headers: headers },
  );
};
export const deductUserCredit = (email: string, amount: number) => {
  return axios.put(
    "https://lucsperfect.replit.app/users/deduct_credits",
    { email, amount },
    { headers: headers },
  );
};

export const deleteUserCreditAccount = (email: string) => {
  return axios.delete(`https://lucsperfect.replit.app/users/${email}`, { headers: headers });
};

export const checkUserCredits = (email: string) => {
  return axios.get(`https://lucsperfect.replit.app/users/${email}/credits`, {
    headers: headers,
  });
};

export const fetchOutlineStatus = (guid: string) => {
  return axios.get(
    `https://planperfectapi.replit.app/get_outline_status/${guid}`,
  );
};


export const getBatchStatus = (guids: string[]) => {
  return axios.post(
    `https://content-status.replit.app/content/status/batch`,
    guids,
  );
};
export const getPostsByDomain = (domain: string) => {
  return axios.get(
    `https://content-status.replit.app/content/domain/${domain}`,
  );
};

export const deleteContentPlan = (guid: string) => {
  return axios.delete(`${API_URL}/delete_content_plan/${guid}`);
}

export const deleteContentOutline = (content_plan_outline_guid: string) => {
  return axios.delete(`https://content-status.replit.app/content/delete/${content_plan_outline_guid}`);
}
// pagePerfect apis 
export const submitDomain = (domain: string) => {
  return axios.get(`https://discoverdomainurls.replit.app/urlcount?domain=${urlSanitization(domain)}`, { headers: { Accept: '*/*' } })
}

export const getMaxUrls = () => {
  return axios.get(`https://discoverdomainurls.replit.app//api/process_max_urls`)
}

export const validatePromoCode = (promoCode, total) => {
  return axios.get(`
  https://pageperfect.ai/validate_promo_code/${promoCode}/${total.toString()}`)
}

export const sendOptimizeRequest = (request: Request.MetaRequest) => {
  return axios.post(`https://pageperfectapi.replit.app/optimize_data`, request);
}
export const getDashboard = (guid: string) => {
  return axios.get(`https://pageperfectapi.replit.app/dashboard/${guid}`);
}

export const updateLiveUrl = (guid, url) => {
  return axios.put(`https://content-status.replit.app/content/posts/${guid}/live-post-url`, url);
}
export const updateHTML = (guid, html) => {
  return axios.put(`https://content-status.replit.app/content/posts/${guid}/html`, html);
}
export const updateGoogleDoc = (guid, url) => {
  return axios.put(`https://content-status.replit.app/content/posts/${guid}/google-doc`, url);
}

// factcheckPerfect apis 
export const getFactCheckStatus = (guid: string) => {
  return axios.get(`https://factcheckapi.replit.app/status/${guid}`);
}

export const postFactCheck = (reqObj: Request.FactCheckRequest) => {
  return axios.post(`https://factcheckapi.replit.app/fact_check_html`, reqObj, { headers: { "Content-Type": "multipart/form-data; boundary=----WebKitFormBoundary4BlampJWNu9F0sga" } });
}

