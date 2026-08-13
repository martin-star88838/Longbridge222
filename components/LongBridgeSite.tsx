"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, Collapse, Drawer, Form, Grid, Input, InputNumber, Select } from "@arco-design/web-react";
import { IconArrowRight, IconClose, IconDown, IconLanguage, IconMenu } from "@arco-design/web-react/icon";

type Lang = "ru" | "en" | "zh";
type Page = "home" | "equipment" | "tricycles";
type RequestKind = Exclude<Page, "home">;

type RequestFormValues = {
  equipmentType?: string;
  useCase?: string;
  brandModel?: string;
  capacity?: string;
  year?: string;
  quantity?: number;
  payload?: string;
  range?: string;
  configuration?: string;
  budget?: number;
  country?: string;
  destination?: string;
  timing?: string;
  notes?: string;
};

type CurrencyCode = "USD" | "EUR" | "GBP" | "NGN" | "GHS" | "KES" | "TZS" | "ZAR" | "AED" | "SAR" | "EGP" | "MXN" | "BRL" | "RUB" | "KZT" | "IDR" | "PHP" | "MYR" | "THB" | "VND" | "INR" | "PKR" | "TRY" | "AUD" | "CAD";

const currencySymbols: Record<CurrencyCode, string> = {
  USD: "$", EUR: "€", GBP: "£", NGN: "₦", GHS: "₵", KES: "KSh", TZS: "TSh", ZAR: "R", AED: "د.إ", SAR: "﷼", EGP: "E£",
  MXN: "$", BRL: "R$", RUB: "₽", KZT: "₸", IDR: "Rp", PHP: "₱", MYR: "RM", THB: "฿", VND: "₫", INR: "₹", PKR: "₨", TRY: "₺", AUD: "A$", CAD: "C$",
};

const destinationCountries: {
  value: string;
  labels: Record<Lang, string>;
  currency: CurrencyCode;
  destinations: string[];
}[] = [
  { value: "United States", labels: { zh: "美国", en: "United States", ru: "США" }, currency: "USD", destinations: ["Los Angeles", "Long Beach", "Houston", "New York / New Jersey", "Savannah"] },
  { value: "Nigeria", labels: { zh: "尼日利亚", en: "Nigeria", ru: "Нигерия" }, currency: "NGN", destinations: ["Lagos / Apapa", "Tin Can Island", "Onne", "Port Harcourt"] },
  { value: "Ghana", labels: { zh: "加纳", en: "Ghana", ru: "Гана" }, currency: "GHS", destinations: ["Tema", "Takoradi", "Accra"] },
  { value: "Kenya", labels: { zh: "肯尼亚", en: "Kenya", ru: "Кения" }, currency: "KES", destinations: ["Mombasa", "Nairobi"] },
  { value: "Tanzania", labels: { zh: "坦桑尼亚", en: "Tanzania", ru: "Танзания" }, currency: "TZS", destinations: ["Dar es Salaam", "Zanzibar", "Mwanza"] },
  { value: "South Africa", labels: { zh: "南非", en: "South Africa", ru: "ЮАР" }, currency: "ZAR", destinations: ["Durban", "Cape Town", "Johannesburg", "Port Elizabeth"] },
  { value: "United Arab Emirates", labels: { zh: "阿联酋", en: "United Arab Emirates", ru: "ОАЭ" }, currency: "AED", destinations: ["Jebel Ali / Dubai", "Abu Dhabi", "Sharjah"] },
  { value: "Saudi Arabia", labels: { zh: "沙特阿拉伯", en: "Saudi Arabia", ru: "Саудовская Аравия" }, currency: "SAR", destinations: ["Jeddah", "Dammam", "Riyadh"] },
  { value: "Egypt", labels: { zh: "埃及", en: "Egypt", ru: "Египет" }, currency: "EGP", destinations: ["Alexandria", "Port Said", "Cairo", "Sokhna"] },
  { value: "Mexico", labels: { zh: "墨西哥", en: "Mexico", ru: "Мексика" }, currency: "MXN", destinations: ["Manzanillo", "Veracruz", "Lázaro Cárdenas", "Mexico City"] },
  { value: "Brazil", labels: { zh: "巴西", en: "Brazil", ru: "Бразилия" }, currency: "BRL", destinations: ["Santos", "Rio de Janeiro", "Paranaguá", "São Paulo"] },
  { value: "Russia", labels: { zh: "俄罗斯", en: "Russia", ru: "Россия" }, currency: "RUB", destinations: ["Vladivostok", "Novorossiysk", "Saint Petersburg", "Moscow"] },
  { value: "Kazakhstan", labels: { zh: "哈萨克斯坦", en: "Kazakhstan", ru: "Казахстан" }, currency: "KZT", destinations: ["Almaty", "Astana", "Aktau"] },
  { value: "Indonesia", labels: { zh: "印度尼西亚", en: "Indonesia", ru: "Индонезия" }, currency: "IDR", destinations: ["Jakarta / Tanjung Priok", "Surabaya", "Medan", "Makassar"] },
  { value: "Philippines", labels: { zh: "菲律宾", en: "Philippines", ru: "Филиппины" }, currency: "PHP", destinations: ["Manila", "Cebu", "Davao", "Subic"] },
  { value: "Malaysia", labels: { zh: "马来西亚", en: "Malaysia", ru: "Малайзия" }, currency: "MYR", destinations: ["Port Klang", "Penang", "Johor Port", "Kuala Lumpur"] },
  { value: "Thailand", labels: { zh: "泰国", en: "Thailand", ru: "Таиланд" }, currency: "THB", destinations: ["Laem Chabang", "Bangkok"] },
  { value: "Vietnam", labels: { zh: "越南", en: "Vietnam", ru: "Вьетнам" }, currency: "VND", destinations: ["Ho Chi Minh City / Cat Lai", "Hai Phong", "Da Nang"] },
  { value: "India", labels: { zh: "印度", en: "India", ru: "Индия" }, currency: "INR", destinations: ["Mumbai / Nhava Sheva", "Chennai", "Mundra", "Kolkata"] },
  { value: "Pakistan", labels: { zh: "巴基斯坦", en: "Pakistan", ru: "Пакистан" }, currency: "PKR", destinations: ["Karachi", "Port Qasim", "Lahore"] },
  { value: "Turkey", labels: { zh: "土耳其", en: "Turkey", ru: "Турция" }, currency: "TRY", destinations: ["Istanbul", "Mersin", "Izmir"] },
  { value: "United Kingdom", labels: { zh: "英国", en: "United Kingdom", ru: "Великобритания" }, currency: "GBP", destinations: ["Felixstowe", "Southampton", "London", "Liverpool"] },
  { value: "Germany", labels: { zh: "德国", en: "Germany", ru: "Германия" }, currency: "EUR", destinations: ["Hamburg", "Bremerhaven", "Duisburg"] },
  { value: "Australia", labels: { zh: "澳大利亚", en: "Australia", ru: "Австралия" }, currency: "AUD", destinations: ["Sydney", "Melbourne", "Brisbane", "Fremantle"] },
  { value: "Canada", labels: { zh: "加拿大", en: "Canada", ru: "Канада" }, currency: "CAD", destinations: ["Vancouver", "Montreal", "Toronto", "Halifax"] },
];

