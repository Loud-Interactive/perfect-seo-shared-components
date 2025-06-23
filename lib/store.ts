import { configureStore } from '@reduxjs/toolkit';
import User from './features/User';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
  key: 'root',
  storage,
};

const persistedReducer = persistReducer(persistConfig, User);

export const makeStore = () => {
  return configureStore({
    reducer: persistedReducer
  })
};

export const persistor = persistStore(makeStore());

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']