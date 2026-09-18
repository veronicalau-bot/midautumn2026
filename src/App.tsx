import { useEffect, useState } from 'react'
import { ArrowUp, BookOpen, Check, ChevronRight, ExternalLink, Languages, MapPin, Moon, RotateCcw, ShieldCheck } from 'lucide-react'
import Papa from 'papaparse'
import { QRCodeSVG } from 'qrcode.react'
import './App.css'
import { ECardSection } from './ECardSection'

type Language = 'zh' | 'en'

const copy = {
  zh: {
    brand: '跑走月餅', tagline: 'Running Off the Mooncake', nav: ['月餅旅程', '海濱地圖', '夜跑安全', '能量計算', '圖書館資源', '電子賀卡'],
    eyebrow: '學院圖書館', heroTitle: '跑走月餅 Running Off the Mooncake',
    heroText: '一同於海濱慢跑，感受中秋晚風', start: '開始探索', explore: '查看海濱', libraryCta: '圖書館資源', ecardCta: '電子賀卡',
    journeyTitle: '吃一個月餅，要慢跑海濱多少次？', journeyText: '選擇月餅和食用份量，估算需要完成各條海濱路線多少次，才會消耗相若的能量。次數按體重和路線距離估算；速度只會改變每次所需時間。',
    mooncake: '月餅款式', portion: '分享份量', weight: '你的體重', speed: '慢跑速度', whole: '一個', half: '半個', quarter: '四分一個',
    routesTitle: '六段香港月色', routesText: '選擇路線，認識距離、交通與沿途特色。', transport: '前往方法', tip: '月下小貼士', chooseRoute: '計算卡路里消耗量', openGoogleMaps: '在 Google Maps 開啟', mapLocked: '路線預覽已鎖定。', mapPending: '這條路線的 Google 地圖預覽準備中。你仍可在 Google Maps 查看步行方向。',
    safetyTitle: '夜跑安全注意', safetyText: '在出門前花一分鐘檢查。', before: '出發前', during: '途中', stop: '需要停止', checked: '項已準備',
    calcTitle: '慢跑能量估算', calcText: '輸入你的體重、時間與速度。結果只在瀏覽器計算，不會被儲存。', duration: '運動時間', minutes: '分鐘', result: '估算消耗', distance: '約完成', reset: '重設', formula: '計算方式',
    shelfTitle: '圖書館資源', openBook: '查看資源', scan: '掃描開啟', libraryLoading: '正在載入圖書館資源…', libraryEmpty: '目前未有可顯示的圖書館資源。', libraryError: '暫時無法載入圖書館資源，請稍後再試。', electronicBook: '電子書', physicalBook: '實體書', coverAlt: '封面',
    source: '資料來源', disclaimer: '健康提示', disclaimerText: '所有能量、時間及距離均為教育用途估算，會因個人狀況、路線和天氣而異。運動並非用來抵銷食物；享受適量飲食，也享受活動身體。',
    about: '約', laps: '次', km: '公里', min: '分鐘', perRoute: '沿這段海濱', footer: '演藝學院圖書館', backToTop: '回到最上',
  },
  en: {
    brand: 'Running Off the Mooncake', tagline: '跑走月餅', nav: ['Mooncake journey', 'Waterfront map', 'Night safety', 'Energy calculator', 'Library resources', 'E-card'],
    eyebrow: 'Academy Libraries', heroTitle: '跑走月餅 Running Off the Mooncake',
    heroText: 'Jog the waterfront together and feel the Mid-Autumn evening breeze.', start: 'Start the journey', explore: 'Explore waterfronts', libraryCta: 'Library resources', ecardCta: 'E-card',
    journeyTitle: 'How many waterfront runs equal one mooncake?', journeyText: 'Choose a mooncake and portion to estimate how many times you would need to complete each waterfront route to use a similar amount of energy. Repetitions are based on weight and distance; speed only changes the time per route.',
    mooncake: 'Mooncake', portion: 'Portion', weight: 'Your weight', speed: 'Jogging speed', whole: 'Whole', half: 'Half', quarter: 'Quarter',
    routesTitle: 'Six shades of Hong Kong moonlight', routesText: 'Choose a route for distance, transport and local tips.', transport: 'Getting there', tip: 'Moonlit tip', chooseRoute: 'Calculate calories burned', openGoogleMaps: 'Open in Google Maps', mapLocked: 'The route preview is locked.', mapPending: 'The Google Maps preview for this route is being prepared. Walking directions are still available in Google Maps.',
    safetyTitle: 'Night running safety notes', safetyText: 'Take a minute before you leave.', before: 'Before you go', during: 'On the way', stop: 'When to stop', checked: 'ready',
    calcTitle: 'Jogging energy estimator', calcText: 'Enter your weight, time and speed. Everything is calculated locally and never stored.', duration: 'Duration', minutes: 'minutes', result: 'Estimated energy', distance: 'Approx. distance', reset: 'Reset', formula: 'How it works',
    shelfTitle: 'Library resources', openBook: 'View resource', scan: 'Scan to open', libraryLoading: 'Loading library resources…', libraryEmpty: 'There are no library resources to display yet.', libraryError: 'Library resources are temporarily unavailable. Please try again later.', electronicBook: 'eBook', physicalBook: 'Physical book', coverAlt: 'cover',
    source: 'Sources', disclaimer: 'Health note', disclaimerText: 'Energy, time and distance figures are educational estimates and vary by person, route and weather. Exercise is not a way to cancel food; enjoy food in moderation and enjoy moving too.',
    about: 'about', laps: 'times', km: 'km', min: 'min', perRoute: 'along this waterfront', footer: 'Academy Libraries', backToTop: 'Back to top',
  },
}

