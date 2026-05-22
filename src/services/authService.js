import api from "../axios.config";

export const authService = {
  login: async (username, password, rememberMe = false) => {
    const userType = "Library";
    try {
      const response = await api.post("/auth/login", {
        username,
        password,
        rememberMe,
        userType
      });
      return response;
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error(error.response.data.message || "Invalid credentials");
      }
      throw error.response?.data || error.message;
    }
  },

  verifyOTP: async (username, otpCode, userType) => {
    try {
      const response = await api.post("auth/verify-otp", {
        
        Username: username,
        OTPCode: otpCode,
        UserType: userType,
      });
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  resendOTP: async (username, userType) => {
    try {
      const response = await api.post("auth/resend-otp", {
        Username: username,
        UserType: userType,
      });
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout: async () => {
    try {
      const response = await api.post(
        "/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  libraryRegister: async (form) => {
    try {
      const fd = new FormData();
      fd.append('LibraryName', form.libraryName);
      fd.append('LibraryType', form.libraryType);
      fd.append('OwnerName', form.ownerName);
      fd.append('ContactPerson', form.contactPerson);
      fd.append('Email', form.email);
      fd.append('PhoneNumber', form.phoneNumber);
      fd.append('Township', form.township);
      fd.append('StateDivision', form.stateDivision);
      fd.append('Address', form.address);
      const response = await api.post('auth/library/register', fd);
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  checkRegistrationNumber: async (registrationNumber) => {
    try {
      const response = await api.get('auth/library/check-registration-number', { registrationNumber });
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  changePassword: async (currentPassword, newPassword, userType) => {
    try {
      const response = await api.post('/auth/change-password', {
        userType: userType,
        CurrentPassword: currentPassword,
        NewPassword: newPassword,
      });
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getTwoFactorStatus: async (userType) => {
    try {
      const response = await api.get('auth/get-2FA-status', { userType });
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  setTwoFactorEnabled: async (enabled, userType) => {
    try {
      const response = await api.post('auth/change-2FA-status', {
        UserType: userType,
        Enable2FA: !!enabled,
      });
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  resetPassword: async (email) => {
    try {
      const response = await api.post('auth/reset-password', null, { params: { email } });
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  validateResetToken: async (token, email, userType) => {
    try {
      const response = await api.get('auth/validate-reset-token', { token, email, userType });
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  validateEmailToken: async (token, email, userType) => {
    try {
      const response = await api.get('auth/validate-email-token', { token, email, userType });
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },


  confirmResetPassword: async (token, email, userType, newPassword) => {
    try {
      const response = await api.post('auth/confirm-reset-password', {
        Token: token,
        Email: email,
        UserType: userType,
        NewPassword: newPassword,
      });
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  confirmSetPassword: async (token, email, userType, newPassword) => {
    try {
      const response = await api.post('auth/confirm-set-password', {
        Token: token,
        Email: email,
        UserType: userType,
        NewPassword: newPassword,
      });
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