const WA = "https://wa.me/8613336176818?text=Hello%20LongBridge%2C%20I%20would%20like%20to%20send%20a%20sourcing%20request.";

const copy = {
  ru: {
    navHome: "Главная", navEquipment: "Подержанная спецтехника", navTricycles: "Электротрициклы", more: "Меню", contact: "Отправить запрос",
    homeTag: "Цзянсу · Сюйчжоу", aboutTitle: "Местная команда по закупке техники в Сюйчжоу", aboutBody: "LongBridge находится в Сюйчжоу. Через одного специалиста вы координируете поиск, проверку, договор, экспорт и перевозку.",
    heroTitle: "LongBridge — сопровождение закупок в Китае", heroBody: "Один специалист ведёт поиск, проверку, договор и отправку.",
    processTitle: "От запроса до поставки — 4 шага", processBody: "Каждый этап согласуется до перехода к следующему.",
    steps: [["01", "Отправьте запрос", "Товар, параметры, количество, бюджет и страна."], ["02", "Получите варианты", "Товар, цена и данные поставщика."], ["03", "Проверьте до оплаты", "Комплектация, документы, состояние и договор."], ["04", "Получите поставку", "Договор, экспорт, перевозка и документы."]],
    servicesTitle: "Выберите категорию закупки", servicesBody: "Посмотрите, что мы найдём, проверим и организуем.",
    equipmentTitle: "Подержанная строительная техника", equipmentBody: "Подбор по марке, модели, году, наработке и бюджету.",
    tricycleTitle: "Грузовые электротрициклы", tricycleBody: "Подбор модели и завода по назначению, нагрузке и запасу хода.", explore: "Подробнее", faqTitle: "Частые вопросы",
    faqs: [["Можно назначить независимую инспекцию?", "Да. Выберите инспектора сами или поручите координацию нам."], ["Кому перечисляется оплата?", "Сторона договора и получатель платежа подтверждаются до сделки."], ["Можно посмотреть технику по видеосвязи?", "Да. Покажем конкретную машину и выбранные вами узлы."], ["Сколько занимает отправка?", "Срок зависит от проверки, подготовки техники и бронирования перевозки."]],
    finalTitle: "Отправьте запрос на закупку", finalBody: "Укажите товар, количество, бюджет и страну.", footerLocation: "LongBridge · Сюйчжоу, Китай",
  },
  en: {
    navHome: "Home", navEquipment: "Used construction machinery", navTricycles: "Electric tricycles", more: "Menu", contact: "Send sourcing request",
    homeTag: "Jiangsu · Xuzhou", aboutTitle: "A local construction machinery sourcing team in Xuzhou", aboutBody: "LongBridge is based in Xuzhou. One point of contact coordinates sourcing, inspection, contracts, export and transport.",
    heroTitle: "LongBridge coordinates sourcing from China", heroBody: "One contact manages sourcing, verification, contract and shipment.",
    processTitle: "From request to delivery in 4 steps", processBody: "Each stage is confirmed before the next begins.",
    steps: [["01", "Send your request", "Product, specifications, quantity, budget and destination."], ["02", "Review options", "Product, quotation and supplier details."], ["03", "Verify before payment", "Configuration, documents, condition and contract."], ["04", "Receive delivery", "Contract, export, transport and documents."]],
    servicesTitle: "Choose what you want to source", servicesBody: "See what we source, verify and coordinate.",
    equipmentTitle: "Used construction machinery", equipmentBody: "Source by brand, model, year, hours and budget.",
    tricycleTitle: "Electric cargo tricycles", tricycleBody: "Match models and factories by use case, payload and range.", explore: "View details", faqTitle: "Frequently asked questions",
    faqs: [["Can I appoint an independent inspector?", "Yes. Appoint one directly or ask us to coordinate."], ["Who receives payment?", "The contracting party and payment recipient are confirmed before the deal."], ["Can I view the machine live?", "Yes. View the specific machine and the areas you select."], ["How long does shipment take?", "Timing depends on inspection, preparation and transport booking."]],
    finalTitle: "Send your sourcing request", finalBody: "Tell us the product, quantity, budget and destination.", footerLocation: "LongBridge · Xuzhou, China",
  },
  zh: {
    navHome: "首页", navEquipment: "二手工程机械", navTricycles: "电动三轮车", more: "菜单", contact: "发送采购需求",
    homeTag: "江苏 · 徐州", aboutTitle: "徐州本地的工程机械采购服务团队", aboutBody: "LongBridge位于徐州。您通过一个对接窗口，完成寻车、验机、合同、出口和运输协调。",
    heroTitle: "LongBridge为您提供标准、透明的中国采购服务", heroBody: "一个对接窗口，推进寻源、核验、合同和出口发运。",
    processTitle: "从需求到交付，4步完成", processBody: "每一步确认后再推进。",
    steps: [["01", "发送需求", "品类、参数、数量、预算和目的国。"], ["02", "查看方案", "具体产品、报价和供货方信息。"], ["03", "付款前确认", "配置、资料、状态和合同。"], ["04", "出口交付", "签约、出口、运输和文件。"]],
    servicesTitle: "选择采购品类", servicesBody: "查看可采购范围、核验方式和流程。",
    equipmentTitle: "二手工程机械", equipmentBody: "按品牌、型号、年份、工时和预算寻找具体设备。",
    tricycleTitle: "货运电动三轮车", tricycleBody: "按用途、载重、续航和目的国匹配车型与工厂。", explore: "查看详情", faqTitle: "常见问题",
    faqs: [["可以指定独立第三方检测吗？", "可以。您可自行指定，也可由我们协调。"], ["采购款支付给谁？", "签约与收款主体会在交易前确认。"], ["可以实时视频看车吗？", "可以。具体设备可按您的要求查看重点部位。"], ["从确认到发运需要多久？", "取决于验机、整备和订舱，锁定设备后提供时间表。"]],
    finalTitle: "发送采购需求", finalBody: "告诉我们产品、数量、预算和目的国", footerLocation: "LongBridge · 中国徐州",
  },
} as const;

