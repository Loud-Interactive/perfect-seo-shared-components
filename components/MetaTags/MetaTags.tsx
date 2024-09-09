import Head from "next/head"

export interface MetaTagsProps {
  title?: string,
  description?: string,
  image?: string,
  type?: string,
  url?: string
}
const MetaTags = ({ title, description, image, type, url }: MetaTagsProps) => {
  return (
    <Head>
      {title &&
        <meta property="og:title" content={title} />
      }
      {type &&
        <meta property="og:type" content={type} />
      }
      {description &&
        <meta property="og:description" content={description} />
      }
      {image &&
        <meta property="og:image" content={image} />
      }
      {url && <meta property="og:url" content={url} />}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="UTF-8" />
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossOrigin="anonymous" />
    </Head>

  )
}
export default MetaTags