import api from "../axios.config";

export const adminService = {
  getLibraryList: async (pageNumber = 1, libraryName = "", status = "All") => {
    try {
      const res = await api.get("admin/get-library-list", {
        pageNumber,
        libraryName,
        status,
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

  approveRegistration: async (id) => {
    return adminService.updateRegistrationStatus(id, "approve");
  },

  declineRegistration: async (id) => {
    return adminService.updateRegistrationStatus(id, "decline");
  },

  banRegistration: async (id) => {
    return adminService.updateRegistrationStatus(id, "ban");
  },
};