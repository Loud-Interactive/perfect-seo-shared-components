import { Action, AnyAction, applyMiddleware, compose, createStore, Reducer } from 'redux';
import { ThunkAction } from 'redux-thunk';
import reducer, { StateTree } from './store/reducer';

import { configureStore } from '@reduxjs/toolkit';


const composeEnhancers = typeof window !== 'undefined' && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export type RootStateTree = StateTree
export type Thunk<R = void> = ThunkAction<R, RootStateTree, unknown, Action>;

const store = configureStore({
  // Automatically calls `combineReducers`
  reducer: reducer as Reducer<StateTree, Action, StateTree>,
})
export default store