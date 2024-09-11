import { Dispatch } from "redux";
import { addUserCredit, checkUserCredits, createUserCreditAccount } from "../services/services";
import { updatePoints } from "../lib/features/User";

export const loadCreditData = (email: string) => {

  return async (dispatch: Dispatch) => {

    return checkUserCredits(email).then((res) => {
      dispatch(updatePoints(res.data.credits))

    }, dispatch)
      .catch(err => {
        console.log(err)
        console.log("Check User Credits failed")

        createUserCreditAccount(email)
          .then(res1 => {
            console.log("Create User Credits succeeded")
            if (res1.data.credits === 0) {
              addUserCredit(email, 9000)
                .then(res2 => {
                  dispatch(updatePoints(res2.data.credits))
                }, dispatch
                )
            } else {
              dispatch(updatePoints(res1.data.credits))
            }
          }, dispatch)
          .catch(err => {
            console.log("Create User Credits failed")
            console.log(err)
          })
      })

  };

};