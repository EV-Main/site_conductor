-- Translations for every published role, in all four target locales.
-- Step 3 of the migration path in docs/i18n-persisted-content.md.
--
-- `source_digest` is computed from the LIVE English row at insert time via
-- `vacancy_source_digest` rather than hard-coded. That is the whole point of the
-- function: a translation can never be recorded against English that has already
-- moved on, and editing a role later invalidates its translations by
-- construction — the digest stops matching, English is served, and nobody has to
-- remember to do anything.
--
-- Not translated here, deliberately: `slug` (one role, one URL, in every
-- language), `category` (a filter key, translated as a catalogue string on the
-- front end where the chips are), and `compensation` (a closed enum). See
-- `VacancyTranslation` in domain/src/model/vacancy.rs.
--
-- Idempotent via ON CONFLICT, so re-running is safe. Re-running does NOT refresh
-- a stale row, which is correct: this file records what was translated, and a
-- changed English row needs a new translation, not a recomputed digest over text
-- nobody re-checked.
--
-- These are machine-produced translations reviewed for structure, not
-- native-speaker copy. They are safe to serve — the policy guarantees a reader
-- sees either a current translation or the English — but INDEXED_LOCALES should
-- stay ["en"] until a native speaker has passed over them.

-- ── Russian (ru) ──────────────────────────────────────────────

INSERT INTO vacancy_translations
	(vacancy_id, locale, title, location, employment_type, summary, about,
	 responsibilities, requirements, nice_to_have, offer, screening_question, source_digest)
SELECT v.id, 'ru',
	'Инвестиционный аналитик',
	'Куинён, Вьетнам',
	'Полная занятость',
	'Полное сопровождение сделок по прибрежной застройке — от рыночной гипотезы до меморандума для инвестиционного комитета.',
	'Вы окажетесь в центре того, как EV Investment решает, куда направить капитал. Работая бок о бок с партнёрами, вы будете строить модели, проверять допущения на прочность и писать меморандумы, которые ведут сделку от идеи до обязательства, — с фокусом на премиальных прибрежных проектах в Куинёне.',
	ARRAY['Строить и поддерживать модели андеррайтинга для прибрежных жилых и многофункциональных проектов', 'Исследовать предложение, поглощение, ценообразование и драйверы спроса в субрынках', 'Готовить меморандумы для инвестиционного комитета и защищать рекомендации', 'Отслеживать результаты портфеля относительно андеррайтинга и фиксировать отклонения'],
	ARRAY['От 2 лет в недвижимости, private equity, инвестбанкинге или транзакционном консалтинге', 'Уверенное финансовое моделирование (DCF, waterfall, анализ чувствительности)', 'Отточенный письменный английский — вы умеете уместить сложную сделку на одной странице', 'Комфортная работа с неопределённостью и полевым исследованием'],
	ARRAY['Вьетнамский язык', 'Опыт на развивающихся или фронтирных рынках', 'Прогресс по программе CFA'],
	ARRAY['Прямое наставничество от партнёров фонда', 'Ответственность за реальные сделки с первого дня', 'Место в первом ряду, пока фонд строится', 'Договорная компенсация с бонусом за результат'],
	'Расскажите, какую сделку в Куинёне вы бы взяли в работу первой и почему.',
	vacancy_source_digest(v.*)
FROM vacancies v WHERE v.slug = 'investment-analyst'
ON CONFLICT (vacancy_id, locale) DO NOTHING;

INSERT INTO vacancy_translations
	(vacancy_id, locale, title, location, employment_type, summary, about,
	 responsibilities, requirements, nice_to_have, offer, screening_question, source_digest)
SELECT v.id, 'ru',
	'Руководитель исследований рынка недвижимости',
	'Куинён / удалённо',
	'Полная занятость',
	'Отвечать за рыночную аналитику, на которую опирается каждое инвестиционное решение фонда.',
	'Исследования — наше преимущество. Как руководитель этого направления вы будете превращать разрозненные сигналы — сделки, инфраструктурные планы, туристические потоки — в связную и постоянно обновляемую картину рынка Куинёна и центрального побережья, на которую опирается вся команда.',
	ARRAY['Отвечать за рыночные данные фирмы, сопоставимые сделки и ценовые ориентиры', 'Публиковать регулярные аналитические записки о предложении, спросе и макродрайверах', 'Выстраивать отношения с брокерами, девелоперами и местными органами власти ради первичных данных', 'Брифинговать инвестиционную команду до начала андеррайтинга'],
	ARRAY['От 4 лет в исследованиях недвижимости, консалтинге или рыночной аналитике', 'Строгость и в количественных данных, и в качественной полевой информации', 'Превосходный письменный английский и ясная визуальная подача', 'Самостоятельность — исследовательскую повестку задаёте вы'],
	ARRAY['Вьетнамский язык и локальные связи', 'Владение ГИС и картографией', 'Опыт в туризме или гостеприимстве'],
	ARRAY['Построить исследовательскую функцию с нуля', 'Прямое влияние на распределение капитала', 'Гибкий формат с возможностью удалённой работы', 'Договорная компенсация'],
	'Какой сигнал прибрежного рынка большинство инвесторов недооценивает — и как бы вы его отслеживали?',
	vacancy_source_digest(v.*)
FROM vacancies v WHERE v.slug = 'real-estate-research-lead'
ON CONFLICT (vacancy_id, locale) DO NOTHING;

INSERT INTO vacancy_translations
	(vacancy_id, locale, title, location, employment_type, summary, about,
	 responsibilities, requirements, nice_to_have, offer, screening_question, source_digest)
SELECT v.id, 'ru',
	'Руководитель девелоперских проектов',
	'Куинён, Вьетнам',
	'Полная занятость',
	'Вести премиальные прибрежные проекты от закладки до передачи ключей — в срок, в бюджет, в стандарте.',
	'Вы отвечаете за реализацию на площадке. Координируя проектировщиков, подрядчиков и консультантов, вы будете держать наши проекты в движении, не жертвуя качеством, которое определяет бренд EV.',
	ARRAY['Отвечать за графики, бюджеты и вехи сдачи проектов', 'Координировать архитекторов, подрядчиков и инженерных консультантов', 'Проводить обзоры хода работ на площадке и быстро снимать блокеры', 'Отчитываться перед инвестиционной командой о статусе, рисках и расходах'],
	ARRAY['От 5 лет управления проектами в недвижимости или строительстве', 'Подтверждённая сдача средних и крупных жилых или гостиничных объектов', 'Уверенное владение бюджетами, графиками и управлением подрядчиками', 'Спокойствие, решительность и бескомпромиссность к качеству'],
	ARRAY['Опыт прибрежной или курортной застройки', 'Вьетнамский язык', 'PMP или эквивалент'],
	ARRAY['Полная ответственность за флагманские проекты', 'Команда и бюджет, чтобы сделать дело', 'Прямой контакт с партнёрами фонда', 'Договорная компенсация'],
	'Расскажите о проекте, который вы вытащили, когда поехал график или бюджет. С чего вы начали?',
	vacancy_source_digest(v.*)
FROM vacancies v WHERE v.slug = 'development-project-manager'
ON CONFLICT (vacancy_id, locale) DO NOTHING;

INSERT INTO vacancy_translations
	(vacancy_id, locale, title, location, employment_type, summary, about,
	 responsibilities, requirements, nice_to_have, offer, screening_question, source_digest)
