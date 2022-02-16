import { useCallback, useState } from "react";

export default function useArray(initial = []) {
  const [array, setArray] = useState(initial);
  const addElement = useCallback((element) => {
    setArray([element, ...array]);
  }, [array]);
  const removeElement = useCallback((element) => {
    const copy = [...array];
    copy.splice(copy.indexOf(element), 1);
    setArray(copy);
  }, [array]);

  return [array, addElement, removeElement];
}