const mooncakes = [
  { id: 'lotus', zh: '雙黃白蓮蓉月餅', en: 'Double-yolk lotus mooncake', kcal: 790 },
  { id: 'mini', zh: '迷你奶黃月餅', en: 'Mini custard mooncake', kcal: 230 },
  { id: 'snow', zh: '冰皮月餅', en: 'Snow skin mooncake', kcal: 310 },
]

const centralEmbedUrl = 'https://www.google.com/maps/embed?pb=!1m46!1m12!1m3!1d14767.271813659792!2d114.16670003600429!3d22.284884830309856!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m31!3e2!4m5!1s0x3404006199655555%3A0x1960e58fae71aac9!2sCentral%20Pier%20No.10%2C%20Central%2C%20Hong%20Kong%20Island%2C%20Hong%20Kong!3m2!1d22.28541!2d114.16306!4m5!1s0x340400673301b959%3A0xa8c44f00a020eb98!2sTamar%20Park%2C%20Harcourt%20Rd%2C%20Admiralty%2C%20Hong%20Kong%20Island%2C%20Hong%20Kong!3m2!1d22.2816182!2d114.1655613!4m5!1s0x34040058fa2fe721%3A0xecc2248b13efd27c!2sWan%20Chai%20Ferry%20Pier%2C%20Hong%20Kong%20Island%2C%20Hong%20Kong!3m2!1d22.283248999999998!2d114.17629989999999!4m5!1s0x3404005612190881%3A0x61a023a69346893e!2sCauseway%20Bay%20Typhoon%20Shelter%20Landing%20No.%207%2C%20Victoria%20Park%20Rd%2C%20Causeway%20Bay%2C%20Hong%20Kong%20Island%2C%20Hong%20Kong!3m2!1d22.2861837!2d114.18720599999999!4m5!1s0x34040149ae363f57%3A0xce913abcf00c80cb!2sEast%20Coast%20Park%20Precinct%2C%20Watson%20Rd%2C%20Causeway%20Bay%2C%20Hong%20Kong%20Island%2C%20Hong%20Kong!3m2!1d22.2881124!2d114.18951679999999!5e0!3m2!1sen!2stw!4v1789020314262!5m2!1sen!2stw'

