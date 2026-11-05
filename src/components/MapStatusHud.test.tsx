import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';
import { LocaleProvider } from '../i18n/locale';
import { getHistoricalState } from '../domain/history-state';
import { polityDisplayName } from '../presentation/map-status';
import { MapStatusHud } from './MapStatusHud';

afterEach(() => localStorage.clear());

test('presents year, era, time range, and distance in reader order', async () => {
  const onToggle = vi.fn();
  render(<LocaleProvider><MapStatusHud
    yearLabel="800年"
    eraLabel="唐"
    viewLabel="王朝至今"
    distanceLabel="距今1226年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={onToggle}
  /></LocaleProvider>);

  const button = screen.getByRole('button', { name: '当前历史状态' });
  expect(within(button).getByText('800年')).toHaveClass('map-status-year');
  expect(button.textContent).toBe('800年唐王朝至今距今1226年当前视窗 · 前2070年—2026年');
  expect(button).toHaveAttribute('aria-expanded', 'false');
  await userEvent.click(button);
  expect(onToggle).toHaveBeenCalledOnce();
});

test('omits the era element when no readable polity name is available', () => {
  const { container } = render(<LocaleProvider><MapStatusHud
    yearLabel="前1500年"
    viewLabel="王朝至今"
    distanceLabel="距今3525年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  expect(container.querySelector('.map-status-era')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '当前历史状态' })).not.toHaveTextContent(/undefined|polity-|unknown/i);
});

test('renders the Gengshi to Eastern Han transition label for year 25', () => {
  const state = getHistoricalState(25);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今2001年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  expect(screen.getByRole('button', { name: '当前历史状态' })).toHaveTextContent('更始—东汉交替');
});

test.each([
  [23, '新朝—更始交替；更始在宛形成、年内入长安；匈奴、高句丽、新罗并存'],
  [24, '更始自洛阳迁都长安（年内转换）；匈奴、高句丽、新罗并存'],
] as const)('renders the annual Gengshi transition for year %s', (year, expectedLabel) => {
  const state = getHistoricalState(year);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今2002年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  expect(screen.getByRole('button', { name: '当前历史状态' })).toHaveTextContent(expectedLabel);
});

test('renders Liu Bei’s death in the Three Kingdoms status for year 223', () => {
  const state = getHistoricalState(223);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今1803年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  const status = screen.getByRole('button', { name: '当前历史状态' });
  expect(status).toHaveTextContent('魏、蜀汉、吴并存；刘备卒于永安、刘禅继位');
  expect(status).toHaveTextContent('洛阳、成都、武昌为中心；疆域未定');
});

test('renders Wuchang as the Wu King center in the 221 HUD', () => {
  const state = getHistoricalState(221);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今1805年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  const status = screen.getByRole('button', { name: '当前历史状态' });
  expect(status).toHaveTextContent('吴王受魏封、迁都武昌');
  expect(status).toHaveTextContent('洛阳、成都、武昌为中心参照；各方疆域未定');
});

test('renders the 347 Chengdu control sequence with its year phases in the HUD', () => {
  const state = getHistoricalState(347);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今1679年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  const status = screen.getByRole('button', { name: '当前历史状态' });
  expect(status).toHaveTextContent('桓温春季攻取成都后还江陵；四月邓定、隗文等复据成都');
  expect(status).toHaveTextContent('成都为控制转折参照；疆域未定；东晋、新罗并存');
});

test.each([
  [351, '前秦称天王；长安为政治中心；五丈原为区域战事参照；疆域未定；东晋、新罗并存'],
  [352, '前秦称帝；长安为政治中心；石安沿革记载有异说；疆域未定；前燕、东晋、新罗并存'],
] as const)('renders the Former Qin foundation and map evidence in the %s HUD', (year, expected) => {
  const state = getHistoricalState(year);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今1670年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  expect(screen.getByRole('button', { name: '当前历史状态' })).toHaveTextContent(expected);
});

test.each([
  [-770, '东周迁洛（传统约年）；秦襄公列侯；洛邑、西犬丘中心参照；王畿未定'],
  [-769, '东周、秦国并存；洛邑、西犬丘中心参照；列国并立；王畿未定'],
  [-762, '东周、秦国并存；洛邑、汧渭之会中心参照；列国并立；王畿未定'],
  [-751, '东周、秦国并存；洛邑、汧渭之会中心参照；列国并立；王畿未定'],
] as const)('renders the coexisting Eastern Zhou and Qin status in %s', (year, expectedLabel) => {
  const state = getHistoricalState(year);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今2795年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  expect(screen.getByRole('button', { name: '当前历史状态' })).toHaveTextContent(expectedLabel);
});

test.each([
  [263, '蜀汉年内终止；魏军攻取成都；成都为终止前中枢；接管分期、疆域未定；吴并存'],
  [265, '魏—晋交替；年初魏以洛阳为中心；吴冬迁武昌、此为年末中心；疆域未定'],
] as const)('renders the coexisting Wu regime in the %s HUD status', (year, expectedLabel) => {
  const state = getHistoricalState(year);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今1763年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  expect(screen.getByRole('button', { name: '当前历史状态' })).toHaveTextContent(expectedLabel);
});

test.each([304, 305])('renders all known coexisting polities for year %s', year => {
  const state = getHistoricalState(year);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今1722年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  const status = screen.getByRole('button', { name: '当前历史状态' });
  expect(status).toHaveTextContent('西晋—成汉—前赵并存');
  expect(status).toHaveTextContent('新罗并存');
});

test('renders the mobile and uncertain Xiongnu court note for 209 BCE', () => {
  const state = getHistoricalState(-209);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今2234年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  const status = screen.getByRole('button', { name: '当前历史状态' });
  expect(status).toHaveTextContent('秦—匈奴并存');
  expect(status).toHaveTextContent('单于庭移动、龙城位置待考；疆域未定');
});

test('renders the traditional Goguryeo founding site as a candidate in 37 BCE', () => {
  const state = getHistoricalState(-37);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今2062年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  const status = screen.getByRole('button', { name: '当前历史状态' });
  expect(status).toHaveTextContent('纥升骨城／五女山为早期中心候选');
  expect(status).toHaveTextContent('不确认建国仪式点；疆域未定');
});

test('renders the Han termination and the other Warring States in 230 BCE', () => {
  const state = getHistoricalState(-230);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今2255年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  const status = screen.getByRole('button', { name: '当前历史状态' });
  expect(status).toHaveTextContent('韩国年内终止；秦灭韩、置颍川郡');
  expect(status).toHaveTextContent('赵、魏、楚、燕、齐并存');
  expect(status).toHaveTextContent('疆域未定');
});

test.each([
  [-223, '楚王负刍被俘、楚政权终止', '不标寿春中心；疆域未定'],
  [-222, '燕王喜被俘、燕政权终止', '辽阳为低置信度末期中心区域参照（不定位襄平）'],
] as const)('renders the Warring States end-stage map note in %s', (year, eventNote, mapNote) => {
  const state = getHistoricalState(year);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今2248年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  const status = screen.getByRole('button', { name: '当前历史状态' });
  expect(status).toHaveTextContent(eventNote);
  expect(status).toHaveTextContent(mapNote);
  expect(status).toHaveTextContent('疆域未定');
});

test.each([-221, -220, -219])('renders Qin unification era notes in the %s HUD', year => {
  const state = getHistoricalState(year);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今2240年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  expect(screen.getByRole('button', { name: '当前历史状态' })).toHaveTextContent(eraLabel!);
});

test.each([-208, -207, -206])('renders Qin collapse timing and annual extent notes in the %s HUD', year => {
  const state = getHistoricalState(year);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今2228年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  expect(screen.getByRole('button', { name: '当前历史状态' })).toHaveTextContent(eraLabel!);
});

test.each([6, 7, 8, 9])('renders the Han to Xin year %s status and extent note in the HUD', year => {
  const state = getHistoricalState(year);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今2020年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  expect(screen.getByRole('button', { name: '当前历史状态' })).toHaveTextContent(eraLabel!);
});

test.each([26, 27, 28, 29])('renders the early Eastern Han year %s and coexisting polities in the HUD', year => {
  const state = getHistoricalState(year);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今2000年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  expect(screen.getByRole('button', { name: '当前历史状态' })).toHaveTextContent(eraLabel!);
});

test('renders the staged Later Jin to Later Han transition details in 947', () => {
  const state = getHistoricalState(947);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今1079年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  const status = screen.getByRole('button', { name: '当前历史状态' });
  expect(status).toHaveTextContent('契丹正月入汴、后晋终止');
  expect(status).toHaveTextContent('后汉二月在太原建政、五月入洛阳与开封');
  expect(status).toHaveTextContent('疆域未定；南唐、后蜀、大理并存');
});

test.each([
  [661, '唐—突厥余部—吐蕃并存；高句丽、新罗、吐谷浑并存'],
  [668, '唐—突厥余部—吐蕃并存；高句丽、新罗并存'],
  [681, '唐—突厥余部—吐蕃并存；新罗并存'],
  [682, '唐—后突厥—吐蕃并存；新罗并存'],
  [690, '武周—后突厥—吐蕃并存；新罗并存'],
  [705, '武周—唐交替；后突厥、吐蕃并存；新罗并存'],
  [706, '唐—后突厥—吐蕃并存；新罗并存'],
  [738, '唐—后突厥—吐蕃并存；南诏形成约年；新罗并存'],
  [739, '唐—后突厥—吐蕃—南诏并存；新罗并存'],
  [742, '三部攻杀骨咄叶护；乌苏米施继立；吐蕃并存；新罗、南诏并存'],
  [743, '唐—后突厥—吐蕃并存；新罗、南诏并存'],
  [744, '乌苏死、白眉继立；回纥怀仁可汗受册；吐蕃并存；新罗、南诏并存'],
] as const)('renders the complete coexisting polity list for year %s', (year, expectedLabel) => {
  const state = getHistoricalState(year);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今1365年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  expect(screen.getByRole('button', { name: '当前历史状态' })).toHaveTextContent(expectedLabel);
});

test.each([
  [738, '唐—后突厥—吐蕃并存；南诏形成约年；新罗并存'],
  [739, '唐—后突厥—吐蕃—南诏并存；新罗并存'],
  [740, '唐—后突厥—吐蕃—南诏并存；新罗并存'],
] as const)('renders the annual Nanzhao formation and capital status in %s', (year, expectedLabel) => {
  const state = getHistoricalState(year);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今1288年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  expect(screen.getByRole('button', { name: '当前历史状态' })).toHaveTextContent(expectedLabel);
});

test.each([
  [-2070, '夏（传统纪年）—现有证据不支持空间表达'],
  [-1751, '夏（传统纪年）—现有证据不支持空间表达'],
  [-1750, '夏（传统纪年）—二里头文化核心参照点；不代表夏疆界'],
  [-1700, '夏（传统纪年）—二里头文化核心参照点；不代表夏疆界'],
  [-1600, '夏（传统纪年）—二里头文化核心参照点；不代表夏疆界'],
] as const)('renders Xia evidence and map-expression notes in year %s', (year, expectedLabel) => {
  const state = getHistoricalState(year);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今约数千年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  expect(screen.getByRole('button', { name: '当前历史状态' })).toHaveTextContent(expectedLabel);
});

test.each([
  [-1046, '西周建政约年；克商日期有异说；丰镐王室中心参照；疆域未定'],
  [-1045, '西周早期；克商纪年存在分歧；丰镐王室中心参照；疆域未定'],
  [-1044, '有研究定为克商年；项目采用前1046约年；丰镐王室中心参照；疆域未定'],
  [-1043, '周武王卒；周公摄政与东国秩序动荡；丰镐王室中心参照；疆域未定'],
  [-1041, '成王时期东征与秩序重建；丰镐王室中心参照；疆域未定'],
  [-1035, '成王后期；分封秩序形成；丰镐王室中心参照；疆域未定'],
  [-1020, '康王早期；纪年仍有争议；丰镐王室中心参照；疆域未定'],
  [-1001, '康王早期；纪年仍有争议；丰镐王室中心参照；疆域未定'],
] as const)('renders Western Zhou phase and chronology notes in %s', (year, expectedLabel) => {
  const state = getHistoricalState(year);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今约三千年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  expect(screen.getByRole('button', { name: '当前历史状态' })).toHaveTextContent(expectedLabel);
});

test.each([
  [618, '隋—唐交替；唐以长安为政治中心；疆域未定；薛举、李轨、王世充等并存；高句丽、新罗、吐谷浑、突厥并存；吐蕃形成约年（年代有异说），雅砻核心参照'],
  [619, '唐初以长安为政治中心；疆域未定；刘武周、宋金刚、王世充、窦建德等并存；高句丽、新罗、吐谷浑、突厥并存；吐蕃雅砻核心参照'],
  [620, '唐初以长安为政治中心；疆域未定；刘武周等势力并存；高句丽、新罗、吐谷浑、突厥并存；吐蕃雅砻核心参照'],
  [621, '唐初以长安为政治中心；疆域未定；唐军攻取洛阳、击败窦建德（事件参照）；高句丽、新罗、吐谷浑、突厥并存；吐蕃雅砻核心参照'],
  [622, '唐初以长安为政治中心；疆域未定；刘黑闼据洺州（对手中心区域参照，不代表唐控）；高句丽、新罗、吐谷浑、突厥并存；吐蕃雅砻核心参照'],
] as const)('renders all recorded coexisting polities in year %s', (year, expectedLabel) => {
  const state = getHistoricalState(year);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今1404年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  expect(screen.getByRole('button', { name: '当前历史状态' })).toHaveTextContent(expectedLabel);
});

test.each([
  [951, '后汉终止—后周、北汉建政；开封、太原为政治中心；疆域未定；辽、南唐、吴越、南汉、荆南、后蜀、大理并存；马楚终止'],
  [952, '后周以开封为中央政治中心；疆域未定；辽、北汉、南唐、吴越、南汉、荆南、后蜀、大理并存'],
  [953, '后周以开封为中央政治中心；疆域未定；辽、北汉、南唐、吴越、南汉、荆南、后蜀、大理并存'],
  [954, '柴荣继位；后周高平战胜契丹—北汉联军；开封为中心；疆域未定；辽、北汉、南唐、吴越、南汉、荆南、后蜀、大理并存'],
  [955, '后周进取秦、凤方向；开封为中心；州界未定；辽、北汉、南唐、吴越、南汉、荆南、后蜀、大理并存'],
  [956, '后周南征淮南；战事不作疆界；开封为中心；疆域未定；辽、北汉、南唐、吴越、南汉、荆南、后蜀、大理并存'],
  [957, '淮南战事及州郡控制转换；开封为中心；疆域未定；辽、北汉、南唐、吴越、南汉、荆南、后蜀、大理并存'],
  [958, '南唐割江北地、奉后周正朔；不等于直辖江南；开封为中心；疆域未定；辽、北汉、南唐、吴越、南汉、荆南、后蜀、大理并存'],
  [959, '后周北征取得关南部分地区；柴荣去世后停兵；不以单年战果回填疆界；开封为中心；疆域未定；辽、北汉、南唐、吴越、南汉、荆南、后蜀、大理并存'],
] as const)('renders the coexisting polities in Later Zhou %s HUD', (year, expectedLabel) => {
  const state = getHistoricalState(year);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel={`距今${2026 - year}年`}
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  expect(screen.getByRole('button', { name: '当前历史状态' })).toHaveTextContent(expectedLabel);
});

test.each([
  [907, '唐—后梁交替；杨吴沿用天祐年号、以扬州为中心；疆域未定；河东晋、吴越、楚、前蜀并存'],
  [908, '杨隆演继位、杨吴以扬州为中枢；后梁以大梁为中心；疆域未定；河东晋、吴越、楚、前蜀并存'],
  [909, '杨吴向江西诸州扩张，接管时序与连续控制线未明；后梁年内迁都洛阳、秋还大梁；闽以福州为中心，五州沿革概述不作疆界；疆域未定；河东晋、吴越、楚、前蜀、闽并存'],
  [910, '杨吴以扬州为中心；“尽有今江西”不回推为本年全年疆界；后梁以洛阳为主朝廷中心、大梁为东都；岐王求巴、剑二州，王建拒绝割让；州界未定；闽以福州为中心，五州沿革概述不作疆界；河东晋、吴越、楚、前蜀、闽并存'],
] as const)('renders Later Liang founding-period status in the %s HUD', (year, expectedLabel) => {
  const state = getHistoricalState(year);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel={`距今${2026 - year}年`}
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  expect(screen.getByRole('button', { name: '当前历史状态' })).toHaveTextContent(expectedLabel);
});

test.each([
  [479, '刘宋三月禅位—南齐五月建政；建康为建政中心参照，非全年连续控制；疆域未定；北魏、新罗并存'],
  [502, '南齐—南梁交替；萧衍年中在建康受禅建梁；中心点仅表示建梁后阶段，疆域未定；北魏、新罗并存'],
  [503, '南梁以建康为中心；疆域未定；北魏、新罗并存'],
  [504, '南梁以建康为中心；疆域未定；北魏、新罗并存'],
  [505, '南梁以建康为中心；疆域未定；北魏、新罗并存'],
  [506, '南梁以建康为中心；疆域未定；北魏、新罗并存'],
  [507, '南梁以建康为中心；疆域未定；钟离及邵阳洲附近战事（钟离区域近似事件点）；南梁援军击退北魏军；北魏、新罗并存'],
  [508, '南梁以建康为中心；疆域未定；北魏、新罗并存'],
  [509, '南梁以建康为中心；疆域未定；北魏、新罗并存'],
] as const)('renders the source-checked Southern Qi and Liang map status in %s HUD', (year, expectedLabel) => {
  const state = getHistoricalState(year);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel={`距今${2026 - year}年`}
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  expect(screen.getByRole('button', { name: '当前历史状态' })).toHaveTextContent(expectedLabel);
});

test('renders the Northern Wei split and Eastern Wei founding in the 534 HUD', () => {
  const state = getHistoricalState(534);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今1492年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  expect(screen.getByRole('button', { name: '当前历史状态' })).toHaveTextContent(
    '北魏分裂；孝武帝七月离洛入关中、东魏十月在邺建政；洛阳、邺仅为事件点；西魏于公历535年建政，疆域未定；南梁、新罗并存',
  );
});

test.each([
  [552, '北齐以邺为政治中心；疆域未定；筑长城（线路待考、不作疆界）；土门击败柔然，突厥汗权形成（《周书》记于怀荒以北战事）；西魏、南梁并存'],
  [553, '北齐以邺为政治中心；疆域未定；突厥汗位承继记载有异文；西魏、南梁并存'],
  [554, '北齐以邺为政治中心；疆域未定；突厥十一月再攻柔然，柔然举国奔齐，北齐迎纳、突厥请降；战局不构成疆界；西魏、南梁并存'],
] as const)('renders the yearly Northern Qi and Turkic conclusion in %s HUD', (year, expectedLabel) => {
  const state = getHistoricalState(year);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel={`距今${2026 - year}年`}
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  expect(screen.getByRole('button', { name: '当前历史状态' })).toHaveTextContent(expectedLabel);
});

test.each([
  [557, '南梁—南陈交替；西魏—北周交替；建康为南陈建政后中心、长安为西魏—北周承接中心；南陈、北周疆域未定；北齐并存；其来源范围仅为低置信时段参考，控制性质未定'],
  [558, '南陈以建康、北周以长安为政治中心；疆域未定；北齐并存；其来源范围仅为低置信时段参考，控制性质未定'],
  [559, '陈霸先卒—陈蒨继位；南陈以建康、北周以长安为政治中心；疆域未定；北齐并存；其来源范围仅为低置信时段参考，控制性质未定'],
  [560, '宇文邕继位；南陈以建康、北周以长安为政治中心；疆域未定；北齐并存；其来源范围仅为低置信时段参考，控制性质未定'],
] as const)('renders the concurrent southern and northern regimes in the %s HUD', (year, expectedLabel) => {
  const state = getHistoricalState(year);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel={`距今${2026 - year}年`}
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  expect(screen.getByRole('button', { name: '当前历史状态' })).toHaveTextContent(expectedLabel);
});

test.each([
  [581, '北周—隋交替；隋以长安为政治中心；疆域未定；南陈并存'],
  [582, '隋营建大兴新都；仍以长安为政治中心；疆域未定；南陈并存'],
  [583, '隋迁都大兴；大兴为低置信度区域参照；疆域未定；南陈并存'],
  [584, '隋以大兴为都；地图点为区域参照；疆域未定；南陈并存'],
  [585, '隋以大兴为都；地图点为区域参照；疆域未定；南陈并存'],
  [586, '隋以大兴为都；地图点为区域参照；疆域未定；南陈并存'],
] as const)('renders the Sui founding period in the %s HUD', (year, expectedLabel) => {
  const state = getHistoricalState(year);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今1445年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  expect(screen.getByRole('button', { name: '当前历史状态' })).toHaveTextContent(expectedLabel);
});

test('renders the Northern Qi end and Northern Zhou takeover in the 577 HUD', () => {
  const state = getHistoricalState(577);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今1449年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  expect(screen.getByRole('button', { name: '当前历史状态' })).toHaveTextContent(
    '高恒即位；北周攻取邺、北齐终止；邺为年内转换中心；疆域未定；南陈并存',
  );
});

test.each([398, 399, 400, 401])('renders Southern Yan and contemporaneous regimes in the %s HUD', year => {
  const state = getHistoricalState(year);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今1628年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  const status = screen.getByRole('button', { name: '当前历史状态' });
  expect(status).toHaveTextContent(eraLabel ?? '');
  expect(status).toHaveTextContent('南燕');
  expect(status).toHaveTextContent('东晋');
  expect(status).toHaveTextContent('后燕');
  expect(status).toHaveTextContent('南凉');
  expect(status).toHaveTextContent('后凉');
  if (year >= 400) expect(status).toHaveTextContent('西凉');
});

test.each([
  [407, '夏建政；高平川地望有异说；疆域未定；后燕—北燕交替；东晋、后秦、北魏、北凉、南凉、南燕、西凉、新罗并存'],
  [408, '夏军退保河曲、追至木城擒齐难；地点与“大城”异文未决，不标战场点；疆域未定；东晋、后秦、北魏、北凉、南凉、南燕、北燕、西凉、新罗并存'],
  [409, '夏军攻掠平凉七千余户、进屯依力川；不代表控制平凉全境；地点、疆域未定；西秦复立、度坚山区域事件点（非全年中心）；东晋、后秦、北魏、北凉、南凉、南燕、北燕、西凉、新罗并存'],
] as const)('renders Xia’s annual evidence and coexisting regimes in the %s HUD', (year, expectedLabel) => {
  const state = getHistoricalState(year);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今1617年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  const status = screen.getByRole('button', { name: '当前历史状态' });
  expect(status).toHaveTextContent(expectedLabel);
});

test('renders Southern Yan termination with the concurrent regimes in the 410 HUD', () => {
  const state = getHistoricalState(410);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今1616年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  const status = screen.getByRole('button', { name: '当前历史状态' });
  expect(status).toHaveTextContent('南燕二月终止');
  expect(status).toHaveTextContent('广固为覆亡前中心；疆域未定');
  expect(status).toHaveTextContent('西凉以酒泉为中心');
  expect(status).toHaveTextContent('东晋、夏、北燕、后秦、北魏、北凉、南凉、西秦并存');
});

test('renders Southern Liang termination and the Ledu handoff in the 414 HUD', () => {
  const state = getHistoricalState(414);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今1612年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  const status = screen.getByRole('button', { name: '当前历史状态' });
  expect(status).toHaveTextContent('南凉年内终止；西秦攻取乐都；乐都为覆亡前中心');
  expect(status).toHaveTextContent('西凉以酒泉为中心');
  expect(status).toHaveTextContent('东晋、夏、北燕、后秦、北魏、北凉并存');
});

test.each([
  [415, '西凉以酒泉为中心；疆域未定；东晋、后秦、夏、北燕、北魏、北凉、西秦并存'],
  [416, '西凉以酒泉为中心；疆域未定；东晋、后秦、夏、北燕、北魏、北凉、西秦并存'],
  [417, '东晋刘裕攻取长安；姚泓出降，后秦中央政权终止；长安为年内交接参照（不代表全年稳定控制）；疆域未定；西凉以酒泉为中心；夏、北燕、北魏、北凉、西秦、新罗并存'],
  [418, '西凉以酒泉为中心；疆域未定；东晋、夏、北燕、北魏、北凉、西秦并存'],
  [419, '西凉以酒泉为中心；疆域未定；东晋、夏、北燕、北魏、北凉、西秦并存'],
] as const)('renders all coexisting main regimes for %s in the HUD', (year, expectedLabel) => {
  const state = getHistoricalState(year);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel={`距今${2026 - year}年`}
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  const status = screen.getByRole('button', { name: '当前历史状态' });
  expect(status).toHaveTextContent(expectedLabel);
});

test.each([
  [420, '东晋—刘宋交替；六月刘裕受禅后以建康为中心；东晋、刘宋疆域未定；西凉年内酒泉失守、李恂返敦煌，地图留空；北魏、夏、北凉、西秦、北燕、新罗并存'],
  [421, '西凉终止；敦煌为覆亡前中心；疆域未定；刘宋以建康为中心；疆域未定；北魏、夏、北凉、西秦、北燕、新罗并存'],
  [422, '刘裕五月去世、刘义符即位；刘宋以建康为中心；疆域未定；北魏、夏、北凉、西秦、北燕、新罗并存'],
  [423, '刘宋少帝刘义符在位；建康为中心；疆域未定；北魏、夏、北凉、西秦、北燕、新罗并存'],
  [424, '刘义符年内被废、刘义隆八月即位；建康中心延续；疆域未定；北魏、夏、北凉、西秦、北燕、新罗并存'],
  [425, '元嘉二年；文帝刘义隆开始亲理政务；建康为中心；疆域未定；北魏、夏、北凉、西秦、北燕、新罗并存'],
] as const)('renders annual Liu Song status for %s', (year, expectedLabel) => {
  const state = getHistoricalState(year);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel={`距今${2026 - year}年`}
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  expect(screen.getByRole('button', { name: '当前历史状态' })).toHaveTextContent(expectedLabel);
});

test('renders the Western Liang termination among the concurrent regimes in the 421 HUD', () => {
  const state = getHistoricalState(421);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今1605年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  const status = screen.getByRole('button', { name: '当前历史状态' });
  expect(status).toHaveTextContent('西凉终止');
  expect(status).toHaveTextContent('刘宋以建康为中心');
  expect(status).toHaveTextContent('疆域未定');
  expect(status).toHaveTextContent('北魏、夏、北凉、西秦、北燕、新罗并存');
});

test.each([
  [314, '张轨卒；张寔承摄凉州；姑臧为中心；疆域未定'],
  [319, '前凉、后赵、前赵、东晋并存；姑臧、襄国为中心；疆域未定'],
  [320, '张寔遇害、张茂接掌；前凉、后赵、前赵、东晋并存'],
  [322, '前凉置秦州、向陇西南安扩展；后赵、前赵、东晋并存'],
  [323, '前赵西击前凉、张茂称藩；前凉、后赵、东晋并存'],
  [329, '后赵灭前赵；东晋并存'],
  [330, '后赵称帝；东晋并存'],
  [336, '后赵都邺；营建持续；东晋并存'],
] as const)('renders coexisting central regimes in the %s HUD status', (year, expectedLabel) => {
  const state = getHistoricalState(year);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今1689年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  const status = screen.getByRole('button', { name: '当前历史状态' });
  expect(status).toHaveTextContent(expectedLabel);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([
    ...(year < 319 ? ['former_liang', 'jin_western'] : [
      'later_zhao', 'jin_eastern', ...(year <= 328 ? ['former_zhao'] : []),
      ...(year <= 323 ? ['former_liang'] : []),
    ]),
  ]));
});