const equipmentCopy = {
  ru: {
    heroTag: "Цзянсу · Сюйчжоу", heading: "Надёжный поиск техники по стандартному и прозрачному процессу", intro: "Укажите марку, тоннаж, год, бюджет и порт назначения, чтобы получить конкретную технику, проверку, расходы и маршрут экспорта.",
    coreLabel: "Основная услуга", coreTitle: "подбор подержанной грузоподъёмной техники", coreBody: "Опираясь на 20-летний опыт аренды кранов, мы понимаем реальные условия работы, типовые неисправности и стоимость эксплуатации. Подбираем собственную технику, варианты партнёров и машины по заданным параметрам.",
    sourceOwn: "Собственная техника", sourceNetwork: "Профессиональный подбор", rangeBody: "Через производственную и торговую базу Сюйчжоу мы также подбираем другие категории подержанной строительной техники с тем же сопровождением.", categories: ["Дорожная техника", "Погрузчики", "Подъёмные платформы", "Дорожная техника", "Экскаваторы", "Бетонная техника"],
    processTitle: "Процесс закупки", processBody: "От выбора машины до отправки — поэтапно подтверждаем технику, расходы и ответственность.",
    steps: [["01", "Подтвердить требования", "Марка, модель, тоннаж, год, бюджет, условия работы и порт."], ["02", "Посмотреть варианты", "Номер машины, фото, состояние, источник и подробная цена."], ["03", "Проверить машину", "Видео в реальном времени и независимая проверка при необходимости."], ["04", "Подтвердить договор", "Машина, результат проверки, расходы, оплата и ответственность."], ["05", "Оформить отправку", "Таможня, бронирование, погрузка, документы и статус перевозки."]],
    verifyTitle: "Четыре гарантии прозрачной проверки", verifyBody: "До оплаты подтверждаем идентичность, состояние, результаты проверки и условия договора.",
    verifyCards: [["Проверить идентичность", "Номер, VIN, табличка и документы соответствуют машине."], ["Проверить узлы и работу", "Холодный запуск, двигатель, гидравлика, ходовая, стрела и лебёдка."], ["Независимая инспекция", "При необходимости организуем проверку и предоставим отчёт."], ["Внести отчёт в договор", "Параметры, состояние, замечания и документы включаются в договор."]],
    complianceTitle: "Проверяемый экспортёр и разрешения для каждой машины", complianceBody: "Экспорт оформляет партнёр с регистрациями и разрешениями для соответствующего типа техники и таможенного кода. До подписания подтверждаются договор, получатель платежа и экспортёр.",
    faqs: [["Можно проверить машину до оплаты?", "Да. Доступны осмотр на месте, видеопроверка и независимая инспекция."], ["Сколько стоит проверка?", "Стоимость зависит от местонахождения машины и объёма проверки и подтверждается заранее."], ["Кому перечисляется оплата?", "Получатель платежа и этапы оплаты указываются в договоре."], ["Сколько времени занимает отправка?", "Срок зависит от проверки, подготовки и бронирования перевозки."]],
  },
  en: {
    heroTag: "Jiangsu · Xuzhou", heading: "Find reliable used construction machinery through a standardized, transparent process", intro: "Send the brand, capacity, year, budget and destination port to receive specific machines, an inspection plan, itemized costs and an export route.",
    coreLabel: "Core service", coreTitle: "used lifting machinery sourcing", coreBody: "Backed by 20 years in crane rental, we understand real working conditions, common faults and operating costs. We match our own fleet, long-term partner sources and machines found to your specifications.",
    sourceOwn: "Own lifting machinery", sourceNetwork: "Professional sourcing", rangeBody: "Through Xuzhou’s machinery manufacturing and trading base, we also source other used construction machinery with the same end-to-end service.", categories: ["Road machinery", "Forklifts", "Aerial platforms", "Road machinery", "Excavators", "Concrete machinery"],
    processTitle: "Sourcing process", processBody: "From selection to shipment, the machine, costs and responsibilities are confirmed step by step.",
    steps: [["01", "Confirm requirements", "Brand, model, capacity, year, budget, use case and destination port."], ["02", "Review candidates", "Machine ID, photos, known condition, source and itemized quotation."], ["03", "Inspect the machine", "Live video inspection and independent testing when required."], ["04", "Confirm contract and payment", "Machine, inspection result, costs, payment stages and responsibilities."], ["05", "Arrange export and shipment", "Customs, booking, loading, documents and transport milestones."]],
    verifyTitle: "Four safeguards for transparent inspection", verifyBody: "Before payment, confirm identity, actual condition, inspection results and contract terms.",
    verifyCards: [["Confirm the machine identity", "Match the machine ID, VIN, nameplate and records to the machine."], ["Test key parts and movements", "Check cold start, engine, hydraulics, undercarriage, boom and winch."], ["Independent inspection", "Arrange third-party testing and receive a report when required."], ["Include the report in the contract", "State the specifications, condition, issues and documents in the contract."]],
    complianceTitle: "Verifiable exporter and machine-specific permits", complianceBody: "Export is handled by a partner with the registrations and permits required for the machinery type and customs code. Contracting, payment and export entities are confirmed before signing.",
    faqs: [["Can I inspect the machine before payment?", "Yes. On-site viewing, live video inspection and third-party testing are available."], ["How much does inspection cost?", "It depends on location and scope; the price is confirmed before inspection."], ["Who receives payment?", "The payment recipient and payment stages are written into the contract."], ["How long does shipment take?", "Timing depends on inspection, preparation and transport booking."]],
  },
  zh: {
    heroTag: "江苏 · 徐州", heading: "以标准化、透明化的流程，为您寻找可靠的二手工程机械", intro: "提交品牌、吨位、年份、预算和目的港，获得具体设备、验机方案、分项费用与出口路径。",
    coreLabel: "核心服务", coreTitle: "二手起重机械采购", coreBody: "依托20年起重机械租赁业务积累，我们熟悉真实工况、常见问题和使用成本。优先匹配自有及合作车源，也可按品牌、吨位、年份和预算定向寻找。",
    sourceOwn: "自有起重机械", sourceNetwork: "专业的采购服务", rangeBody: "依托江苏徐州强大的工程机械制造与集散能力，我们还承接其他二手工程机械采购，并提供同样的一站式采购服务。", categories: ["道路机械", "叉车", "高空作业机械", "道路机械", "挖掘机械", "混凝土机械"],
    processTitle: "采购流程", processBody: "从选车到发运，设备、费用与责任逐项确认",
    steps: [["01", "确认采购标准", "确认品牌、型号、吨位、年份、预算、工况和目的港。"], ["02", "查看候选设备", "查看设备编号、实拍资料、已知车况、车源身份和分项报价。"], ["03", "完成设备验机", "实时视频看车；按需安排第三方检测并确认问题项。"], ["04", "确认合同与付款", "合同写明设备、验机结论、费用、付款节点和责任主体。"], ["05", "办理出口发运", "完成报关、订舱和装运，交付单证并同步运输节点。"]],
    verifyTitle: "四项保障,透明验车", verifyBody: "每项确认都对应具体资料、实拍记录或检测报告。",
    verifyCards: [["设备身份核对", "设备编号、车架号、铭牌、登记资料与实车对应。"], ["关键部位检测", "检查冷启动、发动机、液压、底盘、吊臂、卷扬和工作动作。"], ["第三方检测可选", "需要独立判断时，可安排第三方检测并提供报告。"], ["报告写入合同", "确认的参数、车况、问题项和随车资料写入合同。"]],
    complianceTitle: "出口主体可查，所需许可按设备确认", complianceBody: "根据设备类型和海关编码，由具备相应备案、许可条件的合作企业办理出口。签约前确认合同、收款和出口主体；如需出口许可证，提供对应许可信息。",
    faqs: [["可以在付款前看车和验机吗？", "可以。支持现场看车、实时视频验机，也可委托第三方检测。"], ["验机费用是多少？", "根据设备所在地、检测范围和第三方报价确认，安排前先告知费用。"], ["款项支付给谁？", "收款主体和付款节点写入合同，确认设备及交易条件后再付款。"], ["从确认设备到发运需要多久？", "取决于验机、整备和订舱。锁定设备后提供时间表并同步进度。"]],
  },
} as const;

