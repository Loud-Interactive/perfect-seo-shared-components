"use client";

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type RootState = {
  user: any,
  points: number,
  isLoading: boolean,
  isLoggedIn: boolean,
  isAdmin: boolean
  domain?: string;
};


const initialState: RootState = {
  user: null,
  points: null,
  isLoading: true,
  isLoggedIn: false,
  isAdmin: false,
  domain: null
};

export const UserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => {
      return {
        ...state,
        user: action.payload,
        domain: action.payload?.email?.split('@')[1]
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
    setDomain: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        domain: action.payload,
      };
    },
    reset: (state, action: PayloadAction<boolean>) => {
      return initialState
    }
  }

});
// Action creators are generated for each case reducer function

export const { setUser, updatePoints, setLoggedIn, setLoading, setAdmin, setDomain, reset } = UserSlice.actions;
export default UserSlice.reducer;