import { ContentPlan, OutlineRowProps } from "./types"

export interface ContentPlanPostRequest {
  content_plan_guid: string,
  post_title: string,
  client_domain: string
}
export interface GetPostOutlineRequest {
  content_plan_guid: string,
  post_title: string,
  client_domain: string,
  client_name: string,
  priority_code?: string,
  entity_voice?: string,
  inspiration_url_1?: string,
  priority1?: 'high' | 'medium' | 'low'
  inspiration_url_2?: string,
  priority2?: 'high' | 'medium' | 'low'
  inspiration_url_3?: string,
  priority3?: 'high' | 'medium' | 'low'
}

export interface SaveContentPost {
  content_plan_guid: string,
  post_title: string,
  client_name: string,
  client_domain: string,
  outline_details: {
    sections: OutlineRowProps[]
  }
}

export interface GenerateContentPost {
  email: string,
  keyword?: string,
  seo_keyword: string,
  content_plan_guid: string,
  content_plan_outline_guid: string,
  client_name: string,
  client_domain: string,
  receiving_email: string,
  outline: {
    sections: OutlineRowProps[]
  }
  status?: string,
  entity_voice?: string,
  inspiration_url_1?: string,
  priority1?: 'high' | 'medium' | 'low'
  inspiration_url_2?: string,
  priority2?: 'high' | 'medium' | 'low'
  inspiration_url_3?: string,
  priority3?: 'high' | 'medium' | 'low'
}
