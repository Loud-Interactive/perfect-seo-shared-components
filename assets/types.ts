
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
  status: BrandStatus
  summary?: string,
}