const routeEmbeds = {
  tst: 'https://www.google.com/maps/embed?pb=!1m40!1m12!1m3!1d29531.960521895904!2d114.15921582513053!3d22.297109200059836!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m25!3e2!4m5!1s0x340400f3152ca655%3A0x33642f548dca8445!2sClock%20Tower%2C%20Tsim%20Sha%20Tsui%2C%20Kowloon%2C%20Hong%20Kong!3m2!1d22.293678!2d114.169364!4m5!1s0x340400f19d96680b%3A0x382d1d4c1e0385b7!2sAve%20of%20Stars%2C%20Hong%20Kong!3m2!1d22.2959261!2d114.1768374!4m5!1s0x340400f1d75770b3%3A0x35f70281a3354809!2sThe%20Garden%20of%20Stars%2C%20Tsim%20Sha%20Tsui%2C%20Kowloon%2C%20Hong%20Kong!3m2!1d22.296521499999997!2d114.1759033!4m5!1s0x340400e18619bad1%3A0xc292d843cead1a1d!2sHung%20Hom%20Ferry%20Pier%2C%20Hung%20Hom%2C%20Kowloon%2C%20Hong%20Kong!3m2!1d22.301119999999997!2d114.19019999999999!5e0!3m2!1sen!2stw!4v1789023663383!5m2!1sen!2stw',
  eastCoast: 'https://www.google.com/maps/embed?pb=!1m42!1m8!1m3!1d7383.339828600286!2d114.1895851!3d22.2904903!3m2!1i1024!2i768!4f13.1!4m31!3e2!4m5!1s0x3404010054a5f60f%3A0xa13de0fbb79ec782!2sCoast%20Park%20Precinct%2C%205%20Fook%20Yum%20Rd%2C%20Causeway%20Bay%2C%20Hong%20Kong!3m2!1d22.289142599999998!2d114.1900398!4m5!1s0x34040149ae363f57%3A0xce913abcf00c80cb!2sEast%20Coast%20Park%20Precinct%2C%20Watson%20Rd%2C%20Causeway%20Bay%2C%20Hong%20Kong%20Island%2C%20Hong%20Kong!3m2!1d22.2881124!2d114.18951679999999!4m5!1s0x340401006cd61a85%3A0x7c2c4211de4a15d7!2sEast%20Coast%20Boardwalk%2C%20Island%20Eastern%20Corridor%2C%20Causeway%20Bay%2C%20Hong%20Kong%20Island%2C%20Hong%20Kong!3m2!1d22.292948!2d114.19660479999999!4m5!1s0x340401efa29e8c47%3A0x1de12b7ccd7bc5b0!2sNorth%20Point%20Promenade%2C%20North%20Point%2C%20Hong%20Kong%20Island%2C%20Hong%20Kong!3m2!1d22.2933055!2d114.2006821!4m5!1s0x3404011addbbf0f3%3A0xddef3144a99dda84!2sNorth%20Point%20Ferry%20Pier%2C%20Harbour%20Parade%2C%20Hong%20Kong%20Island%2C%20Hong%20Kong!3m2!1d22.2941999!2d114.20087649999999!5e0!3m2!1sen!2stw!4v1789023699877!5m2!1sen!2stw',
  kwunTong: 'https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d14764.44602485466!2d114.20083640251312!3d22.31162227485213!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e2!4m5!1s0x340401465895e97d%3A0xe01c8303e5b69fa0!2sKwun%20Tong%20Promenade%2C%2080%E8%99%9F%20Hoi%20Bun%20Rd%2C%20Kwun%20Tong%2C%20Kowloon%2C%20Hong%20Kong!3m2!1d22.3124127!2d114.2169821!4m5!1s0x3404013f6e8eaf83%3A0x30e479ef26791655!2sKai%20Tak%20Cruise%20Terminal%2C%20Kai%20Tak%2C%20Kowloon%2C%20Hong%20Kong!3m2!1d22.306185!2d114.213416!5e0!3m2!1sen!2stw!4v1789023752419!5m2!1sen!2stw',
  tsuenWan: 'https://www.google.com/maps/embed?pb=!1m34!1m12!1m3!1d14758.504343333327!2d114.09658625253935!3d22.36774317420736!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m19!3e2!4m5!1s0x3403f8e9d86bd7b7%3A0xa1e34ad62bdc1880!2sTsuen%20Wan%20Riviera%20Park%2C%202%E8%99%9F%20Yi%20Hong%20St%2C%20Tsuen%20Wan%2C%20New%20Territories%2C%20Hong%20Kong!3m2!1d22.3633228!2d114.1126015!4m5!1s0x3403f8e3e07f3bdd%3A0x338fe4950adc0fc7!2sTsuen%20Wan%20West%20Promenade%2C%2025%E8%99%9F%20Hoi%20On%20Rd%2C%20Tsuen%20Wan%2C%20New%20Territories%2C%20Hong%20Kong!3m2!1d22.3702072!2d114.1008373!4m5!1s0x3403f8e396da4b57%3A0x3b81bef6fc3da245!2sBelvedere%20Garden%2C%20New%20Territories%2C%20Hong%20Kong!3m2!1d22.371738099999998!2d114.1012016!5e0!3m2!1sen!2stw!4v1789023779558!5m2!1sen!2stw',
  shatin: 'https://www.google.com/maps/embed?pb=!1m26!1m8!1m3!1d14757.443775341484!2d114.1777818!3d22.3777465!3m2!1i1024!2i768!4f13.1!4m15!3e2!4m3!3m2!1d22.3818!2d114.19099999999999!4m3!3m2!1d22.39!2d114.20299999999999!4m5!1s0x340407acbfbcc3b7%3A0x867247f95720d8d1!2sSha%20Tin%20Park%2C%202%20Yuen%20Wo%20Rd%2C%20Sha%20Tin%2C%20New%20Territories%2C%20Hong%20Kong!3m2!1d22.3795777!2d114.1901434!5e0!3m2!1sen!2stw!4v1789023808932!5m2!1sen!2stw',
} as const

