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
        <>
          <title>{title}</title>
          <meta property="og:title" content={title} />
        </>
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


      <meta name="description" content="ALS United" />

      {/* <!-- Google / Search Engine Tags --> */}
      {image && <meta itemProp="image" content={image} />}
      {title && <meta itemProp="name" content={title} />}
      {description && <meta itemProp="description" content={description} />}


      {/* <!-- Facebook Meta Tags --> */}
      {url && <meta property="og:url" content={url} />}
      {type && <meta property="og:type" content={type} />}
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      {image && <meta property="og:image" content={image} />}

      {/* <!-- Twitter Meta Tags --> */}
      <meta name="twitter:card" content="summary_large_image" />
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      {image && <meta name="twitter:image" content={image} />}



      <meta charSet="UTF-8" />
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossOrigin="anonymous" />
    </Head>

  )
}
export default MetaTags