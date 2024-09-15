import { Metadata } from "next";
import { Brands } from "../assets/Brands";

export interface MetaDataProps {
  title?: string,
  description?: string,
  image?: string,
  icon?: string
  current: string;
}

export function renderMetaData({ title, description, image, icon, current }: MetaDataProps): Metadata {
  const currentBrand = Brands.find((brand) => brand.title === current)

  let metaData: Metadata = {
    description: currentBrand?.summary,
    openGraph: {
      title: title || current,
      description: description || currentBrand?.summary,
      images: image || `/svg/${current.endsWith(".ai") ? current.replace(".ai", "") : current}-icon.svg`
    },
    icons: {
      icon: icon || `/svg/${current.endsWith(".ai") ? current.replace(".ai", "") : current}-icon.svg`
    },
    robots: {
      index: true,
      follow: true,
      nocache: true,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }

  if (title) {
    metaData.title = title
  }
  else {
    metaData.title = {
      template: `%s | ${current}`,
      default: current,
    }
  }

  return metaData

}