const routeDirections = {
  tst: 'https://www.google.com/maps/dir/Clock+Tower,+Tsim+Sha+Tsui,+Kowloon,+Hong+Kong/Ave+of+Stars,+Hong+Kong/The+Garden+of+Stars,+Tsim+Sha+Tsui,+Kowloon,+Hong+Kong/Hung+Hom+Ferry+Pier,+Hung+Hom,+Kowloon,+Hong+Kong/@22.2971092,114.1592158,14z/data=!3m1!4b1!4m26!4m25!1m5!1m1!1s0x340400f3152ca655:0x33642f548dca8445!2m2!1d114.169364!2d22.293678!1m5!1m1!1s0x340400f19d96680b:0x382d1d4c1e0385b7!2m2!1d114.1768374!2d22.2959261!1m5!1m1!1s0x340400f1d75770b3:0x35f70281a3354809!2m2!1d114.1759033!2d22.2965215!1m5!1m1!1s0x340400e18619bad1:0xc292d843cead1a1d!2m2!1d114.1902!2d22.30112!3e2?entry=ttu&g_ep=EgoyMDI2MDkwNi4wIKXMDSoASAFQAw%3D%3D',
  eastCoast: 'https://www.google.com/maps/dir/Coast+Park+Precinct,+5+Fook+Yum+Rd,+Causeway+Bay,+Hong+Kong/East+Coast+Park+Precinct,+Watson+Rd,+Causeway+Bay,+Hong+Kong+Island,+Hong+Kong/East+Coast+Boardwalk,+Island+Eastern+Corridor,+Causeway+Bay,+Hong+Kong+Island,+Hong+Kong/North+Point+Promenade,+North+Point,+Hong+Kong+Island,+Hong+Kong/North+Point+Ferry+Pier,+Harbour+Parade,+Hong+Kong+Island,+Hong+Kong/@22.2904903,114.1895851,16z/data=!4m32!4m31!1m5!1m1!1s0x3404010054a5f60f:0xa13de0fbb79ec782!2m2!1d114.1900398!2d22.2891426!1m5!1m1!1s0x34040149ae363f57:0xce913abcf00c80cb!2m2!1d114.1895168!2d22.2881124!1m5!1m1!1s0x340401006cd61a85:0x7c2c4211de4a15d7!2m2!1d114.1966048!2d22.292948!1m5!1m1!1s0x340401efa29e8c47:0x1de12b7ccd7bc5b0!2m2!1d114.2006821!2d22.2933055!1m5!1m1!1s0x3404011addbbf0f3:0xddef3144a99dda84!2m2!1d114.2008765!2d22.2941999!3e2?entry=ttu&g_ep=EgoyMDI2MDkwNi4wIKXMDSoASAFQAw%3D%3D',
  kwunTong: 'https://www.google.com/maps/dir/Kwun+Tong+Promenade,+80%E8%99%9F+Hoi+Bun+Rd,+Kwun+Tong,+Kowloon,+Hong+Kong/Kai+Tak+Cruise+Terminal,+Kai+Tak,+Kowloon,+Hong+Kong/@22.3116324,114.2059863,16z/data=!3m1!4b1!4m14!4m13!1m5!1m1!1s0x340401465895e97d:0xe01c8303e5b69fa0!2m2!1d114.2169821!2d22.3124127!1m5!1m1!1s0x3404013f6e8eaf83:0x30e479ef26791655!2m2!1d114.213416!2d22.306185!3e2?entry=ttu&g_ep=EgoyMDI2MDkwNi4wIKXMDSoASAFQAw%3D%3D',
  tsuenWan: 'https://www.google.com/maps/dir/Tsuen+Wan+Riviera+Park,+2%E8%99%9F+Yi+Hong+St,+Tsuen+Wan,+New+Territories,+Hong+Kong/Tsuen+Wan+West+Promenade,+25%E8%99%9F+Hoi+On+Rd,+Tsuen+Wan,+New+Territories,+Hong+Kong/Belvedere+Garden,+New+Territories,+Hong+Kong/@22.3677533,114.1017361,16z/data=!3m1!4b1!4m20!4m19!1m5!1m1!1s0x3403f8e9d86bd7b7:0xa1e34ad62bdc1880!2m2!1d114.1126015!2d22.3633228!1m5!1m1!1s0x3403f8e3e07f3bdd:0x338fe4950adc0fc7!2m2!1d114.1008373!2d22.3702072!1m5!1m1!1s0x3403f8e396da4b57:0x3b81bef6fc3da245!2m2!1d114.1012016!2d22.3717381!3e2?entry=ttu&g_ep=EgoyMDI2MDkwNi4wIKXMDSoASAFQAw%3D%3D',
  shatin: 'https://www.google.com/maps/dir/22.3818,114.191/22.39,114.203/Sha+Tin+Park,+2+Yuen+Wo+Rd,+Sha+Tin,+New+Territories/@22.3777465,114.1777818,14.99z/data=!4m10!4m9!1m0!1m0!1m5!1m1!1s0x340407acbfbcc3b7:0x867247f95720d8d1!2m2!1d114.1901434!2d22.3795777!3e2?entry=ttu&g_ep=EgoyMDI2MDkwNi4wIKXMDSoASAFQAw%3D%3D',
} as const

