

export const enum ActionType {
  SET_USER = 'SET_USER',
  UPDATE_POINTS = 'UPDATE_POINTS',
  SET_LOADING = 'SET_LOADING',
  SET_LOGGED_IN = 'SET_LOGGED_IN',
  SET_ADMIN = 'SET_ADMIN',
  RESET = 'RESET',
}

export const setUser = (user) => ({
  type: ActionType.SET_USER,
  user,
});

export const updatePoints = (points) => ({
  type: ActionType.UPDATE_POINTS,
  points,
});

export const setLoggedIn = (bool) => ({
  type: ActionType.SET_LOGGED_IN,
  bool,
});

export const setLoading = (bool) => ({
  type: ActionType.SET_LOADING,
  bool,
});

export const setAdmin = (bool) => ({
  type: ActionType.SET_ADMIN,
  bool,
});

export const reduxReset = () => ({
  type: ActionType.RESET
});
