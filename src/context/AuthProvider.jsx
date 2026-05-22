import { createContext, useContext, useMemo, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const LanguageContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('uc_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('uc_language');
    return saved === 'mm' ? 'mm' : 'en';
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('uc_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('uc_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('uc_language', language);
  }, [language]);

  const authValue = useMemo(() => ({ user, setUser }), [user]);
  const languageValue = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage: () => setLanguage((prev) => (prev === 'en' ? 'mm' : 'en')),
    }),
    [language]
  );

  return (
    <AuthContext.Provider value={authValue}>
      <LanguageContext.Provider value={languageValue}>{children}</LanguageContext.Provider>
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export const useLanguage = () => useContext(LanguageContext);