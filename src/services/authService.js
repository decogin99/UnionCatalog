import api from "../axios.config";

export const authService = {
  login: async (username, password, rememberMe = false) => {
    try {
      const response = await api.post("/auth/login", {
        username,
        password,
        rememberMe,
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
      if (form.documentFile) {
        fd.append('DocumentFile', form.documentFile);
      } else {
        fd.append('DocumentFile', null);
      }
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

  getTwoFactorStatus: async () => {
    try {
      const response = await api.get('/auth/2FA/status');
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  setTwoFactorEnabled: async (enabled) => {
    try {
      const response = await api.post('/auth/2FA/status', {
        Enabled: !!enabled,
      });
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
