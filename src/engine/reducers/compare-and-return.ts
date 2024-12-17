export const getUnchangedArray = <T>(array1: T[], array2: T[]): T[] => {
  const allEqual = array1.every((item, index) => item === array2[index]);
  return allEqual ? array1 : array2;
};

export const getUnchangedObject = <T extends object>(
  object1: T,
  object2: T
): T => {
  const keys = Object.keys(object1) as (keyof T)[];
  const allEqual = keys.every((key) => object1[key] === object2[key]);
  return allEqual ? object1 : object2;
};
