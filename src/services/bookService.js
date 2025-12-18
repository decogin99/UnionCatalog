import api from "../axios.config";

export const bookService = {
  getBookList: async (pageNumber = 1, title = "", author = "", bookType = "") => {
    try {
      const res = await api.get('Book/get-book-list', { 
        pageNumber,
        title,
        author,
        bookType,
      });
      return res;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  addBook: async (form, bookType) => {
    try {
      const fd = new FormData();
      fd.append('BookType', (bookType || '').trim());
      if (form.BookCoverFile) fd.append('BookCoverFile', form.BookCoverFile);
      fd.append('ISBN', (form.ISBN || '').trim());
      fd.append('Title', (form.Title || '').trim());
      if (form.SubTitle && form.SubTitle.trim()) fd.append('SubTitle', form.SubTitle.trim());
      fd.append('Author', (form.Author || '').trim());
      if (form.Edition && form.Edition.trim()) fd.append('Edition', form.Edition.trim());
      fd.append('Publisher', (form.Publisher || '').trim());
      const year = parseInt(form.PublishedYear, 10);
      if (!Number.isNaN(year)) fd.append('PublishedYear', String(year));
      const pages = parseInt(form.NumberOfPages, 10);
      if (!Number.isNaN(pages)) fd.append('NumberOfPages', String(pages));
      if (form.Description && form.Description.trim()) fd.append('Description', form.Description.trim());
      const res = await api.post('Book/add-book', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      return res;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateBook: async (id, form, bookType) => {
    try {
      const fd = new FormData();
      fd.append('BookType', bookType);
      fd.append('ItemBarCodeID', form.ItemBarCodeID);
      if (form.BookCoverFile) fd.append('BookCoverFile', form.BookCoverFile);
      fd.append('ISBN', form.ISBN);
      fd.append('Title', form.Title);
      if (form.SubTitle) fd.append('SubTitle', form.SubTitle);
      fd.append('Author', form.Author);
      if (form.Edition) fd.append('Edition', form.Edition);
      fd.append('Publisher', form.Publisher);
      if (form.PublishedYear !== '') fd.append('PublishedYear', form.PublishedYear);
      if (form.NumberOfPages !== '') fd.append('NumberOfPages', form.NumberOfPages);
      if (form.Description) fd.append('Description', form.Description);
      fd.append('Id', id);
      const res = await api.post('books/update', fd);
      return res;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getBookById: async (id, bookType) => {
    try {
      const res = await api.get('books/get', { id, bookType });
      return res;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getBookDetails: async (bookId, bookType) => {
    try {
      const res = await api.get(`Book/get-book-details/${bookId}`, { bookType });
      return res;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateBookDetails: async (bookId, form, bookType) => {
    try {
      const fd = new FormData();
      fd.append('BookID', String(bookId));
      fd.append('BookType', (bookType || '').trim());
      if (form.BookCoverFile) fd.append('BookCoverFile', form.BookCoverFile);
      fd.append('RemoveBookCover', String(!!form.RemoveBookCover));
      fd.append('ISBN', (form.ISBN || '').trim());
      fd.append('Title', (form.Title || '').trim());
      if (form.SubTitle && form.SubTitle.trim()) fd.append('SubTitle', form.SubTitle.trim());
      fd.append('Author', (form.Author || '').trim());
      if (form.Edition && form.Edition.trim()) fd.append('Edition', form.Edition.trim());
      fd.append('Publisher', (form.Publisher || '').trim());
      const year = parseInt(form.PublishedYear, 10);
      if (!Number.isNaN(year)) fd.append('PublishedYear', String(year));
      const pages = parseInt(form.NumberOfPages, 10);
      if (!Number.isNaN(pages)) fd.append('NumberOfPages', String(pages));
      if (form.Description && form.Description.trim()) fd.append('Description', form.Description.trim());
      const res = await api.put(`Book/update-book/${bookId}`, fd);
      return res;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteBook: async (bookId, bookType) => {
    try {
      const res = await api.delete(`Book/delete-book/${bookId}?bookType=${encodeURIComponent(bookType)}`);
      return res;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};