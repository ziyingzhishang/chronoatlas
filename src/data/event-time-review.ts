import type { HistoricalEvent, HistoricalEventDetail } from '../domain/types';
import { eventDetails as defaultEventDetails } from './event-details';
import { events as defaultEvents } from './events';
import { sourceNotes as defaultSourceNotes } from './sources';

export type EventTimeReviewStatus = 'confirmed' | 'approximate' | 'unknown';
export type EventTimeTimelineStrategy = 'year-marker' | 'approximate-marker' | 'range-band' | 'unknown-window';
export type ReviewedDatePrecision = NonNullable<HistoricalEvent['datePrecision']>;
export type EventTimeActualPrecision = ReviewedDatePrecision | 'unknown';

export interface EventTimeReviewEntry {
  eventId: string;
  status: EventTimeReviewStatus;
  expectedPrecision: ReviewedDatePrecision;
  explanation: string;
  timelineStrategy: EventTimeTimelineStrategy;
}

export interface EventTimeReviewRecord extends EventTimeReviewEntry {
  title: string;
  year: number;
  endYear?: number;
  datePrecision: EventTimeActualPrecision;
  sourceIds: string[];
}

export interface EventTimeSourceMismatch {
  eventId: string;
  sourceIds: string[];
  unknownSourceIds: string[];
}

export interface EventTimePrecisionMismatch {
  eventId: string;
  expected: ReviewedDatePrecision;
  actual: HistoricalEvent['datePrecision'];
}

export interface EventTimeCoverageReport {
  isComplete: boolean;
  totalReviewed: number;
  records: EventTimeReviewRecord[];
  statusCounts: Record<EventTimeReviewStatus, number>;
  missingEventIds: string[];
  missingDetailEventIds: string[];
  unreviewedNonPreciseEventIds: string[];
  sourceMismatches: EventTimeSourceMismatch[];
  precisionMismatches: EventTimePrecisionMismatch[];
}

export interface ReviewEventTimeCoverageOptions {
  events?: readonly HistoricalEvent[];
  eventDetails?: readonly HistoricalEventDetail[];
  reviewEntries?: readonly EventTimeReviewEntry[];
  knownSourceIds?: Iterable<string>;
}

