import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { LocaleProvider, readLocale, useLocale } from './locale';

afterEach(()=>{localStorage.clear();vi.restoreAllMocks();});
function Sample(){const {locale,setLocale}=useLocale();return <button onClick={()=>setLocale('zh-TW')}>{locale}</button>;}
test('locale preferences are validated and persisted without losing the current reader',()=>{
  expect(readLocale('unknown')).toBe('zh-CN');
  localStorage.setItem('history-locale','en');
  render(<LocaleProvider><Sample/></LocaleProvider>);
  fireEvent.click(screen.getByRole('button',{name:'en'}));
  expect(screen.getByRole('button',{name:'zh-TW'})).toBeInTheDocument();
  expect(localStorage.getItem('history-locale')).toBe('zh-TW');
  expect(document.documentElement.lang).toBe('zh-TW');
});
test('storage denial does not prevent language selection',()=>{
  vi.spyOn(Storage.prototype,'getItem').mockImplementation(()=>{throw Error('denied');});
  vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw Error('denied');});
  render(<LocaleProvider><Sample/></LocaleProvider>);
  fireEvent.click(screen.getByRole('button',{name:'zh-CN'}));
  expect(screen.getByRole('button',{name:'zh-TW'})).toBeInTheDocument();
});
