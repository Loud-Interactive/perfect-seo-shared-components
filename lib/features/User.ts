"use client";

import { SettingsProps, GoogleUser, Profile } from "@/perfect-seo-shared-components/data/types";

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";


export type RootState = {
  user: GoogleUser,
  points: number,
  isLoading: boolean,
  isLoggedIn: boolean,
  isAdmin: boolean
  domainsInfo: any[];
  profile: Profile;
  settings: SettingsProps
};


const initialState: RootState = {
  user: { email: '', name: '', image: '' },
  points: 0,
  isLoading: true,
  isLoggedIn: false,
  isAdmin: false,
  profile: {
    id: '',
    updated_at: '',
    full_name: '',
    avatar_url: '',
    domains: [],
    email: '',
    products: [],
    admin: null,
    domain_access: [],
    user_metadata: {},
    factchecks: [],
    bulk_posts_guids: [],
    bulk_content_guids: [],
    index_ids: [],
    social_posts: [],
    bulk_content: []
  },
  settings: null,
  domainsInfo: []
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