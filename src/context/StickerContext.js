// StickerContext.js
import React, { createContext, useState, useContext } from 'react';

const StickerContext = createContext();

export const StickerProvider = ({ children }) => {
  const [userStickers, setUserStickers] = useState([]);

  return (
    <StickerContext.Provider value={{ userStickers, setUserStickers }}>
      {children}
    </StickerContext.Provider>
  );
};

export const useSticker = () => {
  return useContext(StickerContext);
};