test.each([
  [384, '后燕荥阳称王（事件区域点、非全年中心）；后秦在渭北马牧起兵、自称万年秦王（地望未定）；疆域未定；前秦、东晋、西燕、新罗并存'],
  [385, '后燕围邺未下、四月撤围，年末定都中山（中心参照）；后秦多线征战；西秦九月建政、勇士城中心参照；疆域未定；前秦、东晋、西燕、新罗并存'],
  [386, '北魏（代）年初牛川即位，二月迁居盛乐、四月改称魏王；仅标盛乐阶段中心，年内迁贺兰部、再返牛川；疆域未定；后燕、后秦称帝；后燕中山、后秦长安中心参照，后秦向安定用兵；西秦勇士城区域中心参照；西燕、前秦、东晋、后凉、新罗并存'],
] as const)('renders the coexisting Sixteen Kingdoms in the %s HUD status', (year, expectedLabel) => {
  const state = getHistoricalState(year);
  const eraLabel = polityDisplayName(state.activePolities, state.year);
  render(<LocaleProvider><MapStatusHud
    yearLabel={state.displayLabel}
    eraLabel={eraLabel}
    viewLabel="王朝至今"
    distanceLabel="距今1642年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  const status = screen.getByRole('button', { name: '当前历史状态' });
  expect(status).toHaveTextContent(expectedLabel);
});