SELECT v.id, 'ru',
	'Инженер по площадке и разрешительной документации',
	'Куинён, Вьетнам',
	'Полная занятость',
	'Расчищать технический и регуляторный путь, чтобы наши проекты выходили в стройку без сюрпризов.',
	'Прежде чем зальют первый фундамент, кто-то должен сделать площадку пригодной для стройки: изыскания, согласования, инженерные сети, соответствие нормам. Это вы. На вас — инженерное и разрешительное направление, которое снимает риски с каждого проекта.',
	ARRAY['Вести изыскания на площадке, исследования грунтов и оценки реализуемости', 'Двигать процесс согласований и разрешений с местными органами власти', 'Координировать инженерные сети, подъездные пути и инфраструктурные требования', 'Вести реестр технической проверки по каждой площадке'],
	ARRAY['Образование в гражданском или конструктивном инжиниринге и от 4 лет на площадке', 'Практический опыт получения разрешений и регуляторных согласований', 'Уверенное знание местных строительных норм и требований соответствия', 'Методичность и одержимость деталями в документации'],
	ARRAY['Вьетнамский язык и отношения с местными органами власти', 'Прибрежный или геотехнический опыт', 'Сертификация по устойчивому или «зелёному» строительству'],
	ARRAY['Отвечать за направление, которое разблокирует каждый проект', 'Работа напрямую с девелоперами и органами власти', 'Реальная ответственность без бюрократии', 'Договорная компенсация'],
	'Какой разрешительный или площадочный риск вы проверили бы первым на участке у самого моря?',
	vacancy_source_digest(v.*)
FROM vacancies v WHERE v.slug = 'site-permitting-engineer'
ON CONFLICT (vacancy_id, locale) DO NOTHING;

INSERT INTO vacancy_translations
	(vacancy_id, locale, title, location, employment_type, summary, about,
	 responsibilities, requirements, nice_to_have, offer, screening_question, source_digest)
SELECT v.id, 'ru',
	'Специалист по работе с инвесторами',
	'Куинён / удалённо',
	'Полная занятость',
	'Быть надёжной связью между фондом и инвесторами, которые его поддерживают.',
	'Наши инвесторы ждут ясности и прямоты. Как специалист по работе с инвесторами вы будете держать их в курсе, хорошо отвечать на неудобные вопросы и делать так, чтобы опыт инвестирования с EV ощущался столь же продуманным, как и сами проекты.',
	ARRAY['Готовить отчёты, обновления и уведомления о привлечении капитала', 'Отвечать на вопросы инвесторов точно и с должной деликатностью', 'Поддерживать материалы для фандрайзинга и процесс due diligence', 'Вести CRM инвесторов и историю отношений'],
	ARRAY['От 3 лет в IR, операционной работе фонда или клиентских финансах', 'Безупречный письменный и устный английский', 'Такт и выдержка в работе с искушёнными инвесторами', 'Безошибочность в цифрах и документах'],
	ARRAY['Вьетнамский или другие языки', 'Опыт в недвижимости или фондах', 'Связи среди региональных или международных инвесторов'],
	ARRAY['Прямые отношения с базой инвесторов фонда', 'Влияние на то, как мы коммуницируем и привлекаем капитал', 'Доверительная роль с возможностью удалённой работы', 'Договорная компенсация'],
	'Как бы вы объяснили инвестору задержку по вехе проекта, не потеряв его доверия?',
	vacancy_source_digest(v.*)
FROM vacancies v WHERE v.slug = 'investor-relations-associate'
ON CONFLICT (vacancy_id, locale) DO NOTHING;

INSERT INTO vacancy_translations
	(vacancy_id, locale, title, location, employment_type, summary, about,
	 responsibilities, requirements, nice_to_have, offer, screening_question, source_digest)
SELECT v.id, 'ru',
	'Консультант по подбору недвижимости',
	'Куинён, Вьетнам',
	'Полная занятость',
	'Провести покупателя к премиальному дому у моря — с честностью, которая приносит рекомендации.',
	'Вы — тот человек, которого покупатели запомнят. От первого обращения до передачи ключей вы консультируете по объекту, процессу и документам, выстраивая доверие, которое превращает одну покупку в три.',
	ARRAY['Консультировать потенциальных покупателей по объектам, ценам и процессу', 'Вести клиентов через бронирование, договоры и передачу объекта', 'Взаимодействовать с юридической, финансовой и девелоперской командами', 'Строить долгосрочные отношения, которые приносят рекомендации'],
	ARRAY['От 3 лет в продажах премиальной недвижимости или консультировании покупателей', 'Консультативный стиль без давления, вызывающий доверие', 'Свободный английский; ясная и тёплая коммуникация', 'Подлинное понимание пути покупателя'],
	ARRAY['Вьетнамский язык', 'Опыт работы с иностранными клиентами и экспатами', 'Собственная база покупателей'],
	ARRAY['Представлять по-настоящему премиальный продукт, за который не стыдно', 'Тёплые входящие обращения, а не холодные звонки', 'Неограниченный бонус, привязанный к результату', 'Договорная компенсация'],
	'Опишите случай, когда вы отговорили покупателя от покупки. Чем это закончилось?',
	vacancy_source_digest(v.*)
FROM vacancies v WHERE v.slug = 'buyer-advisory-specialist'
ON CONFLICT (vacancy_id, locale) DO NOTHING;

INSERT INTO vacancy_translations
	(vacancy_id, locale, title, location, employment_type, summary, about,
	 responsibilities, requirements, nice_to_have, offer, screening_question, source_digest)
SELECT v.id, 'ru',
	'Руководитель операционной работы фонда',
	'Куинён / удалённо',
	'Полная занятость',
	'Построить операционный каркас, который позволит молодому фонду расти, не ломаясь.',
	'Рост умирает в бэк-офисе, если за ним никто не следит. Как руководитель операций вы выстроите процессы, контроли и системы, которые держат фонд в соответствии требованиям, в порядке и готовым к масштабированию, — тихо делая так, чтобы работало всё остальное.',
	ARRAY['Отвечать за администрирование фонда, циклы отчётности и процессы комплаенса', 'Разворачивать и улучшать внутренние системы и процессы', 'Взаимодействовать с юридическими, бухгалтерскими и банковскими партнёрами', 'Держать записи, контроли и документацию готовыми к аудиту'],
	ARRAY['От 5 лет в операциях фонда, финансовых операциях или схожей опорной роли', 'Умение превращать хаос в чек-листы', 'Уверенное понимание администрирования фонда, комплаенса и контролей', 'Надёжность в обращении с чувствительной финансовой информацией'],
	ARRAY['Опыт в недвижимости или частных фондах', 'Вьетнамский язык', 'Владение системами и автоматизацией'],
	ARRAY['Спроектировать операционную модель с нуля', 'Широкий мандат на всю компанию', 'Автономная роль с возможностью удалённой работы', 'Договорная компенсация'],
	'Какой операционный процесс вы внедрили бы первым в фонде, где нет ни одного?',
	vacancy_source_digest(v.*)
FROM vacancies v WHERE v.slug = 'fund-operations-lead'
ON CONFLICT (vacancy_id, locale) DO NOTHING;

-- ── Vietnamese (vi) ──────────────────────────────────────────────

INSERT INTO vacancy_translations
	(vacancy_id, locale, title, location, employment_type, summary, about,
	 responsibilities, requirements, nice_to_have, offer, screening_question, source_digest)
