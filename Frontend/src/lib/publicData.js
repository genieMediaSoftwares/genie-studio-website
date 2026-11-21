import { createContext, useContext } from 'react';

export const PublicDataContext = createContext({});
export const usePublicData = () => useContext(PublicDataContext);
