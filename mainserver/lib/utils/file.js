export const generateKey = (originalname) => {
    const key =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15) +
        originalname;
    return key;
};
