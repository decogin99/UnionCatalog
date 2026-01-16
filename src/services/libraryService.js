import api from "../axios.config";

export const libraryService = {
  getLibraryProfile: async () => {
    try {
      const res = await api.get("Library/get-library-profile");
      return res;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateLibraryProfile: async (formData) => {
    try {
      const res = await api.put("Library/update-library-profile", formData);
      return res;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getDashboardStats: async () => {
    try {
      const res = await api.get("Library/get-dashboard-stats");
      return res;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getBarCodeRange: async (bookType, fromBarCodeId, toBarCodeId) => {
    try {
      const res = await api.get('Library/get-barcode-range', {
        bookType,
        fromBarCodeId,
        toBarCodeId,
      });
      return res;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getLabelRange: async (bookType, fromBarCodeId, toBarCodeId) => {
    try {
      const res = await api.get('Library/get-label-range', {
        bookType,
        fromBarCodeId,
        toBarCodeId,
      });
      return res;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getDDCCodes: async (ddc = null) => {
    try {
      const res = await api.get('Library/get-ddc-codes', {
        params: ddc == null ? {} : { ddc: String(ddc) }
      });
      return res;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  exportLibraryData: async (
      bookType = "",
      currentPage,
      all,
      fromBarCodeId,
      toBarCodeId
    ) => {
      try {
        const res = await api.get('Library/export-library-data', {
          params: { bookType, currentPage, all, fromBarCodeId, toBarCodeId },
          responseType: 'blob', // Ensure binary response
        });
        return res;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },
};