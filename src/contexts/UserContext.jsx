import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { userService } from '../services/api';

// Initial user state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  subscriptionStatus: 'free',
  preferences: {
    language: 'en',
    locationEnabled: false,
    notifications: true,
    theme: 'dark'
  }
};

// Action types
const USER_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_PREFERENCES: 'UPDATE_PREFERENCES',
  UPDATE_SUBSCRIPTION: 'UPDATE_SUBSCRIPTION',
  LOGOUT: 'LOGOUT'
};

// User reducer
function userReducer(state, action) {
  switch (action.type) {
    case USER_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case USER_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
        subscriptionStatus: action.payload?.subscriptionStatus || 'free',
        preferences: {
          ...state.preferences,
          ...action.payload?.preferences
        }
      };

    case USER_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case USER_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case USER_ACTIONS.UPDATE_PREFERENCES:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload
        }
      };

    case USER_ACTIONS.UPDATE_SUBSCRIPTION:
      return {
        ...state,
        subscriptionStatus: action.payload,
        user: state.user ? {
          ...state.user,
          subscriptionStatus: action.payload
        } : null
      };

    case USER_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false
      };

    default:
      return state;
  }
}

// Create context
const UserContext = createContext();

// User provider component
export function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Load user on app start
  useEffect(() => {
    loadUser();
  }, []);

  // Load user from token
  const loadUser = async () => {
    try {
      dispatch({ type: USER_ACTIONS.SET_LOADING, payload: true });
      
      const token = localStorage.getItem('pocketjustice_token');
      if (!token) {
        dispatch({ type: USER_ACTIONS.SET_LOADING, payload: false });
        return;
      }

      const userData = await userService.getProfile();
      dispatch({ type: USER_ACTIONS.SET_USER, payload: userData });
    } catch (error) {
      console.error('Failed to load user:', error);
      // Clear invalid token
      localStorage.removeItem('pocketjustice_token');
      dispatch({ type: USER_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      dispatch({ type: USER_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: USER_ACTIONS.CLEAR_ERROR });

      const response = await userService.register(userData);
      dispatch({ type: USER_ACTIONS.SET_USER, payload: response.user });
      
      return response;
    } catch (error) {
      dispatch({ type: USER_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      dispatch({ type: USER_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: USER_ACTIONS.CLEAR_ERROR });

      const response = await userService.login(credentials);
      dispatch({ type: USER_ACTIONS.SET_USER, payload: response.user });
      
      return response;
    } catch (error) {
      dispatch({ type: USER_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await userService.logout();
      dispatch({ type: USER_ACTIONS.LOGOUT });
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      dispatch({ type: USER_ACTIONS.LOGOUT });
    }
  };

  // Update user preferences
  const updatePreferences = async (preferences) => {
    try {
      dispatch({ type: USER_ACTIONS.UPDATE_PREFERENCES, payload: preferences });
      
      if (state.isAuthenticated) {
        await userService.updateProfile({ preferences });
      } else {
        // Store preferences locally for non-authenticated users
        localStorage.setItem('pocketjustice_preferences', JSON.stringify({
          ...state.preferences,
          ...preferences
        }));
      }
    } catch (error) {
      console.error('Failed to update preferences:', error);
      dispatch({ type: USER_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Update subscription status
  const updateSubscription = (status) => {
    dispatch({ type: USER_ACTIONS.UPDATE_SUBSCRIPTION, payload: status });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: USER_ACTIONS.CLEAR_ERROR });
  };

  // Check if user has premium access
  const hasPremiumAccess = () => {
    return state.subscriptionStatus === 'premium' || state.subscriptionStatus === 'trial';
  };

  // Check if feature is available
  const hasFeatureAccess = (feature) => {
    const premiumFeatures = ['recording', 'offline_access', 'state_specific_deep_dives', 'ipfs_backup'];
    
    if (premiumFeatures.includes(feature)) {
      return hasPremiumAccess();
    }
    
    return true; // Free features
  };

  // Get user display name
  const getDisplayName = () => {
    if (!state.user) return 'Guest';
    return state.user.name || state.user.email || 'User';
  };

  const value = {
    // State
    ...state,
    
    // Actions
    register,
    login,
    logout,
    updatePreferences,
    updateSubscription,
    clearError,
    loadUser,
    
    // Computed values
    hasPremiumAccess,
    hasFeatureAccess,
    getDisplayName
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use user context
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export default UserContext;
