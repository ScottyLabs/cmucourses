import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import { fetchCourseInfos, reducer as coursesReducer } from './courses';
import debounce from "lodash/debounce";

export function makeStore() {
  return configureStore({
    reducer: { courses: coursesReducer },
  })
}

const store = makeStore();

const updateFilter = () => {
  setTimeout(() => store.dispatch(fetchCourseInfos(1)), 0);
};
export const throttledFilter = debounce(updateFilter, 500);

export type AppState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action<string>
>

export default store
