
import { ActionType } from './actions';

export type StateTree = {
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

const initialState: StateTree = {
  user: null,
  points: null,
  isLoading: true,
  isLoggedIn: false,
  isAdmin: false
};

export default function reducer(state: StateTree = initialState, action: ReduxAction = {}): StateTree {
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
