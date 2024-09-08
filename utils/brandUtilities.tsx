
import { ContentPerfectLogo, PagePerfectLogo, VoicePerfectLogo, PerfectSEOLogo, PreferencesPerfectLogo, SynopsisPerfectLogo } from "../assets/brandIcons"


export const renderIcon = (appKey: string) => {
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
    default:
      return appKey
  }
}