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

//Preferences Interfaces

export interface PreferencesProps extends
  BusinessInfoProps,
  SocialProps,
  BrandTabProps,
  SettingsProps,
  CommunicationsProps,
  ProductAndServiceProps,
  MarketAndAudienceProps,
  CMSProps,
  LandingPageFields,
  AIPRomptProps,
  OtherFieldsProps { }

export interface TieredPreferencesProps {
  'company-info': BusinessInfoProps,
  "social-media": SocialProps,
  'brand-identity': BrandTabProps
  'blog-settings': SettingsProps,
  'communications': CommunicationsProps
  "products-and-services": ProductAndServiceProps,
  "market-and-audience": MarketAndAudienceProps,
  "cms": CMSProps,
  "landing-pages": LandingPageFields,
  "ai-prompts": AIPRomptProps
  "other": OtherFieldsProps
}

export interface AIPRomptProps {
  search_prompt: string,
  content_generation_prompt: string,
  style_analysis_prompt: string,
  content_rewrite_prompt_entity_voice: string,
  content_rewrite_prompt_avoid_words: string,
  content_translation_prompt: string,
  client_style_edit_prompt: string,
  json_ld_schema_generation_prompt: string,
  markdown_to_html_template_prompt: string,
  search_terms_prompt: string,
  url_selection_prompt: string
}

export interface LandingPageFields {
  landing_page_name_1: string;
  landing_page_url_1: string;
  landing_page_name_2?: string;
  landing_page_url_2?: string;
  landing_page_name_3?: string;
  landing_page_url_3?: string;
}

export interface CMSProps {
  cms_brand: string;
  cms_brand_website: string;
  cms_username: string;
  cms_application_password: string;
  cms_posting_url: string;
  cms_api_key: string;
  cms_web_login_url: string;
  cms_api_xml_url: string;
  cms_api_sml_logic: string;
}

export interface MarketAndAudienceProps {
  industry: string;
  demographics_age: string;
  demographics_gender: string;
  demographics_income: string;
  demographics_education: string;
  market_focus: string;
  client_persona: string;
  competitor_names: string;
  competitor_domains: string;
  psychographics_interests: string;
  psychographics_attitudes: string;
  psychographics_values: string;
  key_differentiators: string;
}

export interface ProductAndServiceProps {
  "service_1_category": string,
  "service_1_url": string,
  "service_2_category": string,
  "service_2_url": string,
  "service_3_category": string,
  "service_3_url": string,
  "service_4_category": string,
  "service_4_url": string,
  "service_5_category": string,
  "service_5_url": string,
  "product_1_name": string,
  "product_1_url": string,
  "product_2_name": string,
  "product_2_url": string,
  "product_3_name": string,
  "product_3_url": string,
  "product_4_name": string,
  "product_4_url": string,
  "product_5_name": string,
  "product_5_url": string
}

export interface SocialProps {
  behance: string;
  discord: string;
  dribbble: string;
  facebook: string;
  flikr: string;
  github: string;
  instagram: string;
  kik: string;
  line: string;
  linkedin: string;
  medium: string;
  pinterest: string;
  qq: string;
  quora: string;
  reddit: string;
  snapchat: string;
  soundcloud: string;
  spotify: string;
  telegram: string;
  tiktok: string;
  tumblr: string;
  twitch: string;
  twitter: string;
  vk: string;
  vimeo: string;
  wechat: string;
  weibo: string;
  whatsapp: string;
  website_url: string;
  youtube: string;
  other_social: string;
  twitter_username: string;
  twitter_password: string;
  facebook_username: string;
  facebook_password: string;
  instagram_username: string;
  instagram_password: string;
  linkedin_username: string;
  linkedin_password: string;
  tiktok_username: string;
  tiktok_password: string;
  twitter_sample_content_1: string;
  twitter_sample_content_2: string;
  twitter_sample_content_3: string;
  facebook_sample_content_1: string;
  facebook_sample_content_2: string;
  facebook_sample_content_3: string;
  instagram_sample_content_1: string;
  instagram_sample_content_2: string;
  instagram_sample_content_3: string;
  linkedin_sample_content_1: string;
  linkedin_sample_content_2: string;
  linkedin_sample_content_3: string;
  tiktok_sample_content_1: string;
  tiktok_sample_content_2: string;
  tiktok_sample_content_3: string;
  preferred_hashtags: string;
  industry_events: string;
  influencers: string;
  seasonal_themes: string;
}

export interface CommunicationsProps {
  press_release_boilerplate: string;
  crisis_communication_plan: string;
  csr_initiatives: string;
  avoid_topics: string;
  image_generation_prompt: string;
  image_video_guidelines_image_dimensions: string;
  image_video_guidelines_image_styles: string;
  image_video_guidelines_video_styles: string;
  image_video_guidelines_video_dimensions: string;
  cta_guidelines: string;
  anchor_text: string;
  example_link: string;
  preferred_language: string;
  secondary_language?: string;
  third_language?: string;
  first_person_voice: string;
  second_person_voice: string;
  third_person_voice: string;
}

export interface BusinessInfoProps {
  business_goals: string,
  certifications_awards: string,
  company_aka: string,
  company_name: string,
  company_revenue: string,
  company_size: string,
  customer_support_email: string,
  distribution_channels: string,
  founding_date: string,
  general_inquries: string,
  hq_address_1: string,
  hq_address_2: string,
  hq_address_3: string,
  hq_city: string,
  hq_country: string,
  hq_postal_code: string,
  hq_state: string,
  investor_relations_email: string,
  legal_structure: string,
  mission: string,
  other_email: string,
  partnerships_email: string,
  phone_number: string,
  press_inquiries_email: string,
  synopsis: string,
}

export interface SettingsProps {
  HTML_Post_Template: string,
  "JSON-LD_Schema_Post_Template": string,
  hero_image_aspect_ratio: string,
  hero_image_base_prompt: string,
  include_conclusion: boolean,
  post_callout_left: string,
  post_callout_right: string,
  post_style_tag_main: string
  human_blog_instructions: string
}

export interface BrandTabProps {
  logo_url: string;
  elevator_pitch: string;
  brand_values: string;
  brand_personality: string;
  usp: string;
  brand_story: string;
  content_themes: string;
  logo_theme: string;
  brand_color_primary: string;
  brand_color_secondary: string;
  logo_width: number;
  logo_height: number;
  logo_aspect_ratio: string;
  rationale: string;
  political_leaning: string;
  trademark_words: string;
  registered_words: string;
}
export interface OtherFieldsProps {
  special_ai_instructions: string;
  ab_testing_plans: string;
  ab_testing_results: string;
}
export interface IncomingPlanItemResponse {
  guid: string;
  domain_name: string;
  brand_name: string;
  target_keyword: string;
  email: string;
  status?: string;
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
  priority3?: 'high' | 'medium' | 'low'
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