// These are editorial interpretations only. Dates, source IDs and precision are read from the existing catalogs below.
export const eventTimeReview: readonly EventTimeReviewEntry[] = [
  { eventId: 'xia-early-founded-eighth-batch', status: 'approximate', expectedPrecision: 'approximate', explanation: '传统纪年与夏代起始问题仍有学术分歧，只能按约年锚点展示，不把公元前2070年当作精确建国日。', timelineStrategy: 'approximate-marker' },
  { eventId: 'shang-founded-eighth-batch', status: 'approximate', expectedPrecision: 'approximate', explanation: '商代起始年代采用通行约年，年代与考古分期不能还原为单一可证实日期。', timelineStrategy: 'approximate-marker' },
  { eventId: 'zhou-conquest', status: 'approximate', expectedPrecision: 'approximate', explanation: '前1046年是常用克商约年，牧野战事与西周建政是连续过程，不能压缩成单日节点。', timelineStrategy: 'approximate-marker' },
  { eventId: 'western-zhou-founded-eighth-batch', status: 'approximate', expectedPrecision: 'approximate', explanation: '西周建立涉及克商、分封与东征等阶段，前1046年只作常用约年锚点。', timelineStrategy: 'approximate-marker' },
  { eventId: 'eastern-zhou-founded-eighth-batch', status: 'approximate', expectedPrecision: 'approximate', explanation: '东周分期以周室东迁为传统节点，政权转移和政治中心变化不等同于精确建国日。', timelineStrategy: 'approximate-marker' },
  { eventId: 'eastern-wei-ended-550', status: 'confirmed', expectedPrecision: 'year', explanation: '550年元善见禅位于高洋、北齐建立与东魏中央政权终止有明确编年节点；高氏实际掌权、北齐地方接收和邺城遗产延续另按阶段分层。', timelineStrategy: 'year-marker' },
  { eventId: 'northern-qi-ended-577', status: 'confirmed', expectedPrecision: 'year', explanation: '577年北周攻取邺城、北齐末主高恒出奔并在终局过程中被俘，北齐中央政权终止与北周承接有明确编年节点；地方归附和邺城遗产延续另按阶段分层。', timelineStrategy: 'year-marker' },
  { eventId: 'northern-zhou-ended-581', status: 'confirmed', expectedPrecision: 'year', explanation: '581年北周静帝禅位于杨坚、隋建立与北周中央政权终止有明确编年节点；宇文阐个人退位、隋地方承接、长安城市遗产延续及589年灭陈另按阶段分层。', timelineStrategy: 'year-marker' },
  { eventId: 'qin-state-founded-eighth-batch', status: 'approximate', expectedPrecision: 'approximate', explanation: '秦国早期建制属于传统分期，前770年只能表示历史阶段起点。', timelineStrategy: 'approximate-marker' },
  { eventId: 'chu-warring-founded-eighth-batch', status: 'approximate', expectedPrecision: 'approximate', explanation: '战国楚的目录起点是传统分期，前403年只用于时间轴定位。', timelineStrategy: 'approximate-marker' },
  { eventId: 'yan-warring-founded-eighth-batch', status: 'approximate', expectedPrecision: 'approximate', explanation: '战国燕的目录起点是传统分期，不能据此推断精确的政权成立日期。', timelineStrategy: 'approximate-marker' },
  { eventId: 'qi-warring-founded-eighth-batch', status: 'approximate', expectedPrecision: 'approximate', explanation: '战国齐的目录起点是传统分期，前403年仅作约年时间锚点。', timelineStrategy: 'approximate-marker' },
  { eventId: 'xiongnu-founded', status: 'approximate', expectedPrecision: 'approximate', explanation: '匈奴联盟形成是部众整合过程，前209年用于表示传统形成阶段，不代表单一建国仪式。', timelineStrategy: 'approximate-marker' },
  { eventId: 'chu-han-contention', status: 'confirmed', expectedPrecision: 'range', explanation: '楚汉竞争的起止区间有明确编年边界，但事件本身跨越多个军事与政治阶段。', timelineStrategy: 'range-band' },
  { eventId: 'silla-founded', status: 'approximate', expectedPrecision: 'approximate', explanation: '前57年是新罗传统纪年节点，早期辰韩诸部整合仍需按形成过程理解。', timelineStrategy: 'approximate-marker' },
  { eventId: 'silla-tang-war-670-676', status: 'confirmed', expectedPrecision: 'range', explanation: '670—676年新罗与唐的战争是有明确起止范围的连续过程，不能压缩为676年单日。', timelineStrategy: 'range-band' },
  { eventId: 'goguryeo-founded', status: 'approximate', expectedPrecision: 'approximate', explanation: '前37年是高句丽传统建国纪年，早期国家化与城址对应不能被视为精确日期。', timelineStrategy: 'approximate-marker' },
  { eventId: 'cheng-han-founded', status: 'confirmed', expectedPrecision: 'year', explanation: '《资治通鉴》卷八十五明确记载304年十月李雄即成都王位，形成政权单年节点；306年称帝是后续阶段，不能据此推断304年已控制整个巴蜀。', timelineStrategy: 'year-marker' },
  { eventId: 'tuyuhun-founded', status: 'approximate', expectedPrecision: 'approximate', explanation: '313年前后表示吐谷浑部众形成稳定政治共同体，迁徙与建制不是单日完成。', timelineStrategy: 'approximate-marker' },
  { eventId: 'former-liang-founded', status: 'approximate', expectedPrecision: 'approximate', explanation: '314年前后表示河西张氏地方统治的独立形成，前凉建政起点存在口径差异。', timelineStrategy: 'approximate-marker' },
  { eventId: 'changan-former-qin', status: 'approximate', expectedPrecision: 'approximate', explanation: '351年前后表示前秦据长安并经营关中的阶段，建政与取得城市控制不能压缩为同一无争议日期。', timelineStrategy: 'approximate-marker' },
  { eventId: 'western-liang-state-founded', status: 'confirmed', expectedPrecision: 'year', explanation: '《晋书》卷87与《资治通鉴》卷111均记400年李暠被推为凉公、改元庚子；《资治通鉴》明确说北凉由此分出西凉。397—399年受命敦煌是前置基础，405年迁居酒泉是后续政治中心转移。', timelineStrategy: 'year-marker' },
  { eventId: 'tibetan-founded', status: 'approximate', expectedPrecision: 'approximate', explanation: '618年前后表示吐蕃形成阶段，松赞干布后的高原整合不能回填为建政当年。', timelineStrategy: 'approximate-marker' },
  { eventId: 'tibetan-yalong-center', status: 'confirmed', expectedPrecision: 'range', explanation: '618—629年表示吐蕃雅砻早期政治中心阶段；这是阶段范围，不是新的单日建政节点。', timelineStrategy: 'range-band' },
  { eventId: 'tibetan-ended-842', status: 'approximate', expectedPrecision: 'approximate', explanation: '842年前后表示吐蕃统一政治结构进入解体阶段；王权终止、继承竞争和地方化并非同日完成。', timelineStrategy: 'approximate-marker' },
  { eventId: 'an-lushan-rebellion', status: 'confirmed', expectedPrecision: 'range', explanation: '安史之乱的755—763年区间有明确编年边界，但战局和控制范围随阶段变化。', timelineStrategy: 'range-band' },
  { eventId: 'xuanzang-at-ximing-658', status: 'confirmed', expectedPrecision: 'range', explanation: '玄奘在西明寺的活动限定为658—659年阶段，次年赴玉华寺，不能扩展为其全部译经生涯。', timelineStrategy: 'range-band' },
  { eventId: 'shangyang-palace-built', status: 'confirmed', expectedPrecision: 'range', explanation: '上阳宫始建材料只明确为上元年间，674—676年是稳妥范围，675年为通行整理年；不能升级为绝对单年。', timelineStrategy: 'range-band' },
  { eventId: 'daming-palace-built', status: 'approximate', expectedPrecision: 'approximate', explanation: '大明宫营建是持续工程，634年前后只作启动阶段约年，不能把全部宫城建成压缩为单一日期。', timelineStrategy: 'approximate-marker' },
  { eventId: 'dali-founded', status: 'approximate', expectedPrecision: 'approximate', explanation: '937年前后表示大理政权形成；《滇载记》按后晋天福二年记937年，而国家社科成果摘要采用938年，杨干贞改国号、段氏承接和高氏阶段不能混为精确建国日，因此保留约年。', timelineStrategy: 'approximate-marker' },
  { eventId: 'southern-liang-founded-397', status: 'approximate', expectedPrecision: 'approximate', explanation: '397年前后表示秃发乌孤在河湟地区建立南凉政权的形成阶段；部落联盟整合、受封与迁都西平之间存在连续过程，不能压缩为单一建国日。', timelineStrategy: 'approximate-marker' },
  { eventId: 'southern-liang-moves-ledu', status: 'approximate', expectedPrecision: 'approximate', explanation: '399年前后表示南凉政治中心向乐都转移的阶段过程；项目保留约年，不把迁移写成无争议的单日事件。', timelineStrategy: 'approximate-marker' },
  { eventId: 'mongol-karakorum-fixed-center', status: 'approximate', expectedPrecision: 'approximate', explanation: '1235年前后表示哈拉和林由移动汗廷网络转向较固定城市中心的阶段，不能压缩为单日建都。', timelineStrategy: 'approximate-marker' },
  { eventId: 'yuan-shangdu-built', status: 'approximate', expectedPrecision: 'approximate', explanation: '1256年前后表示开平／上都营建启动，工程完成与元两都制度成熟属于后续阶段。', timelineStrategy: 'approximate-marker' },
  { eventId: 'western-liao-founded', status: 'approximate', expectedPrecision: 'approximate', explanation: '1124年前后表示耶律大石自立为王并西行的形成阶段；《辽史》与现代研究对称帝纪年存在换算异说，故不升级为确定年。1132年称帝、1134年建都虎思斡耳朵（八剌沙衮）分别作为后续阶段记录。', timelineStrategy: 'approximate-marker' },
  { eventId: 'western-liao-emperor-1132', status: 'approximate', expectedPrecision: 'approximate', explanation: '1132年称帝作为西辽制度化阶段，纪年换算存在1131等口径；与1124年前后形成和1134年八剌沙衮建都分层，八剌沙衮只作后续区域参照。', timelineStrategy: 'approximate-marker' },
  { eventId: 'western-liao-ended-1218', status: 'approximate', expectedPrecision: 'approximate', explanation: '1218年前后表示屈出律政权被蒙古击败、西辽统一政治结构结束的过程；政权终止、地方秩序重组与八剌沙衮城市遗产延续分层记录。', timelineStrategy: 'approximate-marker' },
  { eventId: 'western-xia-ended-1227', status: 'approximate', expectedPrecision: 'approximate', explanation: '1227年前后表示李睍政权被蒙古击败、西夏统一政治结构结束的过程；军事征服、地方秩序重组与兴庆府及王陵遗产延续分层记录。', timelineStrategy: 'approximate-marker' },
  { eventId: 'jin-ended-1234', status: 'approximate', expectedPrecision: 'approximate', explanation: '1234年前后表示完颜守绪政权被蒙古与南宋联军击败、金统一政治结构结束的过程；末帝结局、地方接收与开封城市遗产延续分层记录。', timelineStrategy: 'approximate-marker' },
  { eventId: 'southern-song-ended-1279', status: 'approximate', expectedPrecision: 'approximate', explanation: '1279年前后表示赵昺政权在崖门终局阶段结束的过程；海战、人物结局、元军接收与临安城市遗产延续分层记录。', timelineStrategy: 'approximate-marker' },
  { eventId: 'dali-ended-1253', status: 'approximate', expectedPrecision: 'approximate', explanation: '1253年前后表示蒙古进入大理核心、段兴智政权结束与地方行政接收的连续过程；羊苴咩城和大理古城遗产继续存在。', timelineStrategy: 'approximate-marker' },
  { eventId: 'nanzhao-ended-902', status: 'confirmed', expectedPrecision: 'year', explanation: '902年表示南诏蒙氏王室政权在郑买嗣夺权与大长和承接过程中终止；舜化贞死因、夺权细节与羊苴咩城地方承接分层记录。', timelineStrategy: 'year-marker' },
  { eventId: 'southern-yan-ended-410', status: 'confirmed', expectedPrecision: 'year', explanation: '410年表示刘裕攻取广固与南燕政权终止的明确年份；围城、俘获和地方接收仍按连续过程记录。', timelineStrategy: 'year-marker' },
  { eventId: 'southern-liang-ended-414', status: 'confirmed', expectedPrecision: 'year', explanation: '414年表示西秦攻取乐都、秃发傉檀政权结束与地方接收的明确年份；乐都候选城址和河湟城市层继续存在。', timelineStrategy: 'year-marker' },
  { eventId: 'former-zhao-ended-329', status: 'confirmed', expectedPrecision: 'year', explanation: '329年表示后赵攻取长安、刘曜被俘与前赵统一政治结构终止的明确年份；长安城市遗产和地方承接另行分层。', timelineStrategy: 'year-marker' },
  { eventId: 'cheng-han-ended-347', status: 'confirmed', expectedPrecision: 'year', explanation: '347年表示东晋桓温攻取成都、李势出降与成汉统一政治结构终止的明确年份；成都城市遗产和地方承接另行分层。', timelineStrategy: 'year-marker' },
  { eventId: 'former-yan-ended-370', status: 'confirmed', expectedPrecision: 'year', explanation: '370年表示前秦攻取邺、慕容暐被俘与前燕统一政治结构终止的明确年份；邺城遗产和地方承接另行分层。', timelineStrategy: 'year-marker' },
  { eventId: 'former-qin-ended-394', status: 'confirmed', expectedPrecision: 'year', explanation: '394年表示后秦击败苻登、前秦后期统一政治结构终止的明确年份；马嵬战场、长安城市遗产与后秦接收分层记录。', timelineStrategy: 'year-marker' },
  { eventId: 'northern-liang-ended-439', status: 'approximate', expectedPrecision: 'approximate', explanation: '439年前后表示北魏攻取姑臧、沮渠牧犍政权结束与地方行政接收的连续过程；姑臧城市遗产继续存在。', timelineStrategy: 'approximate-marker' },
  { eventId: 'southern-ming-founded', status: 'approximate', expectedPrecision: 'approximate', explanation: '1644年前后表示南明多阶段政权体系形成，不能把不同弘光、隆武、永历阶段压成一个日期。', timelineStrategy: 'approximate-marker' },
  { eventId: 'hongguang-nanjing-founded', status: 'confirmed', expectedPrecision: 'year', explanation: '1644年朱由崧在南京先监国后即帝位，年份级节点可由弘光阶段史料支持；即位日和南京阶段覆亡属于同一阶段内的后续细节。', timelineStrategy: 'year-marker' },
  { eventId: 'longwu-fuzhou-founded', status: 'confirmed', expectedPrecision: 'year', explanation: '1645年朱聿键在福州即位并改元隆武，福州阶段中心可明确到年份；隆武覆亡与郑芝龙军镇关系另作阶段说明。', timelineStrategy: 'year-marker' },
  { eventId: 'shaowu-guangzhou-founded', status: 'confirmed', expectedPrecision: 'year', explanation: '1646年朱聿鐭在广州即位并使用绍武年号，阶段短且与永历并立，年份级节点比虚构单日更合适。', timelineStrategy: 'year-marker' },
  { eventId: 'yongli-zhaoqing-founded', status: 'confirmed', expectedPrecision: 'year', explanation: '1646年朱由榔在肇庆先监国后即帝位，永历初期中心和即位年份明确；后续迁移不能回填到肇庆节点。', timelineStrategy: 'year-marker' },
  { eventId: 'zhao-wuling-reforms-307', status: 'approximate', expectedPrecision: 'approximate', explanation: '前307年胡服骑射改革是持续数年的军事与制度转型，前307年作为启动约年，不能将改革过程误读为单日完成。', timelineStrategy: 'approximate-marker' },
  { eventId: 'republic-chongqing-wartime-center', status: 'confirmed', expectedPrecision: 'range', explanation: '1938—1945年重庆战时中央驻地阶段按区间表达；战时中央驻地与永久迁都、永久首都分层。', timelineStrategy: 'range-band' },
  { eventId: 'southern-chen-ended-589', status: 'confirmed', expectedPrecision: 'year', explanation: '589年隋军攻取建康、陈叔宝出降与南陈中央政权终止有明确编年节点；地方接收过程另行分层。', timelineStrategy: 'year-marker' },
  { eventId: 'northern-han-ended-979', status: 'confirmed', expectedPrecision: 'year', explanation: '979年北宋攻取太原、刘继元出降与北汉中央政权终止有明确编年节点；太原及河东的地方行政接收、军镇重组和辽宋边境变化另按过程分层。', timelineStrategy: 'year-marker' },
  { eventId: 'min-ended-945', status: 'approximate', expectedPrecision: 'approximate', explanation: '945年前后表示南唐攻取福州、王延政降服与闽中央政权终止的连续过程；福建各地接收和福州遗产承接不能压缩为同一日期。', timelineStrategy: 'approximate-marker' },
  { eventId: 'jingnan-ended-963', status: 'confirmed', expectedPrecision: 'year', explanation: '963年高继冲向北宋纳土，荆南中央政权身份终止；江陵地方行政接收、军镇调整与城市遗产延续另按过程分层。', timelineStrategy: 'year-marker' },
  { eventId: 'ma-chu-ended-951', status: 'confirmed', expectedPrecision: 'year', explanation: '951年长沙失守、马希崇降服与马楚中央政权终止有明确年份级节点；马希萼衡山阶段、朗州及湖南各地的南唐接收另按过程分层。', timelineStrategy: 'year-marker' },
  { eventId: 'liao-ended-1125', status: 'confirmed', expectedPrecision: 'year', explanation: '1125年前后表示金军攻取辽核心城市、天祚帝出奔被俘与辽中央政权终止的年份级节点；辽南京1122年已先脱离辽控制，五京接收、西辽形成与末帝个人结局另按过程分层。', timelineStrategy: 'year-marker' },
];

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function emptyStatusCounts(): Record<EventTimeReviewStatus, number> {
  return { confirmed: 0, approximate: 0, unknown: 0 };
}