SELECT v.id, 'vi',
	'Chuyên viên Phân tích Đầu tư',
	'Quy Nhơn, Việt Nam',
	'Toàn thời gian',
	'Thẩm định trọn vẹn các thương vụ phát triển ven biển — từ luận điểm thị trường đến tờ trình hội đồng đầu tư.',
	'Bạn sẽ ở trung tâm của cách EV Investment quyết định dòng vốn đi về đâu. Làm việc cùng các thành viên điều hành, bạn xây dựng mô hình, thử thách các giả định và viết những tờ trình đưa một thương vụ từ ý tưởng đến cam kết — tập trung vào các dự án ven biển cao cấp tại Quy Nhơn.',
	ARRAY['Xây dựng và duy trì mô hình thẩm định cho các dự án nhà ở và phức hợp ven biển', 'Nghiên cứu nguồn cung, tốc độ hấp thụ, giá và các động lực cầu của thị trường ngách', 'Soạn tờ trình hội đồng đầu tư và bảo vệ khuyến nghị', 'Theo dõi hiệu quả danh mục so với thẩm định ban đầu và chỉ ra sai lệch'],
	ARRAY['Từ 2 năm trong bất động sản, private equity, ngân hàng đầu tư hoặc tư vấn giao dịch', 'Thành thạo mô hình tài chính (DCF, waterfall, phân tích độ nhạy)', 'Tiếng Anh viết sắc bén — gói gọn một thương vụ phức tạp trong một trang', 'Thoải mái với sự mơ hồ và nghiên cứu sơ cấp'],
	ARRAY['Tiếng Việt', 'Kinh nghiệm tại thị trường mới nổi hoặc cận biên', 'Đang theo chương trình CFA'],
	ARRAY['Được các thành viên điều hành trực tiếp dẫn dắt', 'Chịu trách nhiệm thương vụ thật ngay từ ngày đầu', 'Chỗ ngồi hàng đầu khi một quỹ được dựng lên', 'Lương thỏa thuận, có thưởng theo hiệu quả'],
	'Hãy nói về một thương vụ ở Quy Nhơn mà bạn sẽ thẩm định đầu tiên, và vì sao.',
	vacancy_source_digest(v.*)
FROM vacancies v WHERE v.slug = 'investment-analyst'
ON CONFLICT (vacancy_id, locale) DO NOTHING;

INSERT INTO vacancy_translations
	(vacancy_id, locale, title, location, employment_type, summary, about,
	 responsibilities, requirements, nice_to_have, offer, screening_question, source_digest)
SELECT v.id, 'vi',
	'Trưởng bộ phận Nghiên cứu Bất động sản',
	'Quy Nhơn / Từ xa',
	'Toàn thời gian',
	'Phụ trách nền tảng nghiên cứu thị trường cho mọi quyết định đầu tư của quỹ.',
	'Nghiên cứu là lợi thế của chúng tôi. Ở vai trò này, bạn biến những tín hiệu rời rạc — giao dịch, quy hoạch hạ tầng, dòng khách du lịch — thành một bức tranh mạch lạc và luôn được cập nhật về thị trường Quy Nhơn và duyên hải miền Trung mà cả công ty dựa vào.',
	ARRAY['Phụ trách dữ liệu thị trường, giao dịch so sánh và chuẩn giá của công ty', 'Xuất bản các báo cáo định kỳ về cung, cầu và động lực vĩ mô', 'Xây dựng quan hệ với môi giới, chủ đầu tư và chính quyền địa phương để có dữ liệu sơ cấp', 'Thông tin cho đội đầu tư trước khi thẩm định'],
	ARRAY['Từ 4 năm trong nghiên cứu bất động sản, tư vấn hoặc phân tích thị trường', 'Chặt chẽ với cả dữ liệu định lượng lẫn thông tin thực địa định tính', 'Tiếng Anh viết xuất sắc và phong cách trình bày trực quan rõ ràng', 'Chủ động — bạn tự đặt ra chương trình nghiên cứu'],
	ARRAY['Tiếng Việt và mạng lưới địa phương', 'Thành thạo GIS và bản đồ', 'Kinh nghiệm ngành du lịch hoặc lưu trú'],
	ARRAY['Xây dựng chức năng nghiên cứu từ con số không', 'Ảnh hưởng trực tiếp đến phân bổ vốn', 'Sắp xếp linh hoạt, thân thiện với làm việc từ xa', 'Lương thỏa thuận'],
	'Tín hiệu nào của thị trường ven biển bị phần lớn nhà đầu tư đánh giá thấp — và bạn sẽ theo dõi nó thế nào?',
	vacancy_source_digest(v.*)
FROM vacancies v WHERE v.slug = 'real-estate-research-lead'
ON CONFLICT (vacancy_id, locale) DO NOTHING;

INSERT INTO vacancy_translations
	(vacancy_id, locale, title, location, employment_type, summary, about,
	 responsibilities, requirements, nice_to_have, offer, screening_question, source_digest)
SELECT v.id, 'vi',
	'Quản lý Dự án Phát triển',
	'Quy Nhơn, Việt Nam',
	'Toàn thời gian',
	'Đưa các dự án ven biển cao cấp từ khởi công đến bàn giao — đúng hạn, đúng ngân sách, đúng chuẩn.',
	'Bạn chịu trách nhiệm về việc triển khai tại hiện trường. Điều phối đơn vị thiết kế, nhà thầu và tư vấn, bạn giữ cho dự án tiến về phía trước mà vẫn bảo vệ chất lượng làm nên thương hiệu EV.',
	ARRAY['Phụ trách tiến độ, ngân sách và các mốc bàn giao của dự án', 'Điều phối kiến trúc sư, nhà thầu và tư vấn kỹ thuật', 'Chủ trì họp rà soát tiến độ tại công trường và gỡ vướng nhanh', 'Báo cáo tình trạng, rủi ro và chi phí cho đội đầu tư'],
	ARRAY['Từ 5 năm quản lý dự án bất động sản hoặc xây dựng', 'Đã bàn giao các công trình nhà ở hoặc lưu trú quy mô vừa đến lớn', 'Nắm chắc ngân sách, tiến độ và quản lý nhà thầu', 'Điềm tĩnh, quyết đoán và không nhân nhượng về chất lượng'],
	ARRAY['Kinh nghiệm dự án ven biển hoặc nghỉ dưỡng', 'Tiếng Việt', 'PMP hoặc tương đương'],
	ARRAY['Toàn quyền phụ trách các dự án chủ lực', 'Có đội ngũ và ngân sách để làm tới nơi', 'Kết nối trực tiếp với ban điều hành', 'Lương thỏa thuận'],
	'Hãy kể về một dự án bạn đã cứu khi tiến độ hoặc ngân sách chệch hướng — bạn làm gì trước tiên?',
	vacancy_source_digest(v.*)
FROM vacancies v WHERE v.slug = 'development-project-manager'
ON CONFLICT (vacancy_id, locale) DO NOTHING;

INSERT INTO vacancy_translations
	(vacancy_id, locale, title, location, employment_type, summary, about,
	 responsibilities, requirements, nice_to_have, offer, screening_question, source_digest)
