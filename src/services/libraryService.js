import api from "../axios.config";

export const libraryService = {
  getLibraryProfile: async (profileId = null) => {
    try {
      const res = await api.get("Library/get-library-profile", { params: profileId ? { profileId } : {} });
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

  getBarcodeList: async (bookType) => {
    try {
      const res = await api.get('Library/get-barcode-list', {
        bookType
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

  getLabelList: async (bookType) => {
    try {
      const res = await api.get('Library/get-label-list', {
        bookType
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

  getLibraryAccessStatus: async () => {
    try {
      const res = await api.get('Library/get-library-access-status');
      return res;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // verifyLibraryAccess: async (officialCode, documentFile) => {
  //   try {
  //     const fd = new FormData();
  //     fd.append('OfficialLibraryRegCode', (officialCode || '').trim());
  //     fd.append('DocumentFile', documentFile);
  //     const res = await api.post('Library/verify-library-access', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  //     return res;
  //   } catch (error) {
  //     throw error.response?.data || error.message;
  //   }
  // },

  verifyLibraryAccess: async () => {
    try {
      const res = await api.put('Library/verify-library-access');
      return res;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  exportLibraryData: async (
      bookType = "",
      ids = [],
      all = false
    ) => {
      try {
        const qs = new URLSearchParams();
        qs.append('bookType', String(bookType || ''));
        (Array.isArray(ids) ? ids : []).forEach(id => { if (id) qs.append('ids', String(id)); });
        qs.append('all', String(!!all));
        const res = await api.get(`Library/export-excel?${qs.toString()}`, {
          responseType: 'blob',
        });
        return res;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },

  getVisibilityStatus: async () => {
    try {
      const res = await api.get('Library/get-visibility-status');
      return res;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  changeVisibilityStatus: async (visibility) => {
    try {
      const res = await api.post('Library/change-visibility-status', null, {
        params: { visibility }
      });
      return res;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  getVerifiedLibraries: async (pageNumber = 1, pageSize = 6) => {
    try {
      const res = await api.get('Library/get-verified-libraries', { params: { pageNumber, pageSize } });
      return res;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getJoinedMembers: async (pageNumber = 1, pageSize = 20) => {
    try{
      const res = await api.get('Library/get-joined-members', { params: { pageNumber, pageSize } });
      return res;
    }
    catch(error){
      throw error.response?.data || error.message;
    }
  }
};