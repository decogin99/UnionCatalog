import api from "../axios.config";

export const adminService = {
  getLibraryList: async (pageNumber = 1, libraryName = "", libraryAccess = "All", libraryStatus = "Active") => {
    try {
      const res = await api.get("admin/get-library-list", {
        pageNumber,
        libraryName,
        libraryAccess,
        libraryStatus,
      });
      return res;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  approveLibrary: async (libraryId) => {
    try {
      const response = await api.post("admin/approve-library", null, {
        params: { libraryId : libraryId },
      });
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  declineLibrary: async (libraryId) => {
    try {
      const response = await api.post("admin/decline-library", null, {
        params: { libraryId : libraryId },
      });
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  declineRegistration: async (id, note = "") => {
    try {
      const res = await api.post(`admin/decline-library`, null, {
        params: { libraryId: id, adminNote: note },
      });
      return res;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  banLibrary: async (libraryId, adminNote = "") => {
    try {
      const res = await api.post("admin/ban-library", null, {
        params: { libraryId, adminNote },
      });
      return res;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  unbanLibrary: async (libraryId) => {
    try {
      const res = await api.post("admin/unban-library", null, {
        params: { libraryId },
      });
      return res;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateRegistrationStatus: async (id, action) => {
    try {
      const res = await api.post(`admin/library-registrations/${id}/${action}`);
      return res;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getLibraryProfile: async (profileId) => {
      try {
        const res = await api.get('admin/get-library-profile', {
        params: { profileId }
      });
        return res;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },

  getLibraryVerificationDetail: async (libraryId) => {
    try {
      const res = await api.get('admin/get-library-verification-detail', {
        params: { libraryId }
      });
      return res;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};