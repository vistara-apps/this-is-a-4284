import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pocketjustice_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// OpenAI Service
export const openaiService = {
  async generateContent(prompt, type = 'guide') {
    try {
      const response = await api.post('/openai/generate', {
        prompt,
        type,
        max_tokens: type === 'guide' ? 500 : 100,
      });
      return response.data;
    } catch (error) {
      console.error('OpenAI generation error:', error);
      throw new Error('Failed to generate content');
    }
  },

  async translateContent(content, targetLanguage) {
    try {
      const response = await api.post('/openai/translate', {
        content,
        targetLanguage,
      });
      return response.data;
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error('Failed to translate content');
    }
  },

  async generateScriptedResponse(situation, language = 'en') {
    try {
      const response = await api.post('/openai/scripted-response', {
        situation,
        language,
      });
      return response.data;
    } catch (error) {
      console.error('Scripted response generation error:', error);
      throw new Error('Failed to generate scripted response');
    }
  }
};

// Pinata IPFS Service
export const pinataService = {
  async uploadFile(file, metadata = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('pinataMetadata', JSON.stringify({
        name: metadata.name || `recording-${Date.now()}`,
        keyvalues: {
          type: 'recording',
          timestamp: new Date().toISOString(),
          ...metadata
        }
      }));

      const response = await api.post('/pinata/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Pinata upload error:', error);
      throw new Error('Failed to upload to IPFS');
    }
  },

  async getFile(ipfsHash) {
    try {
      const response = await api.get(`/pinata/file/${ipfsHash}`);
      return response.data;
    } catch (error) {
      console.error('Pinata retrieval error:', error);
      throw new Error('Failed to retrieve from IPFS');
    }
  },

  async deleteFile(ipfsHash) {
    try {
      const response = await api.delete(`/pinata/file/${ipfsHash}`);
      return response.data;
    } catch (error) {
      console.error('Pinata deletion error:', error);
      throw new Error('Failed to delete from IPFS');
    }
  }
};

// Stripe Payment Service
export const stripeService = {
  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      const response = await api.post('/stripe/create-payment-intent', {
        amount,
        currency,
        metadata,
      });
      return response.data;
    } catch (error) {
      console.error('Stripe payment intent error:', error);
      throw new Error('Failed to create payment intent');
    }
  },

  async createSubscription(priceId, customerId) {
    try {
      const response = await api.post('/stripe/create-subscription', {
        priceId,
        customerId,
      });
      return response.data;
    } catch (error) {
      console.error('Stripe subscription error:', error);
      throw new Error('Failed to create subscription');
    }
  },

  async cancelSubscription(subscriptionId) {
    try {
      const response = await api.post('/stripe/cancel-subscription', {
        subscriptionId,
      });
      return response.data;
    } catch (error) {
      console.error('Stripe cancellation error:', error);
      throw new Error('Failed to cancel subscription');
    }
  },

  async getStripe() {
    return await stripePromise;
  }
};

// User Service
export const userService = {
  async register(userData) {
    try {
      const response = await api.post('/users/register', userData);
      if (response.data.token) {
        localStorage.setItem('pocketjustice_token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  async login(credentials) {
    try {
      const response = await api.post('/users/login', credentials);
      if (response.data.token) {
        localStorage.setItem('pocketjustice_token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  async logout() {
    localStorage.removeItem('pocketjustice_token');
  },

  async getProfile() {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw new Error('Failed to fetch profile');
    }
  },

  async updateProfile(updates) {
    try {
      const response = await api.put('/users/profile', updates);
      return response.data;
    } catch (error) {
      console.error('Profile update error:', error);
      throw new Error('Failed to update profile');
    }
  }
};

// Recording Service
export const recordingService = {
  async saveRecording(recordingData) {
    try {
      const response = await api.post('/recordings', recordingData);
      return response.data;
    } catch (error) {
      console.error('Recording save error:', error);
      throw new Error('Failed to save recording');
    }
  },

  async getRecordings(userId) {
    try {
      const response = await api.get(`/recordings/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Recordings fetch error:', error);
      throw new Error('Failed to fetch recordings');
    }
  },

  async deleteRecording(recordingId) {
    try {
      const response = await api.delete(`/recordings/${recordingId}`);
      return response.data;
    } catch (error) {
      console.error('Recording deletion error:', error);
      throw new Error('Failed to delete recording');
    }
  },

  async uploadToIPFS(recordingId) {
    try {
      const response = await api.post(`/recordings/${recordingId}/upload-ipfs`);
      return response.data;
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw new Error('Failed to upload to IPFS');
    }
  }
};

// Legal Content Service
export const legalService = {
  async getGuides(state = null, language = 'en') {
    try {
      const response = await api.get('/legal/guides', {
        params: { state, language }
      });
      return response.data;
    } catch (error) {
      console.error('Legal guides fetch error:', error);
      throw new Error('Failed to fetch legal guides');
    }
  },

  async getStateSpecificContent(state, category) {
    try {
      const response = await api.get(`/legal/state/${state}/${category}`);
      return response.data;
    } catch (error) {
      console.error('State-specific content error:', error);
      throw new Error('Failed to fetch state-specific content');
    }
  },

  async getScriptedResponses(language = 'en', state = null) {
    try {
      const response = await api.get('/legal/scripted-responses', {
        params: { language, state }
      });
      return response.data;
    } catch (error) {
      console.error('Scripted responses fetch error:', error);
      throw new Error('Failed to fetch scripted responses');
    }
  }
};

// Geolocation Service
export const locationService = {
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const locationData = await api.get('/location/reverse-geocode', {
              params: { lat: latitude, lng: longitude }
            });
            resolve({
              coordinates: { latitude, longitude },
              ...locationData.data
            });
          } catch (error) {
            console.error('Reverse geocoding error:', error);
            resolve({
              coordinates: { latitude, longitude },
              state: null,
              city: null
            });
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          reject(new Error('Failed to get location'));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }
};

export default api;
