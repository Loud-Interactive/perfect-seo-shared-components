"use client";

import { SettingsProps, GoogleUser, Profile } from "@/perfect-seo-shared-components/data/types";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type RootState = {
  user: GoogleUser,
  points: number,
  isLoading: boolean,
  isLoggedIn: boolean,
  isAdmin: boolean,
  domainsInfo: any[],
  profile: Profile,
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

// Selectors
export const selectUser = (state: RootState) => state?.user;
export const selectProfile = (state: RootState) => state?.profile;
export const selectPoints = (state: RootState) => state?.points;
export const selectIsLoading = (state: RootState) => state?.isLoading;
export const selectIsLoggedIn = (state: RootState) => state?.isLoggedIn;
export const selectIsAdmin = (state: RootState) => state?.isAdmin;
export const selectDomainsInfo = (state: RootState) => state?.domainsInfo;
export const selectSettings = (state: RootState) => state?.settings;

export default UserSlice.reducer;