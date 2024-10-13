import { v4 as uuidv4 } from "uuid";

export const useUserId = () => {
  const storedUserId = localStorage.getItem("userId");
  if (storedUserId) {
    return storedUserId;
  }
  const userId = uuidv4();
  localStorage.setItem("userId", userId);
  return userId;
};
