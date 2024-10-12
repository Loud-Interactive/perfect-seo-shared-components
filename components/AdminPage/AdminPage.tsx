import { reset } from "@/perfect-seo-shared-components/lib/features/User";
import { RootState } from "@/perfect-seo-shared-components/lib/store";
import { loginWithGoogle, logout } from "@/perfect-seo-shared-components/utils/supabase/actions";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";

const AdminPage = () => {
  const { isLoggedIn } = useSelector((state: RootState) => state);
  const router = useRouter()
  const dispatch = useDispatch()

  const signOutHandler = (e) => {
    e.preventDefault()
    logout()
      .then(res => {
        if (res.error) {

        }
        else {
          dispatch(reset() as any); // Add 'as any' to cast the action to 'UnknownAction'
          router.push('/')
        }
      })

  }

  return (
    <div className="container strip-padding">
      <div className="row d-flex align-items-center justify-content-center h-100">
        <div className="col-12 col-md-6 col-lg-4">
          <div className='col-auto'>
            {isLoggedIn ?
              <a onClick={signOutHandler}>Sign Out</a>
              :
              <button className="btn btn-google" onClick={loginWithGoogle}><img src="/images/google-icon.png" /> Login</button>}
          </div>
        </div>
      </div>
    </div>
  )
}
export default AdminPage;