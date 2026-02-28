import api from "../axios.config";

export const bookService = {
  getBookList: async (
    pageNumber = 1,
    bookType = "",
    filterField = "",
    filterQuery = "",
    advTitleTerm = "",
    advTitleMode = "starts",
    advAuthorTerm = "",
    advAuthorMode = "starts",
    advYearFrom = 0,
    advYearTo = 0,
    profileId = null,
    advDateFrom = "",
    advDateTo = ""
  ) => {
    try {
      const res = await api.get('Book/get-book-list', {
        pageNumber,
        bookType,
        filterField,
        filterQuery,
        advTitleTerm,
        advTitleMode,
        advAuthorTerm,
        advAuthorMode,
        advYearFrom,
        advYearTo,
        profileId,
        advDateFrom,
        advDateTo,
      });
      return res;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getBookCopyList: async (bookId, bookType) => {
    try {
      const res = await api.get(`Book/get-book-copy-list/${bookId || '00000000-0000-0000-0000-000000000000'}`, {
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

      // Required
      fd.append('BookType', (bookType || '').trim());
      fd.append('Title', (form.Title || '').trim());
      fd.append('Initial', (form.Initial || '').trim());
      fd.append('Author', (form.Author || '').trim());

      // Cover
      if (form.BookCover && form.BookCover.trim()) fd.append('BookCover', form.BookCover.trim());
      if (form.BookCoverFile) fd.append('BookCoverFile', form.BookCoverFile);
      fd.append('RemoveBookCover', String(!!form.RemoveBookCover));

      // Optional strings
      if (form.ISBN && form.ISBN.trim()) fd.append('ISBN', form.ISBN.trim());
      if (form.SubTitle && form.SubTitle.trim()) fd.append('SubTitle', form.SubTitle.trim());
      if (form.Edition && form.Edition.trim()) fd.append('Edition', form.Edition.trim());
      if (form.Publisher && form.Publisher.trim()) fd.append('Publisher', form.Publisher.trim());
      if (form.Category && form.Category.trim()) fd.append('Category', form.Category.trim());
      if (form.SubjectHeadings && form.SubjectHeadings.trim()) fd.append('SubjectHeadings', form.SubjectHeadings.trim());
      if (form.AccessionNo && form.AccessionNo.trim()) fd.append('AccessionNo', form.AccessionNo.trim());
      if (form.BarcodeNo && form.BarcodeNo.trim()) fd.append('BarcodeNo', form.BarcodeNo.trim());
      if (form.ClassNo && form.ClassNo.trim()) fd.append('ClassNo', form.ClassNo.trim());
      if (form.CallNo && form.CallNo.trim()) fd.append('CallNo', form.CallNo.trim());
      if (form.Translator && form.Translator.trim()) fd.append('Translator', form.Translator.trim());
      if (form.Editor && form.Editor.trim()) fd.append('Editor', form.Editor.trim());
      if (form.Place && form.Place.trim()) fd.append('Place', form.Place.trim());
      if (form.Pagination && form.Pagination.trim()) fd.append('Pagination', form.Pagination.trim());
      if (form.Illustration && form.Illustration.trim()) fd.append('Illustration', form.Illustration.trim());
      if (form.Size && form.Size.trim()) fd.append('Size', form.Size.trim());
      if (form.SOR && form.SOR.trim()) fd.append('SOR', form.SOR.trim()); 
      if (form.Summary && form.Summary.trim()) fd.append('Summary', form.Summary.trim());
      if (form.Remarks && form.Remarks.trim()) fd.append('Remarks', form.Remarks.trim());
      if (form.RegistrationDate) fd.append('RegistrationDate', form.RegistrationDate);

      // Optional numbers
      const year = parseInt(form.PublishedYear, 10);
      if (!Number.isNaN(year)) fd.append('PublishedYear', String(year));
      const pages = parseInt(form.NumberOfPages, 10);
      if (!Number.isNaN(pages)) fd.append('NumberOfPages', String(pages));
      const copies = parseInt(form.NoOfCopies, 10);
      if (!Number.isNaN(copies)) fd.append('NoOfCopies', String(copies));
      const price = parseFloat(form.Price);
      if (!Number.isNaN(price)) fd.append('Price', String(price));
      
      const res = await api.post('Book/add-book', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      return res;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getBookInfo: async (bookId, bookType) => {
    try {
      const res = await api.get(`Book/get-book-info/${bookId || '00000000-0000-0000-0000-000000000000'}`, {
        bookType,
      });
      return res;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateBookInfo: async (bookId, form, bookType) => {
    try {
      const fd = new FormData();

      // Required
      fd.append('BookId', String(bookId));
      fd.append('BookType', (bookType || '').trim());
      fd.append('Title', (form.Title || '').trim());
      fd.append('Initial', (form.Initial || '').trim());
      fd.append('Author', (form.Author || '').trim());

      // Cover
      if (form.BookCover && form.BookCover.trim()) fd.append('BookCover', form.BookCover.trim());
      if (form.BookCoverFile) fd.append('BookCoverFile', form.BookCoverFile);
      fd.append('RemoveBookCover', String(!!form.RemoveBookCover));

      // Optional strings
      if (form.ISBN && form.ISBN.trim()) fd.append('ISBN', form.ISBN.trim());
      if (form.SubTitle && form.SubTitle.trim()) fd.append('SubTitle', form.SubTitle.trim());
      if (form.Edition && form.Edition.trim()) fd.append('Edition', form.Edition.trim());
      if (form.Publisher && form.Publisher.trim()) fd.append('Publisher', form.Publisher.trim());
      if (form.Category && form.Category.trim()) fd.append('Category', form.Category.trim());
      if (form.SubjectHeadings && form.SubjectHeadings.trim()) fd.append('SubjectHeadings', form.SubjectHeadings.trim());
      if (form.ClassNo && form.ClassNo.trim()) fd.append('ClassNo', form.ClassNo.trim());
      if (form.Translator && form.Translator.trim()) fd.append('Translator', form.Translator.trim());
      if (form.Editor && form.Editor.trim()) fd.append('Editor', form.Editor.trim());
      if (form.Place && form.Place.trim()) fd.append('Place', form.Place.trim());
      if (form.Pagination && form.Pagination.trim()) fd.append('Pagination', form.Pagination.trim());
      if (form.Illustration && form.Illustration.trim()) fd.append('Illustration', form.Illustration.trim());
      if (form.Size && form.Size.trim()) fd.append('Size', form.Size.trim());
      if (form.SOR && form.SOR.trim()) fd.append('SOR', form.SOR.trim());
      if (form.Summary && form.Summary.trim()) fd.append('Summary', form.Summary.trim());
      if (form.Remarks && form.Remarks.trim()) fd.append('Remarks', form.Remarks.trim());
      if (form.RegistrationDate) fd.append('RegistrationDate', form.RegistrationDate);

      // Optional numbers
      const year = parseInt(form.PublishedYear, 10);
      if (!Number.isNaN(year)) fd.append('PublishedYear', String(year));
      const pages = parseInt(form.NumberOfPages, 10);
      if (!Number.isNaN(pages)) fd.append('NumberOfPages', String(pages));
      const price = parseFloat(form.Price);
      if (!Number.isNaN(price)) fd.append('Price', String(price));

      const res = await api.put(`Book/update-book-info/${bookId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      return res;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getBookDetails: async (bookId, bookType, publicId = null) => {
    try {
      const res = await api.get(`Book/get-book-details/${bookId || '00000000-0000-0000-0000-000000000000'}`, {
        bookType,
        publicId,
      });
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
  },

  addBookCopy: async (bookId, bookType) => {
    try {
      const res = await api.post(`Book/add-book-copy/${bookId || '00000000-0000-0000-0000-000000000000'}?bookType=${encodeURIComponent(bookType)}`);
      return res;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  editBookCopy: async (bookCopyId, bookId, bookType, accessionNo, barCodeId) => {
    try {
      const acc = Number.parseInt(accessionNo, 10);
      const res = await api.post(`Book/edit-book-copy/${bookCopyId}?bookId=${encodeURIComponent(bookId)}&bookType=${encodeURIComponent(bookType)}&accessionNo=${Number.isNaN(acc) ? '' : acc}&barCodeId=${encodeURIComponent(barCodeId || '')}`);
      return res;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteBookCopy: async (bookCopyId, bookType) => {
    try {
      const res = await api.delete(`Book/delete-book-copy/${bookCopyId}?bookType=${encodeURIComponent(bookType)}`);
      return res;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};