type WaterfrontRoute = {
  id: string
  zh: string
  en: string
  distance: number
  line: [number, number][]
  transportZh: string
  transportEn: string
  tipZh: string
  tipEn: string
  embedUrl?: string
  directionsUrl?: string
}

const routes: WaterfrontRoute[] = [
  { id: 'tst', zh: '尖沙咀海濱', en: 'Tsim Sha Tsui Promenade', distance: 2.9, line: [[22.293678, 114.169364], [22.30112, 114.1902]], transportZh: '尖沙咀鐘樓起步；港鐵尖東站 J 出口', transportEn: 'Start at the Clock Tower; MTR East Tsim Sha Tsui, Exit J', tipZh: '途經星光大道及星光花園，以紅磡渡輪碼頭為終點。', tipEn: 'Via Avenue of Stars and Garden of Stars, finishing at Hung Hom Ferry Pier.', embedUrl: routeEmbeds.tst, directionsUrl: routeDirections.tst },
  { id: 'central', zh: '中環至灣仔／東岸公園', en: 'Central–Wan Chai–East Coast Park', distance: 4.4, line: [[22.28541, 114.16306], [22.2881124, 114.1895168]], transportZh: '中環十號碼頭起步；港鐵香港站或中環站前往', transportEn: 'Start at Central Pier No. 10; access from Hong Kong or Central MTR Station', tipZh: '途經添馬公園、灣仔渡輪碼頭及銅鑼灣避風塘，路線以 Google Maps 當日資料為準。', tipEn: 'Via Tamar Park, Wan Chai Ferry Pier and Causeway Bay Typhoon Shelter. Follow current Google Maps information.', embedUrl: centralEmbedUrl, directionsUrl: 'https://www.google.com/maps/dir/?api=1&origin=22.28541%2C114.16306&destination=22.2881124%2C114.1895168&travelmode=walking&waypoints=22.2816182%2C114.1655613%7C22.283249%2C114.1762999%7C22.2861837%2C114.187206' },
  { id: 'east-coast', zh: '北角東岸公園', en: 'East Coast Park to North Point', distance: 2.3, line: [[22.2891426, 114.1900398], [22.2941999, 114.2008765]], transportZh: '福蔭道東岸公園起步；港鐵炮台山站 A 出口', transportEn: 'Start at Coast Park Precinct on Fook Yum Road; MTR Fortress Hill, Exit A', tipZh: '途經東岸公園、東岸板道及北角海濱花園，以北角渡輪碼頭為終點。', tipEn: 'Via East Coast Park, East Coast Boardwalk and North Point Promenade, finishing at North Point Ferry Pier.', embedUrl: routeEmbeds.eastCoast, directionsUrl: routeDirections.eastCoast },
  { id: 'kwun-tong', zh: '觀塘海濱花園至啟德', en: 'Kwun Tong Promenade to Kai Tak', distance: 3, line: [[22.3124127, 114.2169821], [22.306185, 114.213416]], transportZh: '觀塘海濱花園起步；港鐵牛頭角站 B6 出口', transportEn: 'Start at Kwun Tong Promenade; MTR Ngau Tau Kok, Exit B6', tipZh: '以啟德郵輪碼頭為終點；出發前請核對 Google Maps 顯示的行人通道。', tipEn: 'Finish at Kai Tak Cruise Terminal; check the pedestrian access shown by Google Maps before setting out.', embedUrl: routeEmbeds.kwunTong, directionsUrl: routeDirections.kwunTong },
  { id: 'tsuen-wan', zh: '荃灣海濱', en: 'Tsuen Wan Waterfront', distance: 2.3, line: [[22.3633228, 114.1126015], [22.3717381, 114.1012016]], transportZh: '荃灣海濱公園起步；可由港鐵荃灣西站前往', transportEn: 'Start at Tsuen Wan Riviera Park; access from Tsuen Wan West MTR Station', tipZh: '途經荃灣西海濱長廊，以麗城花園方向為終點。部分路段較寧靜，宜結伴同行。', tipEn: 'Via Tsuen Wan West Promenade towards Belvedere Garden. Some stretches are quieter, so go with company.', embedUrl: routeEmbeds.tsuenWan, directionsUrl: routeDirections.tsuenWan },
  { id: 'shatin', zh: '沙田城門河', en: 'Shing Mun River, Sha Tin', distance: 3.9, line: [[22.3818, 114.191], [22.3795777, 114.1901434]], transportZh: '城門河畔起步；可由港鐵沙田站前往', transportEn: 'Start beside Shing Mun River; access from Sha Tin MTR Station', tipZh: '按指定河畔座標途經城門河，以沙田公園為終點；留意單車及分段補水。', tipEn: 'Follow the supplied riverside points to Sha Tin Park; watch for bicycles and hydrate in stages.', embedUrl: routeEmbeds.shatin, directionsUrl: routeDirections.shatin },
]

