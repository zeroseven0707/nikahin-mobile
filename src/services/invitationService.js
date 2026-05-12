import api from '../config/api';

export const authService = {
  /**
   * Login user
   */
  login: async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Register new user
   */
  register: async (name, email, password, password_confirmation) => {
    try {
      const response = await api.post('/register', {
        name,
        email,
        password,
        password_confirmation,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: async (token) => {
    try {
      const response = await api.post('/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user profile
   */
  getProfile: async (token) => {
    try {
      const response = await api.get('/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (token, data) => {
    try {
      const response = await api.put('/profile', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Change password
   */
  changePassword: async (token, data) => {
    try {
      const response = await api.post('/change-password', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete account
   */
  deleteAccount: async (token, data) => {
    try {
      const response = await api.delete('/account', {
        headers: { Authorization: `Bearer ${token}` },
        data: data
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const invitationService = {
  /**
   * Get all user invitations
   */
  getInvitations: async (token) => {
    try {
      const response = await api.get('/invitations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get invitation detail
   */
  getInvitation: async (token, id) => {
    try {
      const response = await api.get(`/invitations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new invitation
   */
  createInvitation: async (token, data) => {
    try {
      const response = await api.post('/invitations', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update invitation
   */
  updateInvitation: async (token, id, data) => {
    try {
      const response = await api.put(`/invitations/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete invitation
   */
  deleteInvitation: async (token, id) => {
    try {
      const response = await api.delete(`/invitations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Publish invitation
   */
  publishInvitation: async (token, id) => {
    try {
      const response = await api.post(`/invitations/${id}/publish`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Unpublish invitation
   */
  unpublishInvitation: async (token, id) => {
    try {
      const response = await api.post(`/invitations/${id}/unpublish`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get invitation statistics
   */
  getStatistics: async (token, id) => {
    try {
      const response = await api.get(`/invitations/${id}/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get gift orders for an invitation
   */
  getGifts: async (token, invitationId) => {
    try {
      const response = await api.get(`/invitations/${invitationId}/gifts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Toggle gift feature on/off
   */
  toggleGift: async (token, invitationId, enabled) => {
    try {
      const response = await api.post(
        `/invitations/${invitationId}/gift-toggle`,
        { gift_enabled: enabled },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get bank accounts for an invitation
   */
  getBankAccounts: async (token, invitationId) => {
    try {
      const response = await api.get(`/invitations/${invitationId}/bank-accounts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add a bank account
   */
  addBankAccount: async (token, invitationId, data) => {
    try {
      const response = await api.post(
        `/invitations/${invitationId}/bank-accounts`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update a bank account
   */
  updateBankAccount: async (token, invitationId, accountId, data) => {
    try {
      const response = await api.put(
        `/invitations/${invitationId}/bank-accounts/${accountId}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a bank account
   */
  deleteBankAccount: async (token, invitationId, accountId) => {
    try {
      const response = await api.delete(
        `/invitations/${invitationId}/bank-accounts/${accountId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const guestService = {
  /**
   * Get all guests for invitation
   */
  getGuests: async (token, invitationId) => {
    try {
      const response = await api.get(`/invitations/${invitationId}/guests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add new guest
   */
  addGuest: async (token, invitationId, data) => {
    try {
      const response = await api.post(`/invitations/${invitationId}/guests`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update guest
   */
  updateGuest: async (token, invitationId, guestId, data) => {
    try {
      const response = await api.put(`/invitations/${invitationId}/guests/${guestId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete guest
   */
  deleteGuest: async (token, invitationId, guestId) => {
    try {
      const response = await api.delete(`/invitations/${invitationId}/guests/${guestId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Generate / regenerate QR token for a guest
   */
  generateQr: async (token, invitationId, guestId) => {
    try {
      const response = await api.post(
        `/invitations/${invitationId}/guests/${guestId}/generate-qr`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Check-in a guest by QR token (called after scanning)
   */
  checkIn: async (token, invitationId, qrToken) => {
    try {
      const response = await api.post(
        `/invitations/${invitationId}/checkin`,
        { qr_token: qrToken },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Check-out a guest by QR token
   */
  checkOut: async (token, invitationId, qrToken) => {
    try {
      const response = await api.post(
        `/invitations/${invitationId}/checkout`,
        { qr_token: qrToken },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reset check-in status for a guest
   */
  resetCheckIn: async (token, invitationId, guestId) => {
    try {
      const response = await api.post(
        `/invitations/${invitationId}/guests/${guestId}/reset-checkin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reset check-out status for a guest
   */
  resetCheckOut: async (token, invitationId, guestId) => {
    try {
      const response = await api.post(
        `/invitations/${invitationId}/guests/${guestId}/reset-checkout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Scan QR for souvenir pickup (souvenir ke-1)
   */
  souvenirScan: async (token, invitationId, qrToken) => {
    try {
      const response = await api.post(
        `/invitations/${invitationId}/souvenir-scan`,
        { qr_token: qrToken },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Scan QR for souvenir ke-2 (multi souvenir)
   */
  souvenirScan2: async (token, invitationId, qrToken) => {
    try {
      const response = await api.post(
        `/invitations/${invitationId}/souvenir-scan-2`,
        { qr_token: qrToken },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reset souvenir status for a guest
   */
  resetSouvenir: async (token, invitationId, guestId) => {
    try {
      const response = await api.post(
        `/invitations/${invitationId}/guests/${guestId}/reset-souvenir`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reset souvenir ke-2 status for a guest
   */
  resetSouvenir2: async (token, invitationId, guestId) => {
    try {
      const response = await api.post(
        `/invitations/${invitationId}/guests/${guestId}/reset-souvenir-2`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get scan analytics (check-in + souvenir) for an invitation
   */
  getScanAnalytics: async (token, invitationId) => {
    try {
      const response = await api.get(
        `/invitations/${invitationId}/scan-analytics`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Import guests from Excel/CSV file
   */
  importGuests: async (token, invitationId, fileUri, fileName, mimeType) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: mimeType,
      });
      const response = await api.post(
        `/invitations/${invitationId}/guests/import`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get PDF export URL (opened in browser)
   */
  getExportPdfUrl: (invitationId) => {
    return `${require('../config/api').API_BASE_URL}/invitations/${invitationId}/guests/export-pdf`;
  },

  /**
   * Get import template download URL
   */
  getImportTemplateUrl: () => {
    return `${require('../config/api').API_BASE_URL}/guests/import-template`;
  },
};

export const galleryService = {
  /**
   * Get all gallery photos for an invitation
   */
  getPhotos: async (token, invitationId) => {
    try {
      const response = await api.get(`/invitations/${invitationId}/gallery`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Upload a photo to the gallery
   */
  uploadPhoto: async (token, invitationId, imageUri, fileName, mimeType) => {
    try {
      const formData = new FormData();
      formData.append('photo', { uri: imageUri, name: fileName, type: mimeType });
      const response = await api.post(
        `/invitations/${invitationId}/gallery`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // longer timeout for uploads
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a photo from the gallery
   */
  deletePhoto: async (token, invitationId, photoId) => {
    try {
      const response = await api.delete(
        `/invitations/${invitationId}/gallery/${photoId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reorder gallery photos
   */
  reorderPhotos: async (token, invitationId, photos) => {
    try {
      const response = await api.post(
        `/invitations/${invitationId}/gallery/reorder`,
        { photos },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const rsvpService = {
  /**
   * Get all RSVPs for invitation
   */
  getRsvps: async (token, invitationId) => {
    try {
      const response = await api.get(`/invitations/${invitationId}/rsvps`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const paymentService = {
  /**
   * Create Midtrans Snap transaction and get snap_token
   */
  createTransaction: async (token, invitationId) => {
    try {
      const response = await api.post(
        `/invitations/${invitationId}/payment/create`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Check payment status for an invitation
   */
  getStatus: async (token, invitationId) => {
    try {
      const response = await api.get(
        `/invitations/${invitationId}/payment/status`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
