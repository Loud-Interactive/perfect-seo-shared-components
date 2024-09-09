import axios from "axios";

import { urlSanitization } from "@/utilities/conversion-utilities";
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

export const domainExists = (domain: string) => {
  let newDomain = urlSanitization(domain);
  return axios.get(`https://pp-api.replit.app/pairs/guid/${newDomain}`);
};
