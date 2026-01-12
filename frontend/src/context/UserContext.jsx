// UserContext.js
import { createContext, useContext, useReducer } from 'react';

const UserContext = createContext();

const userInitialState = {
  id: null,
  name: '',
  avatarPath: '',
  birthdate: null,
  isHost: false
};

const userReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ID':
      return {
        ...state,
        id: action.payload
      };
    case 'SET_USER':
      return {
        ...state,
        ...action.payload
      };
    case 'UPDATE_USER':
      return {
        ...state,
        ...action.payload
      };
    case 'SET_HOST':
      return {
        ...state,
        isHost: action.payload
      };
    case 'SET_PLAYER_DATA':
      return {
        ...state,
        id: action.payload.id,
        name: action.payload.name,
        avatarPath: action.payload.avatar,
        birthdate: action.payload.birthdate,
        isHost: action.payload.is_host
      };
    case 'CLEAR_USER':
      return userInitialState;
    default:
      return state;
  }
};

export const UserProvider = ({ children }) => {
  const [userState, userDispatch] = useReducer(userReducer, userInitialState);

  return (
    <UserContext.Provider value={{ userState, userDispatch }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
