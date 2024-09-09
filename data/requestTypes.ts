import { OutlineRowProps, Sitemap } from "./types"

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

export interface ContentPlanPostRequest {
  content_plan_guid: string,
  post_title: string,
  client_domain: string
}

export interface BrandVoiceResponse {
  freq_phrases: string
  lang_style: string
  lexicon: string
  ling_style: string
  tone: string
  voice_prompt: string
  voice_prompt_logic: string
  voice_traits: string
}
export interface PromoValidationResponse {
  amount_off: number
  cost_per_url: number
  final_cost: number
  minimum_purchase_cost: number
  name: string
  percent_off: number
  savings: number
  total_cost: number
}


export interface DomainResponse {
  "sitemap_list": Array<Sitemap>,
  "total_sitemap_urls": number,
  "total_ahrefs_urls": number,
  "max_urls": number

}

export interface MetaRequest {
  first_name: string,
  last_name: string,
  email: string,
  company: string,
  website: string,
  budget: number,
  completed_urls: number,
  brand: string,
  voice: string,
  exclusion: string,
  completed: boolean,
  in_process: boolean,
  guid: string,
  competitors: string
}

