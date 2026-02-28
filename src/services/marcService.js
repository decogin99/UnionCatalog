import api from "../axios.config";

export const marcService = {
  uploadBatch: async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await api.post('Library/marc-import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res;
  },

  getBatchList: async (pageNumber = 1, pageSize = 10, search = '') => {
    const res = await api.get('Library/get-batch-list', {
      pageNumber,
      pageSize,
      search
    });
    return res;
  },

  getBibliographicList: async ({ batchId, pageNumber = 1, pageSize = 10, title = '', author = '', status = 3 }) => {
    const res = await api.get('Library/get-bibliographic-list', {
      batchId,
      pageNumber,
      pageSize,
      title,
      author,
      status
    });
    return res;
  },

  approveBibliographic: async (id, targetBookType) => {
    const res = await api.post(`Library/approve-bibliographic/${id}?targetBookType=${encodeURIComponent(targetBookType)}`);
    return res;
  },

  rejectBibliographic: async (id) => {
    const res = await api.post(`Library/reject-bibliographic/${id}`);
    return res;
  },

  approveBibliographicBulk: async (ids, targetBookType) => {
    const res = await api.post(`Library/approve-bibliographic-bulk?targetBookType=${encodeURIComponent(targetBookType)}`, ids);
    return res;
  },

  exportMARC: async (bookIds, bookType) => {
    const res = await api.post('Library/export-marc', { BookIds: bookIds, BookType: bookType }, { responseType: 'blob' });
    return res;
  }
};