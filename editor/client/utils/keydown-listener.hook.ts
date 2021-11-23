import { useCallback, useEffect } from "react";

const useKeyDown = (callback: (keyCode: number) => void) => {

  const keyDownFunction = useCallback((event) => {
    callback(event)
  }, [])

  useEffect(() => {
    document.addEventListener("keydown", keyDownFunction, false);
    return () => {
      document.removeEventListener("keydown", keyDownFunction, false);
    };
  }, []);
};

export default useKeyDown