export function reviewEventTimeCoverage(options: ReviewEventTimeCoverageOptions = {}): EventTimeCoverageReport {
  const currentEvents = options.events ?? defaultEvents;
  const currentDetails = options.eventDetails ?? defaultEventDetails;
  const reviewEntries = options.reviewEntries ?? eventTimeReview;
  const knownSourceIds = new Set(options.knownSourceIds ?? defaultSourceNotes.map((source) => source.id));
  const eventsById = new Map(currentEvents.map((event) => [event.id, event]));
  const detailsById = new Map(currentDetails.map((detail) => [detail.eventId, detail]));
  const statusCounts = emptyStatusCounts();
  const missingEventIds: string[] = [];
  const missingDetailEventIds: string[] = [];
  const sourceMismatches: EventTimeSourceMismatch[] = [];
  const precisionMismatches: EventTimePrecisionMismatch[] = [];
  const records: EventTimeReviewRecord[] = [];

  for (const entry of reviewEntries) {
    statusCounts[entry.status] += 1;
    const event = eventsById.get(entry.eventId);
    const detail = detailsById.get(entry.eventId);
    if (!detail) {
      missingDetailEventIds.push(entry.eventId);
    }
    if (!event) {
      missingEventIds.push(entry.eventId);
      continue;
    }
    if (event.datePrecision !== entry.expectedPrecision) {
      precisionMismatches.push({ eventId: entry.eventId, expected: entry.expectedPrecision, actual: event.datePrecision });
    }
    if (!detail) continue;
    const sourceIds = unique(detail.sourceIds);
    const unknownSourceIds = sourceIds.filter((sourceId) => !knownSourceIds.has(sourceId));
    if (sourceIds.length === 0 || unknownSourceIds.length > 0) {
      sourceMismatches.push({ eventId: entry.eventId, sourceIds, unknownSourceIds });
    }
    records.push({
      ...entry,
      title: event.title,
      year: event.year,
      endYear: event.endYear,
      datePrecision: event.datePrecision ?? 'unknown',
      sourceIds,
    });
  }

  const reviewedIds = new Set(reviewEntries.map((entry) => entry.eventId));
  const unreviewedNonPreciseEventIds = currentEvents
    .filter((event) => event.datePrecision !== 'year' && !reviewedIds.has(event.id))
    .map((event) => event.id);
  const isComplete = missingEventIds.length === 0
    && missingDetailEventIds.length === 0
    && unreviewedNonPreciseEventIds.length === 0
    && sourceMismatches.length === 0
    && precisionMismatches.length === 0
    && records.length === reviewEntries.length;

  return {
    isComplete,
    totalReviewed: reviewEntries.length,
    records,
    statusCounts,
    missingEventIds,
    missingDetailEventIds,
    unreviewedNonPreciseEventIds,
    sourceMismatches,
    precisionMismatches,
  };
}