SELECT v.id, 'vi',
	'Kỹ sư Hiện trường và Pháp lý Xây dựng',
	'Quy Nhơn, Việt Nam',
	'Toàn thời gian',
	'Dọn đường kỹ thuật và pháp lý để dự án khởi công mà không gặp bất ngờ.',
	'Trước khi đổ mẻ móng đầu tiên, phải có người làm cho khu đất đủ điều kiện xây dựng — khảo sát, phê duyệt, hạ tầng kỹ thuật, tuân thủ. Đó là bạn. Bạn phụ trách mảng kỹ thuật và cấp phép giúp giảm rủi ro cho mọi dự án.',
	ARRAY['Quản lý khảo sát hiện trường, khảo sát địa chất và đánh giá khả thi', 'Thúc đẩy quá trình cấp phép và phê duyệt với chính quyền địa phương', 'Điều phối hạ tầng kỹ thuật, đường tiếp cận và các yêu cầu hạ tầng', 'Duy trì hồ sơ thẩm định kỹ thuật cho từng khu đất'],
	ARRAY['Nền tảng kỹ thuật xây dựng hoặc kết cấu, từ 4 năm tại công trường', 'Kinh nghiệm thực tế về cấp phép và phê duyệt pháp lý', 'Nắm vững quy chuẩn xây dựng địa phương và yêu cầu tuân thủ', 'Thói quen lập hồ sơ bài bản, tỉ mỉ đến từng chi tiết'],
	ARRAY['Tiếng Việt và quan hệ với cơ quan địa phương', 'Kinh nghiệm ven biển hoặc địa kỹ thuật', 'Chứng chỉ công trình xanh hoặc bền vững'],
	ARRAY['Phụ trách mảng công việc gỡ nút thắt cho mọi dự án', 'Làm việc trực tiếp với chủ đầu tư và cơ quan quản lý', 'Trách nhiệm thật, không quan liêu', 'Lương thỏa thuận'],
	'Rủi ro pháp lý hay hiện trường nào bạn sẽ kiểm tra đầu tiên với một khu đất sát biển?',
	vacancy_source_digest(v.*)
FROM vacancies v WHERE v.slug = 'site-permitting-engineer'
ON CONFLICT (vacancy_id, locale) DO NOTHING;

INSERT INTO vacancy_translations
	(vacancy_id, locale, title, location, employment_type, summary, about,
	 responsibilities, requirements, nice_to_have, offer, screening_question, source_digest)
SELECT v.id, 'vi',
	'Chuyên viên Quan hệ Nhà đầu tư',
	'Quy Nhơn / Từ xa',
	'Toàn thời gian',
	'Là cầu nối đáng tin giữa quỹ và những nhà đầu tư đứng sau nó.',
	'Nhà đầu tư của chúng tôi mong đợi sự rõ ràng và thẳng thắn. Ở vai trò này, bạn giữ họ luôn nắm thông tin, trả lời tốt những câu hỏi khó, và làm cho trải nghiệm đầu tư cùng EV chỉn chu như chính các dự án.',
	ARRAY['Chuẩn bị báo cáo, bản cập nhật và thông báo gọi vốn cho nhà đầu tư', 'Trả lời câu hỏi của nhà đầu tư một cách chính xác và kín đáo', 'Hỗ trợ tài liệu gọi vốn và quá trình thẩm định', 'Duy trì CRM và hồ sơ quan hệ nhà đầu tư'],
	ARRAY['Từ 3 năm trong quan hệ nhà đầu tư, vận hành quỹ hoặc tài chính tiếp xúc khách hàng', 'Tiếng Anh nói và viết xuất sắc', 'Kín đáo và điềm tĩnh trước những nhà đầu tư sành sỏi', 'Chuẩn xác tuyệt đối với số liệu và tài liệu'],
	ARRAY['Tiếng Việt hoặc ngôn ngữ khác', 'Kinh nghiệm bất động sản hoặc quỹ đầu tư', 'Mạng lưới nhà đầu tư khu vực hoặc quốc tế'],
	ARRAY['Quan hệ trực tiếp với cơ sở nhà đầu tư của quỹ', 'Có tiếng nói trong cách chúng tôi truyền thông và gọi vốn', 'Vai trò tin cậy cao, thân thiện với làm việc từ xa', 'Lương thỏa thuận'],
	'Bạn sẽ giải thích thế nào với nhà đầu tư về một mốc dự án bị chậm mà không làm mất niềm tin của họ?',
	vacancy_source_digest(v.*)
FROM vacancies v WHERE v.slug = 'investor-relations-associate'
ON CONFLICT (vacancy_id, locale) DO NOTHING;

INSERT INTO vacancy_translations
	(vacancy_id, locale, title, location, employment_type, summary, about,
	 responsibilities, requirements, nice_to_have, offer, screening_question, source_digest)
SELECT v.id, 'vi',
	'Chuyên viên Tư vấn Người mua',
	'Quy Nhơn, Việt Nam',
	'Toàn thời gian',
	'Đồng hành cùng người mua sở hữu một ngôi nhà ven biển cao cấp — bằng sự trung thực tạo ra lời giới thiệu.',
	'Bạn là người mà khách hàng sẽ nhớ. Từ lần hỏi đầu tiên đến khi bàn giao, bạn tư vấn về sản phẩm phù hợp, quy trình và giấy tờ — xây dựng niềm tin biến một giao dịch thành ba.',
	ARRAY['Tư vấn cho khách hàng tiềm năng về sản phẩm, giá và quy trình', 'Dẫn dắt khách qua đặt chỗ, hợp đồng và bàn giao', 'Phối hợp với các bộ phận pháp lý, tài chính và phát triển dự án', 'Xây dựng quan hệ dài hạn tạo ra nguồn giới thiệu'],
	ARRAY['Từ 3 năm bán bất động sản cao cấp hoặc tư vấn người mua', 'Phong cách tư vấn, không gây áp lực, tạo được niềm tin', 'Tiếng Anh lưu loát; giao tiếp rõ ràng và ấm áp', 'Hiểu thật sự hành trình của người mua'],
	ARRAY['Tiếng Việt', 'Kinh nghiệm với khách quốc tế hoặc người nước ngoài', 'Sẵn có mạng lưới người mua'],
	ARRAY['Đại diện cho sản phẩm cao cấp thật sự, đủ tự tin để đứng sau', 'Khách quan tâm chủ động tìm đến, không phải gọi điện lạnh', 'Thưởng theo hiệu quả, không giới hạn', 'Lương thỏa thuận'],
	'Hãy kể một lần bạn khuyên khách đừng mua. Chuyện gì đã xảy ra?',
	vacancy_source_digest(v.*)
FROM vacancies v WHERE v.slug = 'buyer-advisory-specialist'
ON CONFLICT (vacancy_id, locale) DO NOTHING;

INSERT INTO vacancy_translations
	(vacancy_id, locale, title, location, employment_type, summary, about,
	 responsibilities, requirements, nice_to_have, offer, screening_question, source_digest)
SELECT v.id, 'vi',
	'Trưởng bộ phận Vận hành Quỹ',
	'Quy Nhơn / Từ xa',
	'Toàn thời gian',
	'Dựng bộ khung vận hành để một quỹ non trẻ mở rộng mà không vỡ trận.',
	'Tăng trưởng sẽ chết ở khâu hậu cần nếu không ai chăm. Ở vai trò này, bạn thiết lập quy trình, chốt kiểm soát và hệ thống giúp quỹ tuân thủ, gọn gàng và sẵn sàng mở rộng — lặng lẽ làm cho mọi thứ khác chạy được.',
	ARRAY['Phụ trách quản trị quỹ, chu kỳ báo cáo và quy trình tuân thủ', 'Thiết lập và cải tiến hệ thống, quy trình nội bộ', 'Phối hợp với đối tác pháp lý, kế toán và ngân hàng', 'Giữ hồ sơ, chốt kiểm soát và tài liệu luôn sẵn sàng cho kiểm toán'],
	ARRAY['Từ 5 năm trong vận hành quỹ, vận hành tài chính hoặc vai trò nền tảng tương tự', 'Người xây quy trình, biến hỗn loạn thành danh sách kiểm tra', 'Nắm chắc quản trị quỹ, tuân thủ và kiểm soát nội bộ', 'Đáng tin cậy với thông tin tài chính nhạy cảm'],
	ARRAY['Nền tảng bất động sản hoặc quỹ tư nhân', 'Tiếng Việt', 'Thành thạo hệ thống và tự động hóa'],
	ARRAY['Thiết kế mô hình vận hành từ đầu', 'Phạm vi công việc trải rộng toàn công ty', 'Tự chủ, thân thiện với làm việc từ xa', 'Lương thỏa thuận'],
	'Quy trình vận hành đầu tiên bạn sẽ thiết lập ở một quỹ chưa có gì là gì?',
	vacancy_source_digest(v.*)
