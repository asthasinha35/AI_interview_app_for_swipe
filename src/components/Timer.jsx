import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Statistic } from 'antd';
import { setTimer } from '../store/slices/interviewSlice';

const Timer = ({ duration, onTimeUp, isRunning }) => {
  const dispatch = useDispatch();
  const { timer } = useSelector(state => state.interview);
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    let interval;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          dispatch(setTimer({ remainingTime: newTime }));
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      onTimeUp();
      dispatch(setTimer({ isRunning: false }));
    }

    return () => clearInterval(interval);
  }, [timeLeft, isRunning, onTimeUp, dispatch]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getStatus = () => {
    if (timeLeft > duration * 0.5) return 'success';
    if (timeLeft > duration * 0.25) return 'warning';
    return 'error';
  };

  return (
    <Statistic
      title="Time Remaining"
      value={formatTime(timeLeft)}
      valueStyle={{ 
        color: timeLeft > duration * 0.5 ? '#3f8600' : timeLeft > duration * 0.25 ? '#faad14' : '#cf1322',
        fontSize: '18px',
        fontWeight: 'bold'
      }}
    />
  );
};

export default Timer;