import type { Thunk } from '@/perfect-seo-shared-components/store';
import { addUserCredit, checkUserCredits, createUserCreditAccount } from '@/perfect-seo-shared-components/services/services';
import { updatePoints } from './actions';
import { ThunkAction } from 'redux-thunk';
import { Action, Dispatch } from 'redux';
import { StateTree } from './reducer';

export const loadCreditData = (email: string) => {

  return async (dispatch: Dispatch) => {

    checkUserCredits(email).then((res) => {
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
