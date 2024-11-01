export interface BrandInfo {
  "domain_name"?: string,
  "brand_name"?: string,
  "synopsis"?: string,
  "elevator_pitch"?: string,
  "voice_prompt"?: string,
  "voice_prompt_logic"?: string,
  "voice_traits"?: string,
  "tone"?: string,
  "lexicon"?: string,
  "lang_style"?: string,
  "ling_style"?: string,
  "freq_phrases"?: string,
  "url"?: string,
  "anchor_text"?: string,
  "example_link"?: string,
  "rationale"?: string,
  "third_person_voice"?: string,
  "business_goals"?: string,
  "brand_story"?: string,
  "usp"?: string,
  "key_differentiators"?: string,
  "client_persona"?: string,
  "brand_values"?: string,
  "distribution_channels"?: string,
  "influencers"?: string,
  "demographics_age"?: string,
  "market_focus"?: string,
  "company_aka"?: string,
  "linkedin"?: string,
  "facebook"?: string,
  "service_1_url"?: string,
  "service_2_category"?: string,
  "service_2_url"?: string,
  "hq_city"?: string,
  "service_3_url"?: string,
  "hq_postal_code"?: string,
  "hq_country"?: string,
  "product_2_name"?: string,
  "mission"?: string,
  "product_3_name"?: string,
  "product_3_url"?: string,
  "logo_url"?: string,
  "demographics_gender"?: string,
  "twitter"?: string,
  "instagram"?: string,
  "brand_personality"?: string,
  "preferred_language"?: string,
  "trademark_words"?: string,
  "preferred_formats"?: string,
  "industry"?: string,
  "hq_address_1"?: string,
  "service_3_category"?: string,
  "hq_state"?: string,
  "product_1_name"?: string,
  "product_1_url"?: string,
  "phone_number"?: string,
  "product_2_url"?: string,
  "company_name"?: string,
  "content_themes"?: string,
  "website_url"?: string,
  "service_1_category"?: string,
  "demographics_income"?: string,
  "demographics_education"?: string,
  "psychographics_interests"?: string,
  "psychographics_attitudes"?: string,
  "psychographics_values"?: string,
  "brand_document"?: string,
  "has_profile"?: string
}


export enum BrandStatus {
  LIVE = "LIVE",
  COMING_SOON = "COMING_SOON",
  PLANNED = "PLANNED",
  MASTER = "MASTER"
}

export interface Brand {
  title: string,
  url: string,
  icon: string,
  logo: string
  current?: boolean;
  primary: string
  stagingUrl?: string
  developmentUrl?: string
  status: BrandStatus
  summary?: string,
}

export enum LinkType {
  PUBLIC,
  PRIVATE,
  ADMIN
}
export interface Links {
  href: any,
  label: string,
  type?: LinkType
}

export interface ContentRequestFormProps {
  email: string,
  domainName: string,
  brandName: string,
  targetKeyword?: string,
  entityVoice?: string,
  priorityCode?: string,
  url1?: string,
  priority1?: 'high' | 'medium' | 'low'
  url2?: string,
  priority2?: 'high' | 'medium' | 'low'
  url3?: string,
  priority3?: 'high' | 'medium' | 'low',
  writing_language?: string
}

export interface ContentIncomingProps {
  email: string,
  domain_name: string,
  brand_name: string,
  target_keyword?: string,
  entity_voice?: string,
  priority_code?: string,
  inspiration_url_1?: string,
  priority1?: 'high' | 'medium' | 'low'
  inspiration_url_2?: string,
  priority2?: 'high' | 'medium' | 'low'
  inspiration_url_3?: string,
  priority3?: 'high' | 'medium' | 'low'
  writing_language?: string
}

export enum FormSteps {
  INTRO,
  BASIC,
  ADVANCED,
  LOADING
}

export interface SubheadingProps {
  index?: number,
  headingIndex?: number,
  title: string
}

export interface OutlineRowProps {
  index?: number,
  title: string,
  subheadings: SubheadingProps[] | string[]
}

export interface ContentPlan {
  CPC: string,
  Day: string
  Difficulty: string,
  "Hub Number": string,
  Keyword: string,
  "Post Title": string,
  "Spoke Number": string,
  "URL Slug": string,
  Volume: string,
}

export interface BrandImpression {
  anchor_text: string,
  brand_name: string,
  elevator_pitch: string,
  example_link: string,
  freq_phrases: string,
  lang_style: string
  lexicon: string,
  ling_style: string,
  rationale: string,
  synopsis: string,
  url: string,
  voice_prompt: string
  voice_prompt_logic: string
  voice_traits: string
  domain_name?: string
}

export interface TetrominoProps {
  shape: Array<any[]>,
  color: string,
  key: any
}

export interface PlayerProps {
  pos: {
    x: number,
    y: number
  }
  tetromino: TetrominoProps,
  orientation: number,
  collided: false;

}

export interface Synopsis {
  anchor_text: string,
  brand_name: string,
  elevator_pitch: string,
  example_link: string,
  freq_phrases: string,
  lang_style: string
  lexicon: string,
  ling_style: string,
  rationale: string,
  synopsis: string,
  url: string,
  voice_prompt: string
  voice_prompt_logic: string
  voice_traits: string
}

export interface Sitemap {
  "name": string,
  "url": string,
  "total_urls": number
}



export interface PostUploadItem {
  additional_data_URL?: string;
  brand_name?: string
  custom_outline?: string
  domain_name: string
  email: string;
  excluded_topics?: string;
  outline_post_title?: string
  outline_section1_headline?: string
  outline_section1_subheadline1?: string
  outline_section1_subheadline2?: string
  outline_section1_subheadline3?: string
  outline_section1_subheadline4?: string
  outline_section2_headline?: string
  outline_section2_subheadline1?: string
  outline_section2_subheadline2?: string
  outline_section2_subheadline3?: string
  outline_section2_subheadline4?: string
  outline_section3_headline?: string
  outline_section3_subheadline1?: string
  outline_section3_subheadline2?: string
  outline_section3_subheadline3?: string
  outline_section3_subheadline4?: string
  outline_section4_headline?: string
  outline_section4_subheadline1?: string
  outline_section4_subheadline2?: string
  outline_section4_subheadline3?: string
  outline_section4_subheadline4?: string
  outline_section5_headline?: string
  outline_section5_subheadline1?: string
  outline_section5_subheadline2?: string
  outline_section5_subheadline3?: string
  outline_section5_subheadline4?: string
  outline_section6_headline?: string
  outline_section6_subheadline1?: string
  outline_section6_subheadline2?: string
  outline_section6_subheadline3?: string
  outline_section6_subheadline4?: string
  outline_url?: string
  target_keyword?: string
  voice_url?: string;
  writing_language?: string
  status?: string;
  guid?: string;
}



export interface SettingsProps {
  global: GlobalSettingsProps,
  contentPerfect: any
}

export interface GlobalSettingsProps {
  defaultDomain: string,
}

export interface ContentPerfectSettingsProps {
  defaultDomain: string,
  hideDashboardHeader: boolean;
}

export interface GoogleUser {
  name: string,
  email: string,
  image?: string
}

export interface Profile {
  id: string,
  updated_at: string,
  full_name: string,
  avatar_url: string,
  domains: string[],
  email: string,
  products: any[],
  admin: boolean,
  domain_access: any[],
  user_metadata: any,
  factchecks: any[],
  bulk_posts_guids: string[],
  bulk_content_guids: string[],
  index_ids: string[],
  social_posts: any[],
  bulk_content: any[]
}

export interface PaginationRequest {
  page_size?: number,
  page?: number
}

