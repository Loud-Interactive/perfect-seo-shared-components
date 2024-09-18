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
  profile: any;
};


const initialState: RootState = {
  user: null,
  points: 0,
  isLoading: true,
  isLoggedIn: false,
  isAdmin: false,
  profile: null
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
    setProfile: (state, action: PayloadAction<any>) => {
      return {
        ...state,
        profile: action.payload,
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
    reset: () => {
      return initialState
    }
  }

});
// Action creators are generated for each case reducer function

export const { setUser, setProfile, updatePoints, setLoggedIn, setLoading, setAdmin, setDomain, reset } = UserSlice.actions;
export default UserSlice.reducer;