import React, { createContext, useContext, useMemo, useRef, useState } from "react";

const LoadingContext = createContext({
  active: false,
  message: null,
  subMessage: null,
  start: () => () => {},
  stop: () => {},
  withLoading: async (fn) => fn(),
});

export const LoadingProvider = ({ children }) => {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState(null);
  const [subMessage, setSubMessage] = useState(null);
  const lastMsgRef = useRef({ message: null, subMessage: null });

  const start = (msg = null, sub = null) => {
    setCount((c) => c + 1);
    if (msg !== null) {
      setMessage(msg);
      lastMsgRef.current.message = msg;
    }
    if (sub !== null) {
      setSubMessage(sub);
      lastMsgRef.current.subMessage = sub;
    }
    // return stopper for convenience
    return () => stop();
  };

  const stop = () => {
    setCount((c) => Math.max(0, c - 1));
    // keep last messages for brief continuity between quick toggles
    if (count <= 1) {
      setTimeout(() => {
        setMessage(lastMsgRef.current.message);
        setSubMessage(lastMsgRef.current.subMessage);
      }, 0);
    }
  };

  const withLoading = async (fn, msg = null, sub = null) => {
    const end = start(msg, sub);
    try {
      return await fn();
    } finally {
      end();
    }
  };

  const value = useMemo(
    () => ({
      active: count > 0,
      message,
      subMessage,
      start,
      stop,
      withLoading,
    }),
    [count, message, subMessage]
  );

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
};

export const useLoading = () => useContext(LoadingContext);