const tricycleCopy = {
  ru: { heroTag: "Цзянсу · Сюйчжоу · Фэнсянь", heading: "Закупка грузовых электротрициклов", intro: "Укажите назначение, нагрузку, запас хода и страну — получите подходящую модель, комплектацию и завод.", applications: ["Доставка", "Строительство", "Сельское хозяйство", "Розничная торговля"] },
  en: { heroTag: "Feng County · Xuzhou, Jiangsu", heading: "Source electric cargo tricycles", intro: "Send the use case, payload, range and destination to receive matching models, configurations and factories.", applications: ["Last-mile delivery", "Construction", "Agriculture", "Local retail"] },
  zh: { heroTag: "江苏 · 徐州丰县", heading: "采购货运电动三轮车", intro: "提交用途、载重、续航和目的国，获取匹配车型、配置与工厂。", applications: ["末端配送", "工程运输", "农业运输", "本地零售"] },
} as const;

const requestFormCopy = {
  zh: {
    equipmentTitle: "发送二手工程机械采购需求", tricycleTitle: "发送电动三轮车采购需求",
    intro: "信息提交后将通过WhatsApp发送", submit: "通过 WhatsApp 发送需求",
    equipmentType: "设备类型", useCase: "使用场景", brandModel: "品牌 / 型号", capacity: "吨位", year: "年份范围", quantity: "采购数量",
    payload: "载重要求", range: "续航要求", configuration: "配置要求", budget: "预算", country: "目的国家", destination: "目的港 / 城市", timing: "计划采购时间", notes: "其他要求",
    selectPlaceholder: "请选择或搜索", inputPlaceholder: "请填写", optional: "选填", required: "请填写必填项", currency: "货币",
    equipmentOptions: ["起重机械", "挖掘机", "装载机", "道路机械", "叉车", "高空作业机械", "其他"],
    useOptions: ["末端配送", "工程运输", "农业运输", "本地零售", "其他"],
    timingOptions: ["立即采购", "1个月内", "1–3个月", "3个月以后", "尚未确定"],
  },
  en: {
    equipmentTitle: "Send a used machinery sourcing request", tricycleTitle: "Send an electric tricycle sourcing request",
    intro: "Your information will be sent through WhatsApp.", submit: "Send request via WhatsApp",
    equipmentType: "Equipment type", useCase: "Use case", brandModel: "Brand / model", capacity: "Capacity", year: "Year range", quantity: "Quantity",
    payload: "Payload", range: "Range", configuration: "Configuration", budget: "Budget", country: "Destination country", destination: "Destination port / city", timing: "Purchase timing", notes: "Other requirements",
    selectPlaceholder: "Select or search", inputPlaceholder: "Enter details", optional: "Optional", required: "Please complete the required fields", currency: "Currency",
    equipmentOptions: ["Lifting machinery", "Excavator", "Loader", "Road machinery", "Forklift", "Aerial platform", "Other"],
    useOptions: ["Last-mile delivery", "Construction", "Agriculture", "Local retail", "Other"],
    timingOptions: ["Immediately", "Within 1 month", "1–3 months", "After 3 months", "Not decided"],
  },
  ru: {
    equipmentTitle: "Запрос на подержанную технику", tricycleTitle: "Запрос на электротрициклы",
    intro: "Информация будет отправлена через WhatsApp.", submit: "Отправить через WhatsApp",
    equipmentType: "Тип техники", useCase: "Назначение", brandModel: "Марка / модель", capacity: "Грузоподъёмность", year: "Годы выпуска", quantity: "Количество",
    payload: "Полезная нагрузка", range: "Запас хода", configuration: "Комплектация", budget: "Бюджет", country: "Страна назначения", destination: "Порт / город назначения", timing: "Срок закупки", notes: "Другие требования",
    selectPlaceholder: "Выберите или найдите", inputPlaceholder: "Введите данные", optional: "Необязательно", required: "Заполните обязательные поля", currency: "Валюта",
    equipmentOptions: ["Грузоподъёмная техника", "Экскаватор", "Погрузчик", "Дорожная техника", "Вилочный погрузчик", "Подъёмная платформа", "Другое"],
    useOptions: ["Последняя миля", "Строительство", "Сельское хозяйство", "Розничная торговля", "Другое"],
    timingOptions: ["Сейчас", "В течение месяца", "1–3 месяца", "Позже 3 месяцев", "Не определено"],
  },
} as const;

