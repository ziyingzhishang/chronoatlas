import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { translateText } from './text';

export type Locale = 'zh-CN'|'zh-HK'|'zh-TW'|'en';
export const localeNames:Record<Locale,string>={
  'zh-CN':'简体中文（中国大陆）','zh-HK':'繁體中文（香港）','zh-TW':'繁體中文（台灣）',en:'English',
};
export function readLocale(value:string|null):Locale {
  return value && Object.hasOwn(localeNames,value) ? value as Locale : 'zh-CN';
}
function initialLocale():Locale {
  try{return readLocale(localStorage.getItem('history-locale'));}catch{return 'zh-CN';}
}
const LocaleContext=createContext<{locale:Locale;setLocale:(locale:Locale)=>void;t:(text:string)=>string}>({
  locale:'zh-CN',setLocale:()=>{},t:text=>text,
});
export function LocaleProvider({children}:{children:ReactNode}){
  const [locale,setLocale]=useState<Locale>(initialLocale);
  const t=useCallback((text:string)=>translateText(text,locale),[locale]);
  useEffect(()=>{
    document.documentElement.lang=locale;
    document.title=locale==='en'?'China History · Lands Through Time':t('中国历史 · 山河变迁');
    try{localStorage.setItem('history-locale',locale);}catch{/* Optional preference storage. */}
  },[locale,t]);
  const value=useMemo(()=>({locale,setLocale,t}),[locale,t]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
export const useLocale=()=>useContext(LocaleContext);
