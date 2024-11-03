import { useState } from "react";

export const useUserId = () => {
  const [userId, setUserId] = useState<string | null>(null);

  return {
    userId,
    setUserId,
  };
};
