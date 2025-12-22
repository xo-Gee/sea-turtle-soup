import React, { createContext, useContext, useState, useEffect } from 'react';
import ko from '../locales/ko';
import en from '../locales/en';
import ja from '../locales/ja';
import es from '../locales/es';
import fr from '../locales/fr';
import zhCN from '../locales/zhCN';
import zhTW from '../locales/zhTW';

const LanguageContext = createContext();

const locales = { ko, en, ja, es, fr, zhCN, zhTW };

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('ko'); // Default to Korean

    useEffect(() => {
        const savedLang = localStorage.getItem('language');
        if (savedLang && locales[savedLang]) {
            setLanguage(savedLang);
        }
    }, []);

    const changeLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key, args = {}) => {
        const keys = key.split('.');
        let value = locales[language];
        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                return key; // Return key if not found
            }
        }

        if (typeof value === 'string' && args) {
            return value.replace(/{{(\w+)}}/g, (_, k) => {
                return args[k] !== undefined ? args[k] : `{{${k}}}`;
            });
        }

        return value;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
