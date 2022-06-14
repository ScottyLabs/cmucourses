import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import storage from "redux-persist/lib/storage";
import {
  fetchCourseInfos,
  fetchCourseInfosByPage,
  reducer as coursesReducer,
} from "./courses";
import { reducer as userReducer } from "./user";
import debounce from "lodash/debounce";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  stateReconciler: autoMergeLevel2,
};

const reducers = combineReducers({
  courses: coursesReducer,
  user: persistReducer(persistConfig, userReducer),
});
// const persistedReducer = persistReducer(persistConfig, reducers);
const persistedReducer = reducers;

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export let persistor = persistStore(store);

const updateFilter = () => {
  setTimeout(() => {
    const state = store.getState();
    if (!state.user.filter.exactMatchesOnly)
      store.dispatch(fetchCourseInfosByPage(1));

    if (
      state.courses.exactResultsCourses ||
      state.user.filter.exactMatchesOnly
    ) {
      store.dispatch(fetchCourseInfos(state.courses.exactResultsCourses));
    }
  }, 0);
};
export const throttledFilter = debounce(updateFilter, 500);

export type AppState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action<string>
>;

export default store;
