
import { updatePoints } from './actions';
import { Action, Dispatch } from 'redux';
import * as Request from "@/perfect-seo-shared-components/data/requestTypes";

import axios from "axios";

const API_URL = "https://planperfectapi.replit.app";

const headers = {
  "X-API-Key": process.env.NEXT_PUBLIC_API_KEY,
  "Content-Type": "application/json",
};

import { urlSanitization } from "@/utilities/conversion-utilities";
import { BrandImpression, ContentPlan } from '../data/types';
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

const parseQueries = (obj: object) => {
  return Object.keys(obj).reduce(
    (prev, curr) => prev + curr + "=" + obj[curr] + "&",
    "?",
  );
};

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
    `${API_URL}/get_full_outline/${reqObj.content_plan_guid}/${encodeURIComponent(reqObj.post_title)}/${reqObj.client_domain}`,
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

export const updateContentPlan = (guid, reqObj: ContentPlan[]) => {
  return axios.post(`${API_URL}/update_content_plan`, {
    guid,
    content_plan_table: reqObj,
  });
};

// export const createPost = (reqBody: Request.GenerateContentPost) => {
//   return axios.post(`https://content-status.replit.app/content/add`, reqBody);
// };

export const createPost = (reqBody: Request.GenerateContentPost) => {
  return axios.post(`https://content-v5.replit.app/generate_content`, reqBody);
};

export const getImpression = (domain_name: string) => {
  return axios.get(
    `https://synopsisperfectai.replit.app/domain/${domain_name}`,
  );
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

export const updateImpression = (domain: string, obj: BrandImpression) => {
  let reqObj = {
    domain: domain,
    key_value_pairs: obj,
  };
  return axios.post("https://pp-api.replit.app/pairs", reqObj);
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

export const fetchOutlineStatus = (guid: string) => {
  return axios.get(
    `https://planperfectapi.replit.app/get_outline_status/${guid}`,
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
  return axios.delete(`https://lucsperfect.replit.app/users/${email}`, {
    headers: headers,
  });
};

export const checkUserCredits = (email: string) => {
  return axios.get(`https://lucsperfect.replit.app/users/${email}/credits`, {
    headers: headers,
  });
};

export const getBatchStatus = (guids: string[]) => {
  return axios.post(
    `https://content-status.replit.app/content/status/batch`,
    guids,
  );
};
export const getPostsByDomain = (domain: string) => {
  return axios.get(
    `https://content-status.replit.app/content/domain/all/${domain}`,
  );
};


export const getSynopsisInfo = (domain, regenerate?) => {
  let newDomain = urlSanitization(domain);
  if (regenerate) {
    newDomain += "?regenerate=true";
  }
  return axios.get(`https://pp-api.replit.app/pairs/${newDomain}`, { headers: { 'Access-Control-Allow-Origin': '*' } });
};

export const loadCreditData = (email: string) => async (dispatch: Dispatch): Promise<any> => {

  return checkUserCredits(email).then((res) => {
    dispatch(updatePoints(res.data.credits))

  }, dispatch)
    .catch(err => {
      console.log(err)
      console.log("Check User Credits failed")

      createUserCreditAccount(email)
        .then(res1 => {
          console.log("Create User Credits succeeded")
          if (res1.data.credits === 0) {
            addUserCredit(email, 9000)
              .then(res2 => {
                dispatch(updatePoints(res2.data.credits))
              }, dispatch
              )
          } else {
            dispatch(updatePoints(res1.data.credits))
          }
        }, dispatch)
        .catch(err => {
          console.log("Create User Credits failed")
          console.log(err)
        })
    })

}

