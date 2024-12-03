let globalUserId: string | undefined = undefined;

const setUserId = (userId: string) => {
  globalUserId = userId;
};

export const useUserId = () => {
  return {
    userId: globalUserId,
    setUserId,
  };
};
