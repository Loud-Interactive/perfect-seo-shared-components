"use client";

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type RootState = {
  user: any,
  points: number,
  isLoading: boolean,
  isLoggedIn: boolean,
  isAdmin: boolean
};


const initialState: RootState = {
  user: null,
  points: null,
  isLoading: true,
  isLoggedIn: false,
  isAdmin: false
};

export const UserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => {
      return {
        ...state,
        user: action.payload,
      };
    },
    updatePoints: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        points: action.payload,
      }
    },
    setLoggedIn: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        isLoggedIn: action.payload,
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        isLoading: action.payload,
      }
    },
    setAdmin: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        isAdmin: action.payload,
      };
    },
    reset: (state, action: PayloadAction<boolean>) => {
      return initialState
    }
  }

});
// Action creators are generated for each case reducer function

export const { setUser, updatePoints, setLoggedIn, setLoading, setAdmin, reset } = UserSlice.actions;
export default UserSlice.reducer;