// import ErrorPage from "@/perfect-seo-shared-components/components/ErrorPage/ErrorPage"

function Error({ statusCode, err }) {
  return (<>
    {/* <ErrorPage statusCode={statusCode} err={err} /> */}
  </>
  )
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode, err }
}

export default Error