const serviceImages = { equipment: "/figma-assets/equipment-hero.webp", tricycle: "/figma-assets/tricycle.webp" };

function WhatsappIcon({ dark = false, size = 18 }: { dark?: boolean; size?: number }) {
  return <svg className={dark ? "wa-icon wa-icon-dark" : "wa-icon"} width={size} height={size} viewBox="0 0 1024 1024" aria-hidden="true" focusable="false">
    <path d="M746.581 613.632c-12.843-6.4-75.392-36.992-87.04-41.216-11.648-4.309-20.181-6.4-28.715 6.4-8.405 12.587-32.896 41.131-40.277 49.579-7.467 8.32-14.891 8.96-27.563 3.2-12.8-6.4-53.888-19.84-102.528-63.36-37.888-33.92-63.317-75.52-70.827-88.32-7.424-12.8-.81-19.84 5.547-26.24 5.803-5.76 12.843-14.72 19.243-22.315 6.229-7.722 8.277-12.843 12.672-21.163 4.267-8.96 2.091-16-1.067-22.357-3.2-6.4-28.672-69.12-39.339-94.123-10.24-24.917-20.779-21.76-28.672-21.76-7.339-.64-15.829-.64-24.363-.64-8.533 0-22.315 3.157-34.005 15.317-11.648 12.8-44.587 43.52-44.587 105.6s45.653 122.24 52.011 131.2c6.357 8.32 89.813 136.32 217.6 191.36 30.464 12.8 54.187 20.48 72.704 26.837 30.464 9.685 58.24 8.32 80.213 5.163 24.491-3.883 75.392-30.763 86.016-60.843 10.88-30.08 10.88-55.04 7.68-60.8-3.157-5.76-11.52-8.96-24.32-14.72M514.219 931.2h-.683c-75.52 0-150.357-20.48-215.68-58.88l-15.36-9.131-160 41.6 42.88-155.52-10.197-16a421.077 421.077 0 0 1-64.683-224.426c0-232.32 190.08-421.76 424.192-421.76A420.907 420.907 0 0 1 814.251 211.2a417.621 417.621 0 0 1 124.117 298.24c-.171 232.277-190.293 421.76-423.893 421.76M875.52 147.157C778.24 53.12 650.24 0 513.92 0 233.088 0 4.437 227.584 4.309 507.435c0 89.429 23.424 176.64 68.053 253.653L0 1024l270.293-70.485a514.645 514.645 0 0 0 243.627 61.738h.256c280.96 0 509.696-227.669 509.824-507.562 0-135.509-52.907-263.04-149.12-358.869" fill="#fff" />
  </svg>;
}

function LanguageMenu({ lang, setLang }: { lang: Lang; setLang: (value: Lang) => void }) {
  const [open, setOpen] = useState(false);
  const labels = { ru: "RU", en: "EN", zh: "中文" };
  const names = { ru: "Русский", en: "English", zh: "中文" };
  return <div className="language-switcher">
    <Button className="language-button" type="text" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Language"><IconLanguage className="language-main-icon" /><span>{labels[lang]}</span><IconDown className="language-down-icon" /></Button>
    {open && <div className="language-menu" role="menu">{(["ru", "en", "zh"] as Lang[]).map((item) => <Button type="text" long key={item} className={item === lang ? "active" : ""} onClick={() => { setLang(item); setOpen(false); }}><span>{labels[item]}</span><span>{names[item]}</span></Button>)}</div>}
  </div>;
}