FROM vacancies v WHERE v.slug = 'fund-operations-lead'
ON CONFLICT (vacancy_id, locale) DO NOTHING;

-- ── French (fr) ──────────────────────────────────────────────

INSERT INTO vacancy_translations
	(vacancy_id, locale, title, location, employment_type, summary, about,
	 responsibilities, requirements, nice_to_have, offer, screening_question, source_digest)
SELECT v.id, 'fr',
	'Analyste en investissement',
	'Quy Nhơn, Viêt Nam',
	'Temps plein',
	'Analyser de bout en bout les opérations de développement côtier — de la thèse de marché à la note au comité d''investissement.',
	'Vous serez au cœur de la façon dont EV Investment décide où va le capital. Aux côtés des associés, vous construirez les modèles, éprouverez les hypothèses et rédigerez les notes qui font passer une opération de l''idée à l''engagement — sur des développements côtiers haut de gamme à Quy Nhơn.',
	ARRAY['Construire et maintenir les modèles d''analyse pour les projets résidentiels et mixtes du littoral', 'Étudier l''offre, l''absorption, les prix et les moteurs de la demande sur les sous-marchés', 'Rédiger les notes au comité d''investissement et défendre vos recommandations', 'Suivre la performance du portefeuille par rapport à l''analyse initiale et signaler les écarts'],
	ARRAY['2 ans et plus en immobilier, capital-investissement, banque d''affaires ou conseil en transactions', 'Maîtrise de la modélisation financière (DCF, waterfalls, analyse de sensibilité)', 'Un anglais écrit incisif — vous rendez une opération complexe lisible en une page', 'À l''aise avec l''ambiguïté et la recherche de terrain'],
	ARRAY['Vietnamien', 'Expérience des marchés émergents ou frontières', 'Parcours CFA en cours'],
	ARRAY['Un accompagnement direct par les associés du fonds', 'La responsabilité d''opérations réelles dès le premier jour', 'Une place au premier rang pendant la construction d''un fonds', 'Rémunération négociable avec intéressement à la performance'],
	'Quelle opération analyseriez-vous en premier à Quy Nhơn, et pourquoi ?',
	vacancy_source_digest(v.*)
FROM vacancies v WHERE v.slug = 'investment-analyst'
ON CONFLICT (vacancy_id, locale) DO NOTHING;

INSERT INTO vacancy_translations
	(vacancy_id, locale, title, location, employment_type, summary, about,
	 responsibilities, requirements, nice_to_have, offer, screening_question, source_digest)
SELECT v.id, 'fr',
	'Responsable de la recherche immobilière',
	'Quy Nhơn / Télétravail',
	'Temps plein',
	'Piloter l''intelligence de marché sur laquelle repose chaque décision d''investissement du fonds.',
	'La recherche est notre avantage. À ce poste, vous transformerez des signaux épars — transactions, plans d''infrastructure, flux touristiques — en une vision cohérente et continuellement actualisée du marché de Quy Nhơn et de la côte centrale, sur laquelle toute la maison s''appuie.',
	ARRAY['Piloter les données de marché, les comparables et les références de prix de la société', 'Publier des notes de recherche régulières sur l''offre, la demande et les moteurs macroéconomiques', 'Nouer des relations avec courtiers, promoteurs et autorités locales pour obtenir des données de première main', 'Informer l''équipe d''investissement en amont de l''analyse'],
	ARRAY['4 ans et plus en recherche immobilière, conseil ou analyse de marché', 'De la rigueur, autant sur les données quantitatives que sur le renseignement de terrain', 'Excellent anglais écrit et style visuel clair', 'Autonomie — c''est vous qui fixez l''agenda de recherche'],
	ARRAY['Vietnamien et réseau local', 'Maîtrise du SIG et de la cartographie', 'Expérience du tourisme ou de l''hôtellerie'],
	ARRAY['Créer la fonction recherche de toutes pièces', 'Une influence directe sur l''allocation du capital', 'Une organisation souple, compatible avec le télétravail', 'Rémunération négociable'],
	'Quel signal d''un marché côtier la plupart des investisseurs sous-estiment-ils — et comment le suivriez-vous ?',
	vacancy_source_digest(v.*)
FROM vacancies v WHERE v.slug = 'real-estate-research-lead'
ON CONFLICT (vacancy_id, locale) DO NOTHING;

INSERT INTO vacancy_translations
	(vacancy_id, locale, title, location, employment_type, summary, about,
	 responsibilities, requirements, nice_to_have, offer, screening_question, source_digest)
SELECT v.id, 'fr',
	'Directeur de projet développement',
	'Quy Nhơn, Viêt Nam',
	'Temps plein',
	'Mener des projets côtiers haut de gamme du premier coup de pioche à la livraison — dans les délais, le budget et le standard.',
	'Vous répondez de l''exécution sur le terrain. En coordonnant concepteurs, entreprises et bureaux d''études, vous maintenez nos opérations en mouvement tout en protégeant la qualité qui fait la marque EV.',
	ARRAY['Piloter les plannings, les budgets et les jalons de livraison', 'Coordonner architectes, entreprises et bureaux d''études techniques', 'Animer les revues d''avancement sur site et lever les blocages sans délai', 'Rendre compte de l''avancement, des risques et des dépenses à l''équipe d''investissement'],
	ARRAY['5 ans et plus en gestion de projets immobiliers ou de construction', 'Livraisons avérées de programmes résidentiels ou hôteliers de taille moyenne à grande', 'Maîtrise des budgets, des plannings et de la gestion des entreprises', 'Calme, décidé et intransigeant sur la qualité'],
	ARRAY['Expérience du littoral ou du resort', 'Vietnamien', 'PMP ou équivalent'],
	ARRAY['La responsabilité complète de développements emblématiques', 'Une équipe et un budget pour livrer', 'Un lien direct avec les associés', 'Rémunération négociable'],
	'Parlez-nous d''un projet que vous avez redressé après un dérapage de planning ou de budget — qu''avez-vous fait en premier ?',
	vacancy_source_digest(v.*)
FROM vacancies v WHERE v.slug = 'development-project-manager'
ON CONFLICT (vacancy_id, locale) DO NOTHING;

INSERT INTO vacancy_translations
	(vacancy_id, locale, title, location, employment_type, summary, about,
	 responsibilities, requirements, nice_to_have, offer, screening_question, source_digest)
