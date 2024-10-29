"use client";

import { SettingsProps } from "@/perfect-seo-shared-components/data/types";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface User {
  email: string,
  image: string,
  name: string,
}

export type RootState = {
  user: User | null,
  points: number,
  isLoading: boolean,
  isLoggedIn: boolean,
  isAdmin: boolean
  domainsInfo: any[];
  profile: any;
  settings: SettingsProps
};


const initialState: RootState = {
  user: null,
  points: 0,
  isLoading: true,
  isLoggedIn: false,
  isAdmin: false,
  profile: null,
  settings: null,
  domainsInfo: null
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
    setUserSettings: (state, action: PayloadAction<SettingsProps>) => {
      return {
        ...state,
        settings: action.payload,
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
    setDomains: (state, action: PayloadAction<any[]>) => {
      return {
        ...state,
        domainsInfo: action.payload,
      };
    },
    reset: () => {
      return { ...initialState, isLoading: false }
    }
  }

});
// Action creators are generated for each case reducer function

export const { setUser, setProfile, updatePoints, setLoggedIn, setLoading, setAdmin, setDomains, reset, setUserSettings } = UserSlice.actions;
export default UserSlice.reducer;