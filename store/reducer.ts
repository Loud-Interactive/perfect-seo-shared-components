
import { ActionType } from '@/perfect-seo-shared-components/lib/User.ts';

export type RootState = {
  user: any,
  points: number,
  isLoading: boolean,
  isLoggedIn: boolean,
  isAdmin: boolean
};

interface ReduxAction {
  type?: ActionType;
  [key: string]: any;
}

const initialState: RootState = {
  user: null,
  points: null,
  isLoading: true,
  isLoggedIn: false,
  isAdmin: false
};

export default function reducer(state: RootState = initialState, action: ReduxAction = {}): RootState {
  switch (action.type) {
    case ActionType.SET_USER:
      return {
        ...state,
        user: action.user,
      };
    case ActionType.UPDATE_POINTS:
      return {
        ...state,
        points: action.points,
      };
    case ActionType.SET_LOGGED_IN:
      return {
        ...state,
        isLoggedIn: action.bool,
      };
    case ActionType.SET_LOADING:
      return {
        ...state,
        isLoading: action.bool,
      };
    case ActionType.SET_ADMIN:
      return {
        ...state,
        isAdmin: action.bool,
      };
    case ActionType.RESET:
      return initialState
    default:
      return state;
  }
}