SELECT v.id, 'fr',
	'Ingénieur site et autorisations',
	'Quy Nhơn, Viêt Nam',
	'Temps plein',
	'Dégager la voie technique et réglementaire pour que nos projets sortent de terre sans mauvaise surprise.',
	'Avant la première fondation, quelqu''un doit rendre le terrain constructible : relevés, autorisations, réseaux, conformité. C''est vous. Vous portez le volet ingénierie et permis qui dérisque chaque opération.',
	ARRAY['Piloter les relevés de terrain, les études de sol et les études de faisabilité', 'Conduire les démarches d''autorisation et d''agrément auprès des autorités locales', 'Coordonner les réseaux, les accès et les besoins en infrastructures', 'Tenir le dossier de due diligence technique de chaque site'],
	ARRAY['Formation en génie civil ou structures, 4 ans et plus de terrain', 'Expérience concrète des permis et des agréments réglementaires', 'Bonne maîtrise des codes de la construction locaux et de la conformité', 'Méthode et obsession du détail dans la documentation'],
	ARRAY['Vietnamien et relations avec les autorités locales', 'Expérience littorale ou géotechnique', 'Certification durable ou bâtiment vert'],
	ARRAY['Porter le chantier qui débloque tous les autres', 'Travailler directement avec promoteurs et autorités', 'De vraies responsabilités, sans bureaucratie', 'Rémunération négociable'],
	'Quel risque réglementaire ou de site vérifieriez-vous en premier sur une parcelle en bord de mer ?',
	vacancy_source_digest(v.*)
FROM vacancies v WHERE v.slug = 'site-permitting-engineer'
ON CONFLICT (vacancy_id, locale) DO NOTHING;

INSERT INTO vacancy_translations
	(vacancy_id, locale, title, location, employment_type, summary, about,
	 responsibilities, requirements, nice_to_have, offer, screening_question, source_digest)
SELECT v.id, 'fr',
	'Chargé des relations investisseurs',
	'Quy Nhơn / Télétravail',
	'Temps plein',
	'Être le lien de confiance entre le fonds et les investisseurs qui le soutiennent.',
	'Nos investisseurs attendent de la clarté et de la franchise. À ce poste, vous les tenez informés, répondez bien aux questions difficiles et faites en sorte que l''expérience d''investir avec EV soit aussi soignée que les développements eux-mêmes.',
	ARRAY['Préparer les rapports, les points d''étape et les appels de fonds', 'Répondre aux questions des investisseurs avec exactitude et discrétion', 'Appuyer les supports de levée et le processus de due diligence', 'Tenir le CRM investisseurs et l''historique de la relation'],
	ARRAY['3 ans et plus en relations investisseurs, opérations de fonds ou finance en contact client', 'Un anglais écrit et oral irréprochable', 'Discrétion et sang-froid face à des investisseurs avertis', 'Une précision sans faille sur les chiffres et les documents'],
	ARRAY['Vietnamien ou autres langues', 'Expérience de l''immobilier ou des fonds', 'Réseau d''investisseurs régionaux ou internationaux'],
	ARRAY['Des relations directes avec la base d''investisseurs du fonds', 'Une voix dans notre façon de communiquer et de lever', 'Un poste de confiance, compatible avec le télétravail', 'Rémunération négociable'],
	'Comment expliqueriez-vous à un investisseur le retard d''un jalon sans lui faire perdre confiance ?',
	vacancy_source_digest(v.*)
FROM vacancies v WHERE v.slug = 'investor-relations-associate'
ON CONFLICT (vacancy_id, locale) DO NOTHING;

INSERT INTO vacancy_translations
	(vacancy_id, locale, title, location, employment_type, summary, about,
	 responsibilities, requirements, nice_to_have, offer, screening_question, source_digest)
SELECT v.id, 'fr',
	'Conseiller acquéreurs',
	'Quy Nhơn, Viêt Nam',
	'Temps plein',
	'Accompagner l''acquisition d''une résidence côtière haut de gamme — avec l''honnêteté qui vaut des recommandations.',
	'Vous serez celui ou celle dont les acquéreurs se souviennent. De la première demande à la remise des clés, vous conseillez sur le bien, le parcours et les documents — en bâtissant la confiance qui transforme un achat en trois.',
	ARRAY['Conseiller les acquéreurs potentiels sur les biens, les prix et le parcours', 'Accompagner les clients de la réservation aux contrats et à la livraison', 'Coordonner avec les équipes juridique, financière et développement', 'Construire des relations durables qui génèrent des recommandations'],
	ARRAY['3 ans et plus dans la vente immobilière haut de gamme ou le conseil acquéreurs', 'Une approche consultative, sans pression, qui inspire confiance', 'Anglais courant ; une communication claire et chaleureuse', 'Une vraie connaissance du parcours d''acquisition'],
	ARRAY['Vietnamien', 'Expérience de la clientèle internationale ou expatriée', 'Réseau d''acquéreurs déjà constitué'],
	ARRAY['Représenter un produit véritablement haut de gamme, que vous pouvez assumer', 'Des demandes entrantes qualifiées, pas de démarchage à froid', 'Un intéressement déplafonné, lié à la performance', 'Rémunération négociable'],
	'Racontez une fois où vous avez déconseillé un achat à un acquéreur. Qu''est-il arrivé ?',
	vacancy_source_digest(v.*)
FROM vacancies v WHERE v.slug = 'buyer-advisory-specialist'
ON CONFLICT (vacancy_id, locale) DO NOTHING;

INSERT INTO vacancy_translations
	(vacancy_id, locale, title, location, employment_type, summary, about,
	 responsibilities, requirements, nice_to_have, offer, screening_question, source_digest)
SELECT v.id, 'fr',
	'Responsable des opérations du fonds',
	'Quy Nhơn / Télétravail',
	'Temps plein',
	'Bâtir la colonne vertébrale opérationnelle qui permet à un jeune fonds de grandir sans casser.',
	'La croissance meurt au back-office si personne ne s''en occupe. À ce poste, vous mettrez en place les processus, les contrôles et les systèmes qui gardent le fonds conforme, organisé et prêt à changer d''échelle — en faisant discrètement fonctionner tout le reste.',
	ARRAY['Piloter l''administration du fonds, les cycles de reporting et les processus de conformité', 'Mettre en place et améliorer les systèmes et processus internes', 'Coordonner avec les partenaires juridiques, comptables et bancaires', 'Garder dossiers, contrôles et documentation prêts pour un audit'],
	ARRAY['5 ans et plus en opérations de fonds, finance operations ou fonction support équivalente', 'Un bâtisseur de processus, qui transforme le chaos en check-lists', 'Bonne maîtrise de l''administration de fonds, de la conformité et des contrôles', 'Fiable avec des informations financières sensibles'],
	ARRAY['Parcours immobilier ou fonds privés', 'Vietnamien', 'Aisance avec les systèmes et l''automatisation'],
	ARRAY['Concevoir le modèle opérationnel de zéro', 'Un mandat large sur toute la maison', 'Autonomie, compatible avec le télétravail', 'Rémunération négociable'],
	'Quel est le premier processus opérationnel que vous mettriez en place dans un fonds qui n''en a aucun ?',
	vacancy_source_digest(v.*)
FROM vacancies v WHERE v.slug = 'fund-operations-lead'
ON CONFLICT (vacancy_id, locale) DO NOTHING;

-- ── German (de) ──────────────────────────────────────────────

INSERT INTO vacancy_translations
	(vacancy_id, locale, title, location, employment_type, summary, about,
	 responsibilities, requirements, nice_to_have, offer, screening_question, source_digest)
