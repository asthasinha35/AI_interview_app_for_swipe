import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  candidates: [],
  selectedCandidate: null,
  searchTerm: '',
  sortBy: 'score',
  sortOrder: 'desc',
};

const candidateSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    addCandidate: (state, action) => {
      state.candidates.push(action.payload);
    },
    updateCandidate: (state, action) => {
      const index = state.candidates.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.candidates[index] = action.payload;
      }
    },
    setSelectedCandidate: (state, action) => {
      state.selectedCandidate = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setSort: (state, action) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
  },
});

export const { 
  addCandidate, 
  updateCandidate, 
  setSelectedCandidate, 
  setSearchTerm, 
  setSort 
} = candidateSlice.actions;

export default candidateSlice.reducer;