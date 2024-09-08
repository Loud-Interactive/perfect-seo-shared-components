
import { ContentPerfectLogo, PagePerfectLogo, VoicePerfectLogo, PerfectSEOLogo, PreferencesPerfectLogo, SynopsisPerfectLogo, SynopsisPerfectIcon, ContentPerfectIcon, VoicePerfectIcon, PagePerfectIcon, PreferencesPerfectIcon, SocialPerfectIcon, SocialPerfectLogo } from "../assets/brandIcons"


export const renderIcon = (appKey: string) => {
  switch (appKey) {
    case 'pagePerfect.ai':
      return <PagePerfectIcon />
    case 'voicePerfect.ai':
      return <VoicePerfectIcon />
    case 'contentPerfect.ai':
      return <ContentPerfectIcon />
    case 'synopsisPerfect.ai':
      return <SynopsisPerfectIcon />
    case 'preferencesPerfect.ai':
      return <PreferencesPerfectIcon />
    case 'socialPerfect.ai':
      return <SocialPerfectIcon />
    default:
      return null
  }
}
export const renderLogo = (appKey: string) => {
  switch (appKey) {
    case 'pagePerfect.ai':
      return <PagePerfectLogo />
    case 'voicePerfect.ai':
      return <VoicePerfectLogo />
    case 'contentPerfect.ai':
      return <ContentPerfectLogo />
    case 'synopsisPerfect.ai':
      return <SynopsisPerfectLogo />
    case 'preferencesPerfect.ai':
      return <PreferencesPerfectLogo />
    case 'perfectSEO.ai':
      return <PerfectSEOLogo />
    case 'socialPerfect.ai':
      return <SocialPerfectLogo />
    default:
      return appKey
  }
}