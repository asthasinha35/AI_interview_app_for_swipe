import { configureStore } from '@reduxjs/toolkit'
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import candidateReducer from './slices/candidateSlice.jsx'
import interviewReducer from './slices/interviewSlice.jsx'

// Persist configuration
const candidatePersistConfig = {
  key: 'candidates',
  storage,
}

const interviewPersistConfig = {
  key: 'interview',
  storage,
}

// Create persisted reducers
const persistedCandidateReducer = persistReducer(candidatePersistConfig, candidateReducer)
const persistedInterviewReducer = persistReducer(interviewPersistConfig, interviewReducer)

// Create store
export const store = configureStore({
  reducer: {
    candidates: persistedCandidateReducer,
    interview: persistedInterviewReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)