SELECT v.id, 'de',
	'Investment Analyst (m/w/d)',
	'Quy Nhơn, Vietnam',
	'Vollzeit',
	'Küstenentwicklungen durchgängig prüfen — von der Marktthese bis zur Vorlage für das Investmentkomitee.',
	'Sie sitzen im Zentrum der Frage, wohin EV Investment Kapital lenkt. Gemeinsam mit den Partnern bauen Sie die Modelle, prüfen die Annahmen auf Belastbarkeit und schreiben die Vorlagen, die aus einer Idee eine Zusage machen — mit Fokus auf hochwertige Küstenprojekte in Quy Nhơn.',
	ARRAY['Bewertungsmodelle für Wohn- und Mischnutzungsprojekte an der Küste aufbauen und pflegen', 'Angebot, Absorption, Preise und Nachfragetreiber der Teilmärkte untersuchen', 'Vorlagen für das Investmentkomitee verfassen und Empfehlungen vertreten', 'Die Portfolioentwicklung gegen die ursprüngliche Bewertung verfolgen und Abweichungen benennen'],
	ARRAY['Mindestens 2 Jahre in Immobilien, Private Equity, Investment Banking oder Transaktionsberatung', 'Sichere Finanzmodellierung (DCF, Waterfalls, Sensitivitätsanalysen)', 'Prägnantes Englisch in der Schrift — Sie machen eine komplexe Transaktion auf einer Seite lesbar', 'Souveräner Umgang mit Unschärfe und eigener Feldrecherche'],
	ARRAY['Vietnamesisch', 'Erfahrung in Schwellen- oder Frontier-Märkten', 'Laufendes CFA-Programm'],
	ARRAY['Direkte Begleitung durch die Partner des Fonds', 'Verantwortung für laufende Transaktionen ab dem ersten Tag', 'Ein Platz in der ersten Reihe, während ein Fonds entsteht', 'Verhandelbare Vergütung mit Erfolgsbeteiligung'],
	'Welche Transaktion in Quy Nhơn würden Sie zuerst prüfen — und warum?',
	vacancy_source_digest(v.*)
FROM vacancies v WHERE v.slug = 'investment-analyst'
ON CONFLICT (vacancy_id, locale) DO NOTHING;

INSERT INTO vacancy_translations
	(vacancy_id, locale, title, location, employment_type, summary, about,
	 responsibilities, requirements, nice_to_have, offer, screening_question, source_digest)
SELECT v.id, 'de',
	'Leitung Immobilien-Research (m/w/d)',
	'Quy Nhơn / Remote',
	'Vollzeit',
	'Die Marktkenntnis verantworten, auf der jede Investmententscheidung des Fonds beruht.',
	'Research ist unser Vorsprung. In dieser Rolle verwandeln Sie verstreute Signale — Transaktionen, Infrastrukturplanungen, Touristenströme — in ein stimmiges, laufend aktualisiertes Bild des Marktes von Quy Nhơn und der Zentralküste, auf das sich das ganze Haus verlässt.',
	ARRAY['Marktdaten, Vergleichstransaktionen und Preis-Benchmarks des Hauses verantworten', 'Regelmäßige Research-Notes zu Angebot, Nachfrage und Makrotreibern veröffentlichen', 'Beziehungen zu Maklern, Entwicklern und Behörden für Primärdaten aufbauen', 'Das Investmentteam vor der Bewertung briefen'],
	ARRAY['Mindestens 4 Jahre in Immobilien-Research, Beratung oder Marktanalyse', 'Sorgfalt sowohl bei quantitativen Daten als auch bei qualitativer Feldinformation', 'Ausgezeichnetes Englisch in der Schrift und eine klare visuelle Handschrift', 'Eigenständigkeit — die Research-Agenda setzen Sie'],
	ARRAY['Vietnamesisch und lokales Netzwerk', 'Sicherer Umgang mit GIS und Kartografie', 'Erfahrung in Tourismus oder Hotellerie'],
	ARRAY['Die Research-Funktion von Grund auf aufbauen', 'Direkter Einfluss auf die Kapitalallokation', 'Flexible, remote-freundliche Arbeitsweise', 'Verhandelbare Vergütung'],
	'Welches Signal eines Küstenmarktes unterschätzen die meisten Investoren — und wie würden Sie es verfolgen?',
	vacancy_source_digest(v.*)
FROM vacancies v WHERE v.slug = 'real-estate-research-lead'
ON CONFLICT (vacancy_id, locale) DO NOTHING;

INSERT INTO vacancy_translations
	(vacancy_id, locale, title, location, employment_type, summary, about,
	 responsibilities, requirements, nice_to_have, offer, screening_question, source_digest)
SELECT v.id, 'de',
	'Projektleitung Development (m/w/d)',
	'Quy Nhơn, Vietnam',
	'Vollzeit',
	'Hochwertige Küstenprojekte vom ersten Spatenstich bis zur Übergabe führen — termingerecht, im Budget, im Standard.',
	'Sie verantworten die Umsetzung vor Ort. Indem Sie Planer, Bauunternehmen und Fachberater koordinieren, halten Sie unsere Projekte in Bewegung und schützen zugleich die Qualität, die die Marke EV ausmacht.',
	ARRAY['Terminpläne, Budgets und Fertigstellungsmeilensteine verantworten', 'Architekten, Bauunternehmen und Fachplaner koordinieren', 'Baufortschritts-Reviews führen und Blockaden schnell auflösen', 'Status, Risiken und Kosten an das Investmentteam berichten'],
	ARRAY['Mindestens 5 Jahre in der Steuerung von Immobilien- oder Bauprojekten', 'Nachgewiesene Fertigstellung mittlerer bis großer Wohn- oder Hotelbauten', 'Sicherer Umgang mit Budgets, Terminplänen und Nachunternehmern', 'Ruhig, entscheidungsfreudig und kompromisslos bei der Qualität'],
	ARRAY['Erfahrung mit Küsten- oder Resortprojekten', 'Vietnamesisch', 'PMP oder gleichwertig'],
	ARRAY['Durchgängige Verantwortung für Leuchtturmprojekte', 'Ein Team und ein Budget, um zu liefern', 'Direkter Draht zu den Partnern', 'Verhandelbare Vergütung'],
	'Erzählen Sie von einem Projekt, das Sie gerettet haben, als Termin oder Budget kippten — was haben Sie zuerst getan?',
	vacancy_source_digest(v.*)
FROM vacancies v WHERE v.slug = 'development-project-manager'
ON CONFLICT (vacancy_id, locale) DO NOTHING;

INSERT INTO vacancy_translations
	(vacancy_id, locale, title, location, employment_type, summary, about,
	 responsibilities, requirements, nice_to_have, offer, screening_question, source_digest)