function Header({ t, lang, setLang, page }: { t: (typeof copy)[Lang]; lang: Lang; setLang: (value: Lang) => void; page: Page }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const tabs = [["/", t.navHome, "home"], ["/equipment", t.navEquipment, "equipment"], ["/electric-tricycles", t.navTricycles, "tricycles"]] as const;
  return <>
    <header className={`site-header${drawerOpen ? " menu-open" : ""}`}><div className="header-inner">
      <Link className="brand" href="/" prefetch aria-label="LongBridge home">LongBridge</Link>
      <nav className="desktop-nav" aria-label="Primary navigation">{tabs.map(([href, label, key]) => <Link className={page === key ? "active" : ""} key={href} href={href} prefetch>{label}</Link>)}</nav>
      <div className="header-actions"><LanguageMenu lang={lang} setLang={setLang} /><Button className="mobile-menu-button" type="secondary" onClick={() => setDrawerOpen((value) => !value)} aria-label={drawerOpen ? "Close menu" : t.more} icon={drawerOpen ? <IconClose /> : <IconMenu />} /></div>
    </div></header>
    <Drawer className="mobile-nav-drawer" placement="right" width="100%" visible={drawerOpen} onCancel={() => setDrawerOpen(false)} title={null} footer={null} closable={false} mask={false} unmountOnExit>
      <div className="drawer-shell">
        <nav className="drawer-nav" aria-label="Mobile navigation">{tabs.map(([href, label]) => <Link key={href} href={href} prefetch onClick={() => setDrawerOpen(false)}><span>{label}</span><IconArrowRight /></Link>)}</nav>
        <Button className="drawer-request-button" type="outline" shape="round" href={WA} target="_blank" icon={<WhatsappIcon dark />}>{t.contact}</Button>
      </div>
    </Drawer>
  </>;
}

function SharedFaq({ title, items, equipment = false }: { title: string; items: readonly (readonly [string, string])[]; equipment?: boolean }) {
  return <section className={equipment ? "equipment-faq" : "shared-faq"}><div className={equipment ? "equipment-mobile-container" : "page-container"}>
    <h2>{title}</h2>
    <Collapse className="faq-collapse" bordered={false} expandIconPosition="right" expandIcon={<IconDown />} defaultActiveKey={["0"]} lazyload={false} accordion>
      {items.map(([question, answer], index) => <Collapse.Item name={String(index)} header={question} key={question}><p>{answer}</p></Collapse.Item>)}
    </Collapse>
  </div></section>;
}

function SharedBottom({ t, onRequest }: { t: (typeof copy)[Lang]; onRequest?: () => void }) {
  return <>
    <section className="shared-bottom"><div className="page-container"><h2>{t.finalTitle}</h2><p>{t.finalBody}</p><Button className="bottom-request-button" type="primary" shape="round" href={onRequest ? undefined : WA} target={onRequest ? undefined : "_blank"} onClick={onRequest} icon={<WhatsappIcon />}>{t.contact}</Button></div></section>
    <footer className="site-footer"><div className="page-container footer-inner"><Link className="brand footer-logo" href="/">LongBridge</Link><div className="footer-details"><p>{t.footerLocation}</p><a href="mailto:Martinwang12581@gmail.com">Martinwang12581@gmail.com</a><a href="tel:+8613336176818">+86 133 3617 6818</a></div><Button className="footer-contact-button" type="primary" shape="circle" href={WA} target="_blank" aria-label={t.contact} icon={<WhatsappIcon size={38} />} /></div></footer>
  </>;
}

function UnifiedHero({ tag, title, body, image, contact, onRequest }: { tag: string; title: string; body: string; image: string; contact: string; onRequest?: () => void }) {
  return <section className="unified-hero">
    <div className="unified-hero-photo" style={{ backgroundImage: `url(${image})` }} />
    <div className="unified-hero-overlay" />
    <div className="page-container unified-hero-content"><span className="unified-hero-tag">{tag}</span><h1>{title}</h1><p>{body}</p><Button className="unified-hero-request" type="primary" shape="round" href={onRequest ? undefined : WA} target={onRequest ? undefined : "_blank"} onClick={onRequest} icon={<WhatsappIcon dark />}>{contact}</Button></div>
  </section>;
}

function HomePage({ t }: { t: (typeof copy)[Lang] }) {
  const router = useRouter();
  useEffect(() => { router.prefetch("/equipment"); router.prefetch("/electric-tricycles"); }, [router]);
  const services = [["/equipment", serviceImages.equipment, t.equipmentTitle, t.equipmentBody], ["/electric-tricycles", serviceImages.tricycle, t.tricycleTitle, t.tricycleBody]] as const;
  return <>
    <UnifiedHero tag={t.homeTag} title={t.heroTitle} body={t.heroBody} image={serviceImages.equipment} contact={t.contact} />
    <section className="home-about"><div className="page-container home-about-inner"><div className="home-about-image"><Image src="/figma-assets/inspection.webp" alt="" width={891} height={499} /></div><div className="home-about-copy"><h2>{t.aboutTitle}</h2><p>{t.aboutBody}</p></div></div></section>
    <section className="home-section"><div className="page-container"><div className="home-heading"><h2>{t.servicesTitle}</h2><p>{t.servicesBody}</p></div><Grid.Row gutter={[24, 24]} align="stretch">{services.map(([href, image, title, body]) => <Grid.Col xs={24} md={12} key={href}><Card className="home-service-card" bordered><div className="home-service-image" style={{ backgroundImage: `url(${image})` }} /><h3>{title}</h3><p>{body}</p><Button className="service-detail-button" type="primary" shape="round" onClick={() => router.push(href)}><span>{t.explore}</span><IconArrowRight /></Button></Card></Grid.Col>)}</Grid.Row></div></section>
    <SharedFaq title={t.faqTitle} items={t.faqs} /><SharedBottom t={t} />
  </>;
}

function CategoryRail({ categories }: { categories: readonly string[] }) {
  const images = ["/figma-assets/excavator.png", "/figma-assets/forklift.png", "/figma-assets/excavator.png", "/figma-assets/excavator.png", "/figma-assets/excavator.png", "/figma-assets/forklift.png"];
  return <div className="equipment-category-rail" role="list" aria-label="Equipment categories">{categories.map((category, index) => <Card className="equipment-category-card" bordered role="listitem" key={`${category}-${index}`}><div className="equipment-category-image"><Image src={images[index]} alt={category} width={176} height={100} draggable={false} unoptimized /></div><span>{category}</span></Card>)}</div>;
}

