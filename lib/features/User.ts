"use client";

import { SettingsProps, GoogleUser, Profile, PreferencesProps, QueueItemProps, ToastProps } from "@/perfect-seo-shared-components/data/types";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type RootState = {
  user: GoogleUser,
  points: number,
  isLoading: boolean,
  isLoggedIn: boolean,
  isAdmin: boolean,
  domainAccessInfo: any[],
  domainInfo: Partial<PreferencesProps>[]
  profile: Profile,
  settings: SettingsProps
  queue: QueueItemProps[],
  loading: LoadingStates[],
  toasts: ToastProps[]
};

export type LoadingStates = {
  loading: boolean;
  key: string
}

const initialState: RootState = {
  user: null,
  points: 0,
  isLoading: true,
  isLoggedIn: null,
  isAdmin: false,
  profile: null,
  settings: null,
  domainAccessInfo: [],
  domainInfo: [],
  queue: [],
  loading: [
    { loading: false, key: 'user' },
  ],
  toasts: [
    { title: 'test', 'content': 'test', 'id': '1' }
  ]

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
    setDomainAccess: (state, action: PayloadAction<any[]>) => {
      return {
        ...state,
        domainAccessInfo: action.payload,
      };
    },
    reset: () => {
      return { ...initialState, isLoading: false, isLoggedIn: false };
    },
    setDomainInfo: (state, action: PayloadAction<Partial<PreferencesProps>[]>) => {
      return {
        ...state,
        domainInfo: action.payload
      }
    },
    updateDomainInfo: (state, action: PayloadAction<Partial<PreferencesProps>>) => {
      let preferences = action.payload;
      if (state?.domainInfo?.length === 0) {
        return {
          ...state,
          domainInfo: [preferences]
        }
      }
      else {
        let domainExists = state.domainInfo.find((domain) => domain.domain_name === preferences.domain_name || domain.domain_name === preferences?.domain || action?.payload?.domain || action?.payload?.guid === domain.guid);
        if (!domainExists) {
          console.log("it doesnt exist")
          return {
            ...state,
            domainInfo: [...state.domainInfo, preferences]
          }
        }
        else {
          let domainInfo = state.domainInfo.filter((domain) => {
            if (domain.domain_name === preferences.domain_name || domain.domain_name === preferences?.domain || action?.payload?.domain || action?.payload?.guid === domain.guid) {
              return { ...domain, ...preferences }
            }
            else {
              return domain;
            }
          });
          return {
            ...state,
            domainInfo
          }
        }
      }
    },
    setQueue: (state, action: PayloadAction<QueueItemProps[]>) => {
      return {
        ...state,
        queue: action.payload,
      }
    },
    updateQueueItem: (state, action: PayloadAction<QueueItemProps>) => {
      let queue = state.queue.map((item) => {
        if (item.guid === action.payload.guid) {
          return { ...item, ...action.payload };
        }
        else {
          return item;
        }
      });
      return {
        ...state,
        queue
      }
    },
    addQueueItem: (state, action: PayloadAction<QueueItemProps>) => {
      return {
        ...state,
        queue: [...state.queue, action.payload]
      }
    },
    removeQueueItem: (state, action: PayloadAction<QueueItemProps>) => {
      let queue = state.queue.filter((item) => item.guid !== action.payload.guid);
      return {
        ...state,
        queue
      }
    },
    clearQueue: (state) => {
      return {
        ...state,
        queue: []
      }
    },
    setLoader: (state, action: PayloadAction<LoadingStates>) => {
      let loading = state.loading.map((item) => {
        if (item.key === action.payload.key) {
          return { ...item, loading: action.payload.loading }
        }
        else {
          return item;
        }
      });
      return {
        ...state,
        loading
      }
    },
    addToast: (state, action: PayloadAction<ToastProps>) => {
      let newToast = action.payload;
      newToast.id = state?.toasts?.length.toString()
      return {
        ...state,
        toasts: [...state.toasts, action.payload]
      }
    },
    removeToast: (state, action: PayloadAction<string>) => {
      let toasts = state.toasts.filter((toast) => toast.id !== action.payload);
      return {
        ...state,
        toasts
      }
    },
    clearToasts: (state) => {
      return {
        ...state,
        toasts: []
      }
    }
  }
});

// Action creators are generated for each case reducer function
export const { setUser, setProfile, updatePoints, setLoggedIn, setLoading, setAdmin, setDomainInfo, setDomainAccess, reset, setUserSettings, updateDomainInfo, setQueue, updateQueueItem, clearQueue, setLoader, addQueueItem, removeQueueItem, removeToast, addToast, clearToasts } = UserSlice.actions;

// Selectors
export const selectUser = (state: RootState) => state?.user;
export const selectProfile = (state: RootState) => state?.profile;
export const selectPoints = (state: RootState) => state?.points;
export const selectIsLoading = (state: RootState) => state?.isLoading || false;
export const selectIsLoggedIn = (state: RootState) => state?.isLoggedIn;
export const selectIsAdmin = (state: RootState) => state?.isAdmin;
export const selectDomainsInfo = (state: RootState) => state?.domainInfo;
export const selectSettings = (state: RootState) => state?.settings;
export const selectEmail = (state: RootState) => state?.profile?.email;
export const selectDomains = (state: RootState) => state?.profile?.domain_access;
export const selectQueue = (state: RootState) => state?.queue;
export const selectLoader = (state: RootState) => state?.loading;
export const selectDomainInfo = (key: string) => (state: RootState) => state?.domainInfo?.find((domain) => domain.domain_name === key || domain.domain === key);
export const selectToasts = (state: RootState) => state?.toasts;

export default UserSlice.reducer;