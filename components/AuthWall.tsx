import { signIn, useSession } from "next-auth/react"

function AuthWall({ children }) {
  const { status } = useSession()

  // Handler for Google login
  const loginWithGoogleHandler = (e) => {
    e?.preventDefault();
    let url = `${window.location.origin}`;

    signIn('google', { callbackUrl: url });
  };

  if (status === "loading") {
    return <div className="bg-primary">
      <div className="container hero d-flex align-items-center">
        <h1>Loading...</h1>
      </div>
    </div>
  }
  else if (status === 'authenticated') {
    return children
  }

  return <div className="strip-padding d-flex align-items-center">
    <div className="container d-flex justify-content-center">
      <div className="card p-3 bg-primary">
        <p className="text-white">
          You are not authorized to view this page. Please sign in.
        </p>
        <div>
          <button className="btn btn-google" onClick={loginWithGoogleHandler}>
            <img src="/images/google-icon.png" /> Login
          </button>
        </div>
      </div>
    </div>
  </div>
}

export default AuthWall