import { useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

const useAutoLogout = (isAdmin) => {
  useEffect(() => {
    if (!isAdmin) return;

    let timer;
    const TIMEOUT = 15 * 60 * 1000; 

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        alert("Session expired due to inactivity.");
        signOut(auth);
        window.location.href = "/";
      }, TIMEOUT);
    };


    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    
    resetTimer();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
    };
  }, [isAdmin]);
};

export default useAutoLogout;