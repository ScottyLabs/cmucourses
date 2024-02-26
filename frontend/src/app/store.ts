import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import storage from "redux-persist/lib/storage";
import { cacheSlice, reducer as cacheReducer } from "./cache";
import { reducer as userReducer, UserState } from "./user";
import { FiltersState, reducer as filtersReducer } from "./filters";
import {
  reducer as userSchedulesReducer,
  UserSchedulesState,
} from "./userSchedules";
import { reducer as uiReducer, UIState } from "./ui";
import { reducer as instructorsReducer, InstructorsState } from "./instructors";
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
import { fetchCourseInfos, fetchCourseInfosByPage } from "./api/course";

const reducers = combineReducers({
  cache: cacheReducer,
  user: persistReducer<UserState>(
    {
      key: "root",
      version: 1,
      storage,
      stateReconciler: autoMergeLevel2,
    },
    userReducer
  ),
  filters: persistReducer<FiltersState>(
    {
      key: "filters",
      version: 1,
      storage,
      stateReconciler: autoMergeLevel2,
    },
    filtersReducer
  ),
  schedules: persistReducer<UserSchedulesState>(
    {
      key: "schedules",
      version: 1,
      storage,
      stateReconciler: autoMergeLevel2,
    },
    userSchedulesReducer
  ),
  ui: persistReducer<UIState>(
    {
      key: "ui",
      version: 1,
      storage,
      stateReconciler: autoMergeLevel2,
      blacklist: ["session"],
    },
    uiReducer
  ),
  instructors: persistReducer<InstructorsState>(
    {
      key: "instructors",
      version: 1,
      storage,
      stateReconciler: autoMergeLevel2,
    },
    instructorsReducer
  ),
});

export const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;

export const persistor = persistStore(store);

const updateFilter = () => {
  setTimeout(() => {
    const state = store.getState();
    void store.dispatch(fetchCourseInfosByPage(1));

    if (state.cache.exactResultsCourses) {
      void store.dispatch(fetchCourseInfos(state.cache.exactResultsCourses));
    }
  }, 0);
};

const debouncedFilter = debounce(updateFilter, 1000);

export const throttledFilter = () => {
  void store.dispatch(cacheSlice.actions.setCoursesLoading(true));
  debouncedFilter();
};

const debouncedInstructorFilter = debounce(() => {
  setTimeout(() => {
    const state = store.getState();
    void store.dispatch(cacheSlice.actions.selectInstructors(state.instructors.search));
    void store.dispatch(cacheSlice.actions.setInstructorsLoading(false));
  }, 0);
}, 300);

export const throttledInstructorFilter = () => {
  void store.dispatch(cacheSlice.actions.setInstructorsLoading(true));
  debouncedInstructorFilter();
}

export type AppState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action<string>
>;

export default store;