SELECT v.id, 'de',
	'Ingenieur Baufeld und Genehmigungen (m/w/d)',
	'Quy Nhơn, Vietnam',
	'Vollzeit',
	'Den technischen und regulatorischen Weg frei machen, damit unsere Projekte ohne Überraschungen starten.',
	'Bevor das erste Fundament gegossen wird, muss jemand das Grundstück bebaubar machen — Vermessung, Genehmigungen, Erschließung, Konformität. Das sind Sie. Sie verantworten den Ingenieur- und Genehmigungsstrang, der jedes Projekt entrisikiert.',
	ARRAY['Vermessungen, Baugrunduntersuchungen und Machbarkeitsstudien steuern', 'Das Genehmigungsverfahren mit den lokalen Behörden vorantreiben', 'Ver- und Entsorgung, Zufahrten und Infrastrukturanforderungen koordinieren', 'Die technische Due-Diligence-Dokumentation je Standort führen'],
	ARRAY['Bauingenieurwesen oder Statik als Hintergrund, mindestens 4 Jahre auf der Baustelle', 'Praktische Erfahrung mit Genehmigungen und behördlichen Freigaben', 'Sicheres Verständnis lokaler Bauvorschriften und Konformitätsanforderungen', 'Methodische, detailversessene Dokumentation'],
	ARRAY['Vietnamesisch und Kontakte zu lokalen Behörden', 'Erfahrung an der Küste oder in der Geotechnik', 'Zertifizierung für nachhaltiges oder grünes Bauen'],
	ARRAY['Den Strang verantworten, der jedes Projekt freimacht', 'Direkte Zusammenarbeit mit Entwicklern und Behörden', 'Echte Verantwortung, keine Bürokratie', 'Verhandelbare Vergütung'],
	'Welches Genehmigungs- oder Standortrisiko würden Sie bei einem Grundstück direkt am Strand zuerst prüfen?',
	vacancy_source_digest(v.*)
FROM vacancies v WHERE v.slug = 'site-permitting-engineer'
ON CONFLICT (vacancy_id, locale) DO NOTHING;

INSERT INTO vacancy_translations
	(vacancy_id, locale, title, location, employment_type, summary, about,
	 responsibilities, requirements, nice_to_have, offer, screening_question, source_digest)
SELECT v.id, 'de',
	'Investor Relations Associate (m/w/d)',
	'Quy Nhơn / Remote',
	'Vollzeit',
	'Die verlässliche Verbindung zwischen dem Fonds und den Investoren, die ihn tragen.',
	'Unsere Investoren erwarten Klarheit und Offenheit. In dieser Rolle halten Sie sie auf dem Laufenden, beantworten die unbequemen Fragen gut und sorgen dafür, dass sich das Investieren mit EV so durchdacht anfühlt wie die Projekte selbst.',
	ARRAY['Investorenberichte, Updates und Kapitalabrufe vorbereiten', 'Fragen von Investoren präzise und diskret beantworten', 'Fundraising-Unterlagen und den Due-Diligence-Prozess unterstützen', 'Das Investoren-CRM und die Beziehungshistorie pflegen'],
	ARRAY['Mindestens 3 Jahre in Investor Relations, Fondsbetrieb oder kundennaher Finanzarbeit', 'Herausragendes Englisch in Wort und Schrift', 'Diskretion und Gelassenheit im Umgang mit erfahrenen Investoren', 'Absolut fehlerfrei bei Zahlen und Dokumenten'],
	ARRAY['Vietnamesisch oder weitere Sprachen', 'Erfahrung mit Immobilien oder Fonds', 'Netzwerk unter regionalen oder internationalen Investoren'],
	ARRAY['Direkte Beziehungen zur Investorenbasis des Fonds', 'Mitsprache darüber, wie wir kommunizieren und einwerben', 'Eine Vertrauensrolle, remote-freundlich', 'Verhandelbare Vergütung'],
	'Wie würden Sie einem Investor einen verschobenen Projektmeilenstein erklären, ohne sein Vertrauen zu verlieren?',
	vacancy_source_digest(v.*)
FROM vacancies v WHERE v.slug = 'investor-relations-associate'
ON CONFLICT (vacancy_id, locale) DO NOTHING;

INSERT INTO vacancy_translations
	(vacancy_id, locale, title, location, employment_type, summary, about,
	 responsibilities, requirements, nice_to_have, offer, screening_question, source_digest)
SELECT v.id, 'de',
	'Käuferberatung (m/w/d)',
	'Quy Nhơn, Vietnam',
	'Vollzeit',
	'Käufer zu einem hochwertigen Zuhause an der Küste begleiten — mit einer Ehrlichkeit, die Empfehlungen einbringt.',
	'Sie sind die Person, an die Käufer sich erinnern. Von der ersten Anfrage bis zur Übergabe beraten Sie zur passenden Immobilie, zum Ablauf und zu den Unterlagen — und bauen das Vertrauen auf, das aus einem Kauf drei macht.',
	ARRAY['Kaufinteressenten zu Objekten, Preisen und Ablauf beraten', 'Kunden durch Reservierung, Verträge und Übergabe führen', 'Mit den Teams für Recht, Finanzen und Development abstimmen', 'Langfristige Beziehungen aufbauen, die Empfehlungen erzeugen'],
	ARRAY['Mindestens 3 Jahre im hochwertigen Immobilienvertrieb oder in der Käuferberatung', 'Ein beratender Stil ohne Druck, der Vertrauen schafft', 'Fließendes Englisch; klare, zugewandte Kommunikation', 'Echtes Verständnis für den Weg des Käufers'],
	ARRAY['Vietnamesisch', 'Erfahrung mit internationaler Kundschaft oder Expats', 'Bestehendes Käufernetzwerk'],
	ARRAY['Ein wirklich hochwertiges Produkt vertreten, hinter dem Sie stehen können', 'Warme Anfragen statt Kaltakquise', 'Ungedeckelte, leistungsabhängige Beteiligung', 'Verhandelbare Vergütung'],
	'Beschreiben Sie eine Situation, in der Sie einem Käufer vom Kauf abgeraten haben. Was ist daraus geworden?',
	vacancy_source_digest(v.*)
FROM vacancies v WHERE v.slug = 'buyer-advisory-specialist'
ON CONFLICT (vacancy_id, locale) DO NOTHING;

INSERT INTO vacancy_translations
	(vacancy_id, locale, title, location, employment_type, summary, about,
	 responsibilities, requirements, nice_to_have, offer, screening_question, source_digest)
SELECT v.id, 'de',
	'Leitung Fondsbetrieb (m/w/d)',
	'Quy Nhơn / Remote',
	'Vollzeit',
	'Das operative Rückgrat bauen, mit dem ein junger Fonds wachsen kann, ohne zu brechen.',
	'Wachstum stirbt im Backoffice, wenn sich niemand darum kümmert. In dieser Rolle schaffen Sie die Prozesse, Kontrollen und Systeme, die den Fonds compliant, geordnet und skalierbar halten — und lassen damit unauffällig alles andere funktionieren.',
	ARRAY['Fondsadministration, Berichtszyklen und Compliance-Abläufe verantworten', 'Interne Systeme und Prozesse aufsetzen und verbessern', 'Mit Partnern aus Recht, Buchhaltung und Bankwesen abstimmen', 'Unterlagen, Kontrollen und Dokumentation prüfungsfest halten'],
	ARRAY['Mindestens 5 Jahre im Fondsbetrieb, in Finance Operations oder einer vergleichbaren Rückgratfunktion', 'Prozessbauer, der Chaos in Checklisten verwandelt', 'Fundiertes Verständnis von Fondsadministration, Compliance und Kontrollen', 'Vertrauenswürdig im Umgang mit sensiblen Finanzinformationen'],
	ARRAY['Hintergrund in Immobilien oder Private Funds', 'Vietnamesisch', 'Sicherer Umgang mit Systemen und Automatisierung'],
	ARRAY['Das Betriebsmodell von Grund auf entwerfen', 'Ein breites Mandat über das ganze Haus', 'Eigenständig und remote-freundlich', 'Verhandelbare Vergütung'],
	'Welchen operativen Prozess würden Sie in einem Fonds, der keinen hat, als Ersten einführen?',
	vacancy_source_digest(v.*)
FROM vacancies v WHERE v.slug = 'fund-operations-lead'
ON CONFLICT (vacancy_id, locale) DO NOTHING;
