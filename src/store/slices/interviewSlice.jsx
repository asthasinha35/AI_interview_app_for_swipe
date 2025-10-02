import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentStep: 'resume_upload',
  candidateInfo: {
    name: '',
    email: '',
    phone: '',
    resumeText: '',
  },
  interviewProgress: {
    currentQuestionIndex: -1,
    questions: [],
    answers: [],
    scores: [],
    startTime: null,
    endTime: null,
    isPaused: false,
  },
  activeTab: 'interviewee',
  hasUnfinishedSession: false,
  showWelcomeBackModal: false,
  timer: {
    remainingTime: 0,
    isRunning: false,
  },
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setCandidateInfo: (state, action) => {
      state.candidateInfo = { ...state.candidateInfo, ...action.payload };
    },
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    startInterview: (state, action) => {
      state.interviewProgress = {
        ...state.interviewProgress,
        questions: action.payload,
        currentQuestionIndex: 0,
        startTime: new Date().toISOString(),
        isPaused: false,
      };
      state.currentStep = 'interview';
    },
    submitAnswer: (state, action) => {
      const { answer, score } = action.payload;
      state.interviewProgress.answers[state.interviewProgress.currentQuestionIndex] = answer;
      state.interviewProgress.scores[state.interviewProgress.currentQuestionIndex] = score;
    },
    nextQuestion: (state) => {
      if (state.interviewProgress.currentQuestionIndex < state.interviewProgress.questions.length - 1) {
        state.interviewProgress.currentQuestionIndex += 1;
      } else {
        state.interviewProgress.endTime = new Date().toISOString();
        state.currentStep = 'completed';
      }
    },
    setTimer: (state, action) => {
      state.timer = { ...state.timer, ...action.payload };
    },
    pauseInterview: (state) => {
      state.interviewProgress.isPaused = true;
      state.timer.isRunning = false;
      state.hasUnfinishedSession = true;
    },
    resumeInterview: (state) => {
      state.interviewProgress.isPaused = false;
      state.timer.isRunning = true;
      state.hasUnfinishedSession = false;
      state.showWelcomeBackModal = false;
    },
    completeInterview: (state, action) => {
      state.interviewProgress.endTime = new Date().toISOString();
      state.currentStep = 'completed';
      state.hasUnfinishedSession = false;
      state.candidateInfo = initialState.candidateInfo;
      state.interviewProgress = initialState.interviewProgress;
    },
    checkUnfinishedSession: (state) => {
      const hasUnfinished = state.interviewProgress.questions.length > 0 && 
                           state.interviewProgress.currentQuestionIndex >= 0 &&
                           state.interviewProgress.currentQuestionIndex < state.interviewProgress.questions.length &&
                           !state.interviewProgress.endTime;
      state.hasUnfinishedSession = hasUnfinished;
      state.showWelcomeBackModal = hasUnfinished;
    },
    resetInterview: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setCandidateInfo,
  setCurrentStep,
  startInterview,
  submitAnswer,
  nextQuestion,
  setTimer,
  pauseInterview,
  resumeInterview,
  completeInterview,
  checkUnfinishedSession,
  resetInterview,
} = interviewSlice.actions;

export default interviewSlice.reducer;