function googleMapsUrl(route: WaterfrontRoute) {
  if (route.directionsUrl) return route.directionsUrl
  const origin = route.line[0]
  const destination = route.line.at(-1) ?? origin
  const params = new URLSearchParams({
    api: '1',
    origin: `${origin[0]},${origin[1]}`,
    destination: `${destination[0]},${destination[1]}`,
    travelmode: 'walking',
  })
  return `https://www.google.com/maps/dir/?${params.toString()}`
}

const libraryCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQuH-ct_RJapHBKleDnpXfI1HTB9HRM7ie77Oy4KIcqToP_1vA_i-cNHFsVi6uP_PBSPnzM0GJNqO_b/pub?output=csv'

type LibraryBook = {
  title: string
  link: string
  cover?: string
  type: string
}

function httpUrl(value: string) {
  try {
    const url = new URL(value.trim())
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : ''
  } catch {
    return ''
  }
}

function parseLibraryBooks(csv: string) {
  const result = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
    transform: (value) => value.trim(),
  })

  return result.data.flatMap<LibraryBook>((row) => {
    const title = row.Title ?? ''
    const link = httpUrl(row.Link ?? '')
    if (!title || !link) return []
    return [{ title, link, cover: httpUrl(row.Cover ?? '') || undefined, type: row.Type ?? '' }]
  })
}

const safetyItems = {
  before: { zh: ['查看香港天文台天氣及警告', '穿著合適鞋履及反光衣物', '帶備足夠飲用水', '告知親友路線和回程時間'], en: ['Check HKO weather and warnings', 'Wear suitable shoes and reflective clothing', 'Bring enough drinking water', 'Share your route and return time'] },
  during: { zh: ['選擇光線充足的路線', '保持警覺並留意單車', '以 5 至 10 分鐘熱身開始'], en: ['Choose a well-lit route', 'Stay alert and watch for bicycles', 'Begin with a 5–10 minute warm-up'] },
  stop: { zh: ['感到頭暈、噁心或氣促時立即停止', '不適時尋求協助或醫療意見'], en: ['Stop for dizziness, nausea or shortness of breath', 'Seek help or medical advice when unwell'] },
}

function metForSpeed(speed: number) {
  if (speed < 6.5) return 6
  if (speed < 8) return 7.5
  if (speed < 9.5) return 8.5
  return 9.8
}

function caloriesForRoute(weight: number, distance: number) {
  return weight * distance
}

function App() {
  const [language, setLanguage] = useState<Language>(() => localStorage.getItem('moonlit-language') === 'en' ? 'en' : 'zh')
  const [mooncakeId, setMooncakeId] = useState('lotus')
  const [portion, setPortion] = useState(1)
  const [weight, setWeight] = useState(60)
  const [speed, setSpeed] = useState(7)
  const [duration, setDuration] = useState(40)
  const [activeRoute, setActiveRoute] = useState(routes[1])
  const [checks, setChecks] = useState<string[]>([])
  const [books, setBooks] = useState<LibraryBook[]>([])
  const [libraryStatus, setLibraryStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [showBackToTop, setShowBackToTop] = useState(false)
  const t = copy[language]
  const mooncake = mooncakes.find((item) => item.id === mooncakeId) ?? mooncakes[0]
  const mooncakeEnergy = mooncake.kcal * portion
  const met = metForSpeed(speed)
  const caloriesPerMinute = (met * weight) / 60
  const calculatedCalories = caloriesPerMinute * duration
  const calculatedDistance = speed * duration / 60
  const toggleCheck = (item: string) => setChecks((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-HK' : 'en'
    localStorage.setItem('moonlit-language', language)
  }, [language])

  useEffect(() => {
    const updateBackToTop = () => setShowBackToTop(window.scrollY > 500)
    updateBackToTop()
    window.addEventListener('scroll', updateBackToTop, { passive: true })
    return () => window.removeEventListener('scroll', updateBackToTop)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetch(libraryCsvUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Library CSV returned ${response.status}`)
        return response.text()
      })
      .then((csv) => {
        setBooks(parseLibraryBooks(csv))
        setLibraryStatus('ready')
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setLibraryStatus('error')
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (libraryStatus === 'loading' || !window.location.hash) return
    document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: 'auto' })
  }, [libraryStatus])

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label={t.brand}><Moon size={23} /><span>{t.brand}<small>{t.tagline}</small></span></a>
        <nav aria-label="Primary">{t.nav.map((item, index) => <a key={item} href={`#${['journey', 'routes', 'safety', 'calculator', 'library', 'e-card'][index]}`}>{item}</a>)}</nav>
        <button className="language-button" onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}><Languages size={18} />{language === 'zh' ? 'EN' : '中文'}</button>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-content"><p className="eyebrow">{t.eyebrow}</p><h1 className={language === 'en' ? 'hero-title-en' : undefined}>{t.heroTitle}</h1><p className="hero-copy">{t.heroText}</p><div className={`hero-actions${language === 'en' ? ' hero-actions-en' : ''}`}><a className="button primary" href="#journey">{t.start}<ChevronRight size={18} /></a><a className="button ghost" href="#routes">{t.explore}</a><a className="button ghost" href="#library">{t.libraryCta}</a><a className="button ghost" href="#e-card">{t.ecardCta}</a></div></div>
          <div className="moon-stage" aria-hidden="true"><div className="moon-disc"><span>中秋</span><small>2026</small></div><div className="skyline" /></div>
        </section>

        <section className="section journey-section" id="journey">
          <div className="section-heading"><p className="section-number">01 / TASTE & MOVE</p><h2>{t.journeyTitle}</h2><p>{t.journeyText}</p></div>
          <div className="journey-grid">
            <div className="control-panel">
              <label>{t.mooncake}<select value={mooncakeId} onChange={(event) => setMooncakeId(event.target.value)}>{mooncakes.map((item) => <option key={item.id} value={item.id}>{language === 'zh' ? item.zh : item.en} · {item.kcal} kcal</option>)}</select></label>
              <fieldset><legend>{t.portion}</legend><div className="segments">{[[1, t.whole], [0.5, t.half], [0.25, t.quarter]].map(([value, label]) => <button key={String(value)} className={portion === value ? 'active' : ''} onClick={() => setPortion(Number(value))}>{label}</button>)}</div></fieldset>
              <label>{t.weight}<span className="range-value">{weight} kg</span><input type="range" min="40" max="110" value={weight} onChange={(event) => setWeight(Number(event.target.value))} /></label>
              <label>{t.speed}<span className="range-value">{speed.toFixed(1)} km/h</span><input type="range" min="5" max="12" step="0.5" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} /></label>
              <div className="energy-orbit"><span>{Math.round(mooncakeEnergy)}</span><small>kcal</small></div>
            </div>
            <div className="route-results">{routes.map((route, index) => { const routeMinutes = route.distance / speed * 60; const laps = mooncakeEnergy / caloriesForRoute(weight, route.distance); return <button className="route-result" key={route.id} onClick={() => { setActiveRoute(route); document.querySelector('#routes')?.scrollIntoView({ behavior: 'smooth' }) }}><span className="route-index">{String(index + 1).padStart(2, '0')}</span><span><strong>{language === 'zh' ? route.zh : route.en}</strong><small>{route.distance} {t.km} · {Math.round(routeMinutes)} {t.min}</small></span><b><small>{t.about}</small>{laps.toFixed(1)}<small>{t.laps}</small></b></button> })}</div>
          </div>
        </section>

        <section className="section map-section" id="routes">
          <div className="section-heading light"><p className="section-number">02 / HARBOUR</p><h2>{t.routesTitle}</h2><p>{t.routesText}</p></div>
          <div className="map-layout">
            <div className="map-wrap">
              {activeRoute.embedUrl ? <><iframe className="google-map-embed" src={activeRoute.embedUrl} title={`${language === 'zh' ? activeRoute.zh : activeRoute.en} Google Maps`} loading="lazy" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" tabIndex={-1} /><p className="map-lock-note"><ShieldCheck size={15} />{t.mapLocked}</p></> : <div className="map-placeholder"><MapPin size={36} /><strong>{language === 'zh' ? activeRoute.zh : activeRoute.en}</strong><p>{t.mapPending}</p><a className="button primary" href={googleMapsUrl(activeRoute)} target="_blank" rel="noreferrer">{t.openGoogleMaps}<ExternalLink size={16} /></a></div>}
            </div>
            <aside className="route-detail"><span className="route-count">0{routes.indexOf(activeRoute) + 1}</span><MapPin size={22} /><h3>{language === 'zh' ? activeRoute.zh : activeRoute.en}</h3><div className="distance-stat"><strong>{activeRoute.distance}</strong><span>{t.km}<small>{t.perRoute}</small></span></div><dl><dt>{t.transport}</dt><dd>{language === 'zh' ? activeRoute.transportZh : activeRoute.transportEn}</dd><dt>{t.tip}</dt><dd>{language === 'zh' ? activeRoute.tipZh : activeRoute.tipEn}</dd></dl><div className="route-actions"><a className="text-link" href={googleMapsUrl(activeRoute)} target="_blank" rel="noreferrer">{t.openGoogleMaps}<ExternalLink size={16} /></a><a className="text-link secondary" href="#calculator">{t.chooseRoute}<ChevronRight size={17} /></a></div></aside>
          </div>
          <div className="route-tabs">{routes.map((route) => <button key={route.id} className={activeRoute.id === route.id ? 'active' : ''} onClick={() => setActiveRoute(route)}>{language === 'zh' ? route.zh : route.en}</button>)}</div>
        </section>

        <section className="section safety-section" id="safety">
          <div className="section-heading"><p className="section-number">03 / READY</p><h2>{t.safetyTitle}</h2><p>{t.safetyText}</p></div>
          <div className="safety-grid">{(['before', 'during', 'stop'] as const).map((stage, index) => <div className={`safety-column stage-${index}`} key={stage}><span className="stage-icon">{index === 0 ? <Moon /> : index === 1 ? <ShieldCheck /> : <MapPin />}</span><h3>{t[stage]}</h3>{safetyItems[stage][language].map((item) => <label className="check-item" key={item}><input type="checkbox" checked={checks.includes(item)} onChange={() => toggleCheck(item)} /><span className="custom-check"><Check size={14} /></span>{item}</label>)}</div>)}</div>
          <div className="safety-progress"><span>{checks.length} / 9 {t.checked}</span><div><i style={{ width: `${checks.length / 9 * 100}%` }} /></div></div>
        </section>

        <section className="section calculator-section" id="calculator">
          <div className="calculator-copy"><p className="section-number">04 / ESTIMATE</p><h2>{t.calcTitle}</h2><p>{t.calcText}</p><div className="formula-note"><strong>{t.formula}</strong><code>MET × kg × hours = kcal</code><span>MET {met} · {speed.toFixed(1)} km/h</span></div></div>
          <div className="calculator-card"><div className="calculator-inputs"><label>{t.weight}<span><input type="number" min="30" max="200" value={weight} onChange={(event) => setWeight(Number(event.target.value))} />kg</span></label><label>{t.duration}<span><input type="number" min="5" max="300" value={duration} onChange={(event) => setDuration(Number(event.target.value))} />{t.minutes}</span></label><label>{t.speed}<span><input type="number" min="4" max="16" step="0.5" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} />km/h</span></label></div><div className="calorie-result"><p>{t.result}</p><strong>{Math.round(calculatedCalories)}</strong><span>kcal</span><div><b>{calculatedDistance.toFixed(1)} {t.km}</b><small>{t.distance}</small></div></div><button className="reset-button" onClick={() => { setWeight(60); setDuration(40); setSpeed(7) }}><RotateCcw size={16} />{t.reset}</button></div>
        </section>

        <section className="section library-section" id="library">
          <div className="section-heading"><p className="section-number">05 / READ ON</p><h2>{t.shelfTitle}</h2></div>
          {libraryStatus === 'loading' && <p className="library-status" role="status">{t.libraryLoading}</p>}
          {libraryStatus === 'error' && <p className="library-status error" role="alert">{t.libraryError}</p>}
          {libraryStatus === 'ready' && books.length === 0 && <p className="library-status">{t.libraryEmpty}</p>}
          {libraryStatus === 'ready' && books.length > 0 && <div className="book-grid">{books.map((book) => <article className="book-card" key={book.link}><div className="book-cover"><strong>{book.title}</strong>{book.cover && <img src={book.cover} alt={`${book.title} ${t.coverAlt}`} loading="lazy" referrerPolicy="no-referrer" onError={(event) => { event.currentTarget.hidden = true }} />}<span>{language === 'zh' ? book.type.toLowerCase() === 'ebook' ? t.electronicBook : t.physicalBook : book.type || t.physicalBook}</span></div><div className="book-info"><BookOpen size={18} /><h3>{book.title}</h3><p>{language === 'zh' ? book.type.toLowerCase() === 'ebook' ? t.electronicBook : t.physicalBook : book.type || t.physicalBook}</p><div className="book-actions"><a href={book.link} target="_blank" rel="noreferrer">{t.openBook}<ExternalLink size={15} /></a><div className="qr"><QRCodeSVG value={book.link} size={64} title={t.scan} /><small>{t.scan}</small></div></div></div></article>)}</div>}
        </section>

        <ECardSection key={language} language={language} />

        <section className="source-band"><div><ShieldCheck /><span><strong>{t.disclaimer}</strong>{t.disclaimerText}</span></div><a href="https://www.chp.gov.hk/en/static/90004.html" target="_blank" rel="noreferrer">{t.source}<ExternalLink size={15} /></a></section>
      </main>
      <footer><span>{t.footer}</span><span>© 2026 · Google Maps</span></footer>
      <button className={`back-to-top${showBackToTop ? ' visible' : ''}`} type="button" aria-label={t.backToTop} title={t.backToTop} onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}><ArrowUp aria-hidden="true" /></button>
    </div>
  )
}

export default App