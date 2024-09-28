
import { ContentPerfectLogo, PagePerfectLogo, VoicePerfectLogo, PerfectSEOLogo, PreferencesPerfectLogo, SynopsisPerfectLogo, SynopsisPerfectIcon, ContentPerfectIcon, VoicePerfectIcon, PagePerfectIcon, PreferencesPerfectIcon, SocialPerfectIcon, SocialPerfectLogo, FactCheckPerfectLogo, FactCheckPerfectIcon, ImagePerfectIcon, IndexPerfectIcon, ImagePerfectLogo, IndexPerfectLogo, PerfectSEOIcon, SEOPerfectIcon, SEOPerfectLogo } from "../assets/brandIcons"


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
    case 'factcheckPerfect.ai':
      return <FactCheckPerfectIcon />
    case 'imagePerfect.ai':
      return <ImagePerfectIcon />
    case 'indexPerfect.ai':
      return <IndexPerfectIcon />
    case 'perfectSEO.ai':
      return <PerfectSEOIcon />
    case 'SEOPerfect.ai':
      return <SEOPerfectIcon />
    default:
      return appKey
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
    case 'socialPerfect.ai':
      return <SocialPerfectLogo />
    case 'factcheckPerfect.ai':
      return <FactCheckPerfectLogo />
    case 'imagePerfect.ai':
      return <ImagePerfectLogo />
    case 'indexPerfect.ai':
      return <IndexPerfectLogo />
    case 'perfectSEO.ai':
      return <PerfectSEOLogo />
    case 'SEOPerfect.ai':
      return <SEOPerfectLogo />
    default:
      return appKey
  }
}