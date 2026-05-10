import { BASE_URL } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper function to make API calls with authentication
const apiCall = async (endpoint, method = 'GET', data = null, includeAuth = true) => {
  try {
    const headers = {};

    // Add auth token if needed
    if (includeAuth) {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
    }

    const options = {
      method,
      headers,
    };

    if (data) {
      if (data instanceof FormData) {
        // Let fetch set the correct multipart content-type and boundary
        options.body = data;
      } else {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(data);
      }
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);

    if (!response.ok) {
      let errorText = `HTTP ${response.status}`;
      const responseBody = await response.text();
      try {
        const errorData = JSON.parse(responseBody);
        errorText = errorData.detail || errorData.error || JSON.stringify(errorData);
      } catch (parseError) {
        errorText = responseBody || errorText;
      }
      throw new Error(errorText);
    }

    const responseText = await response.text();
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${responseText}`);
    }
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
};

// Auth API calls
export const authAPI = {
  register: (name, email, password) =>
    apiCall('/api/auth/register/', 'POST', { name, email, password }, false),
  
  login: (email, password) =>
    apiCall('/api/auth/login/', 'POST', { email, password }, false),
  
  logout: () => AsyncStorage.removeItem('authToken'),
};

// Rooms API calls
export const roomsAPI = {
  listRooms: () =>
    apiCall('/api/rooms/', 'GET', null, false),
  
  getRoomDetail: (roomId) =>
    apiCall(`/api/rooms/${roomId}/`, 'GET', null, false),
  
  checkAvailability: (roomType, checkIn, checkOut) =>
    apiCall(`/api/rooms/availability/`, 'POST', { room_type: roomType, check_in: checkIn, check_out: checkOut }, false),
};

// Reservations API calls
export const reservationsAPI = {
  createReservation: (roomId, guestName, contact, checkIn, checkOut, paymentMethod, paymentReference, receiptScreenshot) => {
    const formData = new FormData();
    formData.append('room_id', roomId);
    formData.append('guest_name', guestName);
    formData.append('contact', contact);
    formData.append('check_in', checkIn);
    formData.append('check_out', checkOut);
    formData.append('payment_method', paymentMethod);
    formData.append('payment_reference', paymentReference);
    
    if (receiptScreenshot) {
      formData.append('receipt_screenshot', {
        uri: receiptScreenshot,
        type: 'image/jpeg',
        name: 'receipt.jpg',
      });
    }

    return apiCall('/api/reservations/', 'POST', formData, true);
  },

  getUserReservations: () =>
    apiCall('/api/user/reservations/', 'GET'),

  getReservationDetail: (reservationId) =>
    apiCall(`/api/reservations/${reservationId}/`, 'GET'),
};

// User API calls
export const userAPI = {
  getProfile: () =>
    apiCall('/profile/', 'GET'),
  
  updateProfile: (firstName, lastName, email) =>
    apiCall('/profile/', 'PUT', { first_name: firstName, last_name: lastName, email }),
};

export default {
  authAPI,
  roomsAPI,
  reservationsAPI,
  userAPI,
};