function EquipmentPage({ t, p, onRequest }: { t: (typeof copy)[Lang]; p: (typeof equipmentCopy)[Lang]; onRequest: () => void }) {
  return <div className="equipment-page">
    <UnifiedHero tag={p.heroTag} title={p.heading} body={p.intro} image={serviceImages.equipment} contact={t.contact} onRequest={onRequest} />
    <section className="equipment-services-figma"><div className="equipment-mobile-container">
      <h2>{p.coreLabel}·{p.coreTitle}</h2><p className="equipment-core-copy">{p.coreBody}</p>
      <div className="equipment-service-modes"><span>{p.sourceOwn}</span><i /><span>{p.sourceNetwork}</span></div>
      <p className="equipment-range-copy">{p.rangeBody}</p><CategoryRail categories={p.categories} />
    </div></section>
    <section className="equipment-process-figma"><div className="equipment-mobile-container">
      <h2>{p.processTitle}</h2><p className="equipment-section-subtitle">{p.processBody}</p>
      <ol className="equipment-step-list">{p.steps.map(([number, title, body]) => <li key={number}><span className="equipment-step-number">{number}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol>
    </div></section>
    <section className="equipment-verification-figma"><div className="equipment-mobile-container">
      <h2>{p.verifyTitle}</h2><p className="equipment-section-subtitle">{p.verifyBody}</p>
      <div className="equipment-verification-grid">{p.verifyCards.map(([title, body]) => <Card className="equipment-verification-card" bordered key={title}><Image src="/figma-assets/inspection.png" alt="" width={891} height={499} /><h3>{title}</h3><p>{body}</p></Card>)}</div>
    </div></section>
    <section className="equipment-compliance-figma"><div className="equipment-mobile-container"><h2>{p.complianceTitle}</h2><p>{p.complianceBody}</p><div className="equipment-compliance-image"><Image src="/figma-assets/export-port.webp" alt="Shipping port and export logistics" width={960} height={640} /></div></div></section>
    <SharedFaq title={t.faqTitle} items={p.faqs} equipment /><SharedBottom t={t} onRequest={onRequest} />
  </div>;
}

function TricyclesPage({ t, p, onRequest }: { t: (typeof copy)[Lang]; p: (typeof tricycleCopy)[Lang]; onRequest: () => void }) {
  return <>
    <UnifiedHero tag={p.heroTag} title={p.heading} body={p.intro} image={serviceImages.tricycle} contact={t.contact} onRequest={onRequest} />
    <section className="tricycle-section"><div className="page-container tricycle-apps">{p.applications.map((item, index) => <Card bordered key={item}><span>0{index + 1}</span><b>{item}</b></Card>)}</div></section>
    <SharedBottom t={t} onRequest={onRequest} />
  </>;
}

function SourcingRequestDrawer({ visible, onClose, kind, lang }: { visible: boolean; onClose: () => void; kind: RequestKind; lang: Lang }) {
  const [form] = Form.useForm<RequestFormValues>();
  const [selectedCountry, setSelectedCountry] = useState<string>();
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const f = requestFormCopy[lang];
  const isEquipment = kind === "equipment";
  const title = isEquipment ? f.equipmentTitle : f.tricycleTitle;
  const options = (items: readonly string[]) => items.map((item) => ({ label: item, value: item }));
  const requiredRule = { required: true, message: f.required };
  const optionalLabel = (label: string) => `${label} (${f.optional})`;
  const countryOptions = destinationCountries.map((country) => ({ label: country.labels[lang], value: country.value }));
  const destinationOptions = (destinationCountries.find((country) => country.value === selectedCountry)?.destinations ?? ["Lagos / Apapa", "Tema", "Mombasa", "Jebel Ali / Dubai", "Los Angeles", "Santos", "Vladivostok", "Jakarta / Tanjung Priok"]).map((destination) => ({ label: destination, value: destination }));

  useEffect(() => {
    if (!visible) return;
    const root = document.documentElement;
    root.classList.add("sourcing-drawer-open");
    const preventBackgroundScroll = (event: TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest(".sourcing-form-drawer .arco-drawer-content, .arco-select-popup")) event.preventDefault();
    };
    document.addEventListener("touchmove", preventBackgroundScroll, { passive: false });
    return () => {
      root.classList.remove("sourcing-drawer-open");
      document.removeEventListener("touchmove", preventBackgroundScroll);
    };
  }, [visible]);

  const submitRequest = (values: RequestFormValues) => {
    const rows: [string, string | number | undefined][] = isEquipment ? [
      [f.equipmentType, values.equipmentType], [f.quantity, values.quantity], [f.country, values.country], [f.brandModel, values.brandModel], [f.capacity, values.capacity], [f.year, values.year],
      [f.destination, values.destination], [f.budget, values.budget === undefined ? undefined : `${currencySymbols[currency]} ${values.budget} ${currency}`], [f.timing, values.timing], [f.notes, values.notes],
    ] : [
      [f.useCase, values.useCase], [f.quantity, values.quantity], [f.country, values.country], [f.payload, values.payload], [f.range, values.range], [f.configuration, values.configuration],
      [f.destination, values.destination], [f.budget, values.budget === undefined ? undefined : `${currencySymbols[currency]} ${values.budget} ${currency}`], [f.timing, values.timing], [f.notes, values.notes],
    ];
    const message = [`LongBridge | ${title}`, ...rows.filter(([, value]) => value !== undefined && value !== "").map(([label, value]) => `${label}: ${value}`)].join("\n");
    window.open(`https://wa.me/8613336176818?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    onClose();
  };

  return <Drawer
    className="sourcing-form-drawer"
    wrapClassName="sourcing-form-drawer-wrap"
    placement="bottom"
    height="var(--sourcing-drawer-height, 80svh)"
    visible={visible}
    onCancel={onClose}
    afterClose={() => { form.resetFields(); setSelectedCountry(undefined); setCurrency("USD"); }}
    maskStyle={{ background: "rgba(0, 0, 0, 0.56)" }}
    title={<div className="sourcing-form-title"><strong>{title}</strong><span>{f.intro}</span></div>}
    closeIcon={<IconClose />}
    unmountOnExit
    footer={<Button className="sourcing-form-submit" type="primary" shape="round" long onClick={() => form.submit()} icon={<WhatsappIcon />}>{f.submit}</Button>}
  >
    <Form
      form={form}
      className="sourcing-request-form"
      layout="vertical"
      size="large"
      requiredSymbol
      labelAlign="left"
      onSubmit={submitRequest}
      onValuesChange={(changed) => {
        if (Object.prototype.hasOwnProperty.call(changed, "country")) {
          const country = changed.country;
          setSelectedCountry(country);
          setCurrency(destinationCountries.find((item) => item.value === country)?.currency ?? "USD");
          form.setFieldValue("destination", undefined);
        }
      }}
      scrollToFirstError
    >
      <div className="sourcing-form-grid">
        {isEquipment ? <>
          <Form.Item field="equipmentType" label={f.equipmentType} rules={[requiredRule]}><Select className="sourcing-control" showSearch placeholder={f.selectPlaceholder} options={options(f.equipmentOptions)} /></Form.Item>
        </> : <>
          <Form.Item field="useCase" label={f.useCase} rules={[requiredRule]}><Select className="sourcing-control" showSearch placeholder={f.selectPlaceholder} options={options(f.useOptions)} /></Form.Item>
        </>}
        <Form.Item field="quantity" label={f.quantity} rules={[requiredRule]}><InputNumber className="sourcing-control" hideControl min={1} precision={0} inputMode="numeric" pattern="[0-9]*" placeholder={f.inputPlaceholder} /></Form.Item>
        <Form.Item field="country" label={f.country} rules={[requiredRule]}><Select className="sourcing-control" showSearch allowCreate allowClear placeholder={f.selectPlaceholder} options={countryOptions} /></Form.Item>
        {isEquipment ? <>
          <Form.Item field="brandModel" label={optionalLabel(f.brandModel)}><Input className="sourcing-control" placeholder={f.inputPlaceholder} /></Form.Item>
          <Form.Item field="capacity" label={optionalLabel(f.capacity)}><Input className="sourcing-control" placeholder={f.inputPlaceholder} /></Form.Item>
          <Form.Item field="year" label={optionalLabel(f.year)}><Input className="sourcing-control" placeholder={f.inputPlaceholder} /></Form.Item>
        </> : <>
          <Form.Item field="payload" label={optionalLabel(f.payload)}><Input className="sourcing-control" placeholder={f.inputPlaceholder} /></Form.Item>
          <Form.Item field="range" label={optionalLabel(f.range)}><Input className="sourcing-control" placeholder={f.inputPlaceholder} /></Form.Item>
          <Form.Item field="configuration" label={optionalLabel(f.configuration)}><Input className="sourcing-control" placeholder={f.inputPlaceholder} /></Form.Item>
        </>}
        <Form.Item field="destination" label={optionalLabel(f.destination)}><Select className="sourcing-control" showSearch allowCreate allowClear placeholder={f.selectPlaceholder} options={destinationOptions} /></Form.Item>
        <Form.Item label={optionalLabel(f.budget)}>
          <Input.Group compact className="budget-input-group">
            <Select
              className="sourcing-control budget-currency-select"
              aria-label={f.currency}
              value={currency}
              onChange={(value) => setCurrency(value as CurrencyCode)}
              options={(Object.keys(currencySymbols) as CurrencyCode[]).map((code) => ({ label: `${currencySymbols[code]} ${code}`, value: code }))}
            />
            <Form.Item field="budget" noStyle><InputNumber className="sourcing-control" hideControl min={0} precision={2} inputMode="decimal" placeholder={f.inputPlaceholder} /></Form.Item>
          </Input.Group>
        </Form.Item>
        <Form.Item field="timing" label={optionalLabel(f.timing)}><Select className="sourcing-control" placeholder={f.selectPlaceholder} options={options(f.timingOptions)} /></Form.Item>
        <Form.Item className="sourcing-form-wide" field="notes" label={optionalLabel(f.notes)}><Input.TextArea className="sourcing-control" autoSize={{ minRows: 3, maxRows: 5 }} placeholder={f.inputPlaceholder} /></Form.Item>
      </div>
    </Form>
  </Drawer>;
}

export function LongBridgeSite({ page }: { page: Page }) {
  const [lang, setLang] = useState<Lang>("zh");
  const [requestOpen, setRequestOpen] = useState(false);
  useEffect(() => { const saved = window.localStorage.getItem("lb-lang") as Lang | null; if (saved && ["ru", "en", "zh"].includes(saved)) queueMicrotask(() => setLang(saved)); }, []);
  const changeLang = (value: Lang) => { setLang(value); window.localStorage.setItem("lb-lang", value); document.documentElement.lang = value; };
  const t = useMemo(() => copy[lang], [lang]);
  const equipment = useMemo(() => equipmentCopy[lang], [lang]);
  const tricycle = useMemo(() => tricycleCopy[lang], [lang]);
  const openRequest = () => {
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    document.documentElement.style.setProperty("--sourcing-drawer-height", `${Math.round(viewportHeight * 0.8)}px`);
    setRequestOpen(true);
  };
  return <div className="site-shell"><Header t={t} lang={lang} setLang={changeLang} page={page} /><main>{page === "home" && <HomePage t={t} />}{page === "equipment" && <EquipmentPage t={t} p={equipment} onRequest={openRequest} />}{page === "tricycles" && <TricyclesPage t={t} p={tricycle} onRequest={openRequest} />}</main>{page !== "home" && <SourcingRequestDrawer visible={requestOpen} onClose={() => setRequestOpen(false)} kind={page} lang={lang} />}</div>;
}
