export interface SlangWord {
  word: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: string;
  quote: string;
  translations: Record<string, string>;
}

export interface Movie {
  id: string;
  title: string;
  year: number;
  genre: string[];
  poster: string;
  slangWords: SlangWord[];
}

const allLangs = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh', 'ar', 'hi', 'tr', 'pl', 'uk', 'ru'];

const makeTranslations = (translations: Partial<Record<string, string>>): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const lang of allLangs) {
    result[lang] = translations[lang] || translations['en'] || '';
  }
  return result;
};

export const movies: Movie[] = [
  {
    id: 'wolf-of-wall-street',
    title: 'The Wolf of Wall Street',
    year: 2013,
    genre: ['Drama', 'Comedy', 'Crime'],
    poster: '/og-image.jpg',
    slangWords: [
      {
        word: 'Pump and dump',
        difficulty: 'medium',
        type: 'Finance',
        quote: '"It\'s a pump and dump scheme. We pump up the stock and dump it."',
        translations: makeTranslations({
          en: 'Pump and dump', es: 'Bombea y vende', fr: 'Gonfler et vendre', de: 'Aufblasen und abstoßen',
          it: 'Gonfia e scarica', pt: 'Inflar e vender', ja: '買い占めて売りさばく', ko: '펌프 앤 덤프',
          zh: '拉高出货', ar: 'التضخيم والتفريغ', hi: 'पंप और डंप', tr: 'Şişir ve boşalt',
          pl: 'Pompowanie i zrzucanie', uk: 'Накачування і скидання', ru: 'Накачка и сброс',
        }),
      },
      {
        word: 'Sell me this pen',
        difficulty: 'easy',
        type: 'Business',
        quote: '"Sell me this pen."',
        translations: makeTranslations({
          en: 'Sell me this pen', es: 'Véndeme este bolígrafo', fr: 'Vends-moi ce stylo', de: 'Verkaufe mir diesen Stift',
          it: 'Vendimi questa penna', pt: 'Me venda esta caneta', ja: 'このペンを売ってみろ', ko: '이 펜을 나에게 팔아봐',
          zh: '把这支笔卖给我', ar: 'بِعْ لي هذا القلم', hi: 'मुझे यह पेन बेचो', tr: 'Bana bu kalemi sat',
          pl: 'Sprzedaj mi to pióro', uk: 'Продай мені цю ручку', ru: 'Продай мне эту ручку',
        }),
      },
      {
        word: 'Stratton Oakmont',
        difficulty: 'hard',
        type: 'Proper Noun',
        quote: '"Stratton Oakmont is the real deal."',
        translations: makeTranslations({
          en: 'Stratton Oakmont', es: 'Stratton Oakmont', fr: 'Stratton Oakmont', de: 'Stratton Oakmont',
          it: 'Stratton Oakmont', pt: 'Stratton Oakmont', ja: 'ストラトン・オークモント', ko: '스트래튼 오크몬트',
          zh: '斯特拉顿奥克蒙特', ar: 'ستراتون أوكمونت', hi: 'स्ट्रैटन ओकमोंट', tr: 'Stratton Oakmont',
          pl: 'Stratton Oakmont', uk: 'Стреттон Оакмонт', ru: 'Страттон Оукмонт',
        }),
      },
      {
        word: 'Lamborghini',
        difficulty: 'easy',
        type: 'Slang/Status',
        quote: '"Get me a Lamborghini."',
        translations: makeTranslations({
          en: 'Lamborghini (symbol of wealth)', es: 'Lamborghini (símbolo de riqueza)', fr: 'Lamborghini (symbole de richesse)', de: 'Lamborghini (Statussymbol)',
          it: 'Lamborghini (simbolo di ricchezza)', pt: 'Lamborghini (símbolo de riqueza)', ja: 'ランボルギーニ（富の象徴）', ko: '람보르기니(부의 상징)',
          zh: '兰博基尼（财富象征）', ar: 'لامبورغيني (رمز للثروة)', hi: 'लैम्बोर्गिनी (दौलत का प्रतीक)', tr: 'Lamborghini (zenginlik sembolü)',
          pl: 'Lamborghini (symbol bogactwa)', uk: 'Ламборгіні (символ багатства)', ru: 'Ламборгини (символ богатства)',
        }),
      },
    ],
  },
  {
    id: 'breaking-bad',
    title: 'Breaking Bad',
    year: 2008,
    genre: ['Drama', 'Crime', 'Thriller'],
    poster: '/og-image.jpg',
    slangWords: [
      {
        word: 'Say my name',
        difficulty: 'easy',
        type: 'Catchphrase',
        quote: '"Say my name." — "You\'re Heisenberg."',
        translations: makeTranslations({
          en: 'Say my name', es: 'Di mi nombre', fr: 'Dis mon nom', de: 'Sag meinen Namen',
          it: 'Di\' il mio nome', pt: 'Diga meu nome', ja: '俺の名を言ってみろ', ko: '내 이름을 말핑',
          zh: '说出我的名字', ar: 'قل اسمي', hi: 'मेरा नाम बोलो', tr: 'Adımı söyle',
          pl: 'Wymów moje imię', uk: 'Скажи моє ім\'я', ru: 'Назови моё имя',
        }),
      },
      {
        word: 'Bitch',
        difficulty: 'easy',
        type: 'Slang',
        quote: '"Yeah, science bitch!" — Jesse Pinkman',
        translations: makeTranslations({
          en: 'Bitch (exclamation)', es: '¡Hijo de puta!', fr: 'Salope !', de: 'Bitch!',
          it: 'Stronzo!', pt: 'Vaca!', ja: 'ビッチ！', ko: '이 새끼야!',
          zh: '混蛋！', ar: 'يا عاهرة!', hi: 'कमीने!', tr: 'Orospu çocuğu!',
          pl: 'Suko!', uk: 'Сука!', ru: 'Сука!',
        }),
      },
      {
        word: 'Heisenberg',
        difficulty: 'medium',
        type: 'Proper Noun',
        quote: '"I am the one who knocks. I am the danger."',
        translations: makeTranslations({
          en: 'Heisenberg (alter ego)', es: 'Heisenberg', fr: 'Heisenberg', de: 'Heisenberg',
          it: 'Heisenberg', pt: 'Heisenberg', ja: 'ハイゼンベルク', ko: '하이젠베르크',
          zh: '海森堡', ar: 'هايزنبرغ', hi: 'हाइजेनबर्ग', tr: 'Heisenberg',
          pl: 'Heisenberg', uk: 'Гайзенберг', ru: 'Хайзенберг',
        }),
      },
      {
        word: 'Blue sky',
        difficulty: 'hard',
        type: 'Drug Slang',
        quote: '"The blue sky. That\'s our product."',
        translations: makeTranslations({
          en: 'Blue sky (methamphetamine)', es: 'Cielo azul (metanfetamina)', fr: 'Ciel bleu (méthamphétamine)', de: 'Blauer Himmel (Methamphetamin)',
          it: 'Cielo blu (metanfetamina)', pt: 'Céu azul (metanfetamina)', ja: 'ブルースカイ（覚醒剤）', ko: '블루 스카이 (메스암페타민)',
          zh: '蓝天（冰毒）', ar: 'السماء الزرقاء (الميثامفيتامين)', hi: 'ब्लू स्काई (मेथैंफेटामाइन)', tr: 'Mavi gök (metamfetamin)',
          pl: 'Blekitne niebo (metamfetamina)', uk: 'Блакитне небо (метамфетамін)', ru: 'Голубое небо (метамфетамин)',
        }),
      },
      {
        word: 'Cook',
        difficulty: 'medium',
        type: 'Drug Slang',
        quote: '"Let\'s cook." — Walter White',
        translations: makeTranslations({
          en: 'Cook (to make meth)', es: 'Cocinar (fabricar metanfetamina)', fr: 'Cuisiner (fabriquer de la méthamphétamine)', de: 'Kochen (Meth herstellen)',
          it: 'Cuocere (produrre metanfetamina)', pt: 'Cozinhar (fabricar metanfetamina)', ja: '炊く（覚醒剤を精製する）', ko: '요리하다 (메스 제조)',
          zh: '做饭（制毒）', ar: 'طبخ (صنع الميثامفيتامين)', hi: 'पकाना (मेथ बनाना)', tr: 'Pişirmek (met üretmek)',
          pl: 'Gotowanie (produkcja metamfetaminy)', uk: 'Готувати (виготовляти метамфетамін)', ru: 'Готовить (варить метамфетамин)',
        }),
      },
    ],
  },
  {
    id: 'friends',
    title: 'Friends',
    year: 1994,
    genre: ['Comedy', 'Romance'],
    poster: '/og-image.jpg',
    slangWords: [
      {
        word: 'How you doin\'',
        difficulty: 'easy',
        type: 'Catchphrase',
        quote: '"How you doin\'?" — Joey Tribbiani',
        translations: makeTranslations({
          en: 'How you doin\'? (pickup line)', es: '¿Cómo estás?', fr: 'Ça va ?', de: 'Wie geht\'s?',
          it: 'Come va?', pt: 'Como vai?', ja: '調子どう？', ko: '어떻게 지내?',
          zh: '你好吗？（搭讪语）', ar: 'كيف حالك؟', hi: 'कैसे हो?', tr: 'Nasılsın?',
          pl: 'Jak leci?', uk: 'Як справи?', ru: 'Как дела?',
        }),
      },
      {
        word: 'We were on a break',
        difficulty: 'easy',
        type: 'Catchphrase',
        quote: '"We were on a break!" — Ross Geller',
        translations: makeTranslations({
          en: 'We were on a break', es: 'Estábamos en un descanso', fr: 'On était en pause', de: 'Wir hatten eine Pause',
          it: 'Eravamo in pausa', pt: 'Estávamos num intervalo', ja: '俺たち休み中だったんだ', ko: '우리 쉬는 시간이었어',
          zh: '我们在休息', ar: 'كنا في استراحة', hi: 'हम ब्रेक पर थे', tr: 'Ara vermiştik',
          pl: 'Byliśmy na przerwie', uk: 'Ми були на перерві', ru: 'Мы были на перерыве',
        }),
      },
      {
        word: 'Pivot',
        difficulty: 'easy',
        type: 'Meme',
        quote: '"Pivot! Pivot! Pivot!" — Ross Geller',
        translations: makeTranslations({
          en: 'Pivot!', es: '¡Gira!', fr: 'Pivot!', de: 'Drehen!',
          it: 'Ruota!', pt: 'Gira!', ja: '回転！', ko: '돌려!',
          zh: '转！', ar: 'ادور!', hi: 'घुमाओ!', tr: 'Döndür!',
          pl: 'Obróć!', uk: 'Обертай!', ru: 'Поворачивай!',
        }),
      },
    ],
  },
  {
    id: 'the-hangover',
    title: 'The Hangover',
    year: 2009,
    genre: ['Comedy'],
    poster: '/og-image.jpg',
    slangWords: [
      {
        word: 'Wolf pack',
        difficulty: 'easy',
        type: 'Slang',
        quote: '"We\'re the wolf pack." — Alan Garner',
        translations: makeTranslations({
          en: 'Wolf pack (group of friends)', es: 'La manada de lobos', fr: 'La meute de loups', de: 'Das Wolfsrudel',
          it: 'Il branco di lupi', pt: 'A alcateia de lobos', ja: '狼の群れ', ko: '늑대 무리',
          zh: '狼群', ar: 'قطيع الذئاب', hi: 'भेड़ियों का झुंड', tr: 'Kurt sürüsü',
          pl: 'Wataha wilków', uk: 'Зграя вовків', ru: 'Волчья стая',
        }),
      },
      {
        word: 'Hangover',
        difficulty: 'easy',
        type: 'Common',
        quote: '"I have a terrible hangover."',
        translations: makeTranslations({
          en: 'Hangover', es: 'Resaca', fr: 'Gueule de bois', de: 'Kater',
          it: 'Postumi della sbornia', pt: 'Ressaca', ja: '二日酔い', ko: '숙취',
          zh: '宿醉', ar: 'خُمار', hi: 'हैंगओवर', tr: 'Akşamdan kalma',
          pl: 'Kac', uk: 'Похмілля', ru: 'Похмелье',
        }),
      },
      {
        word: 'One-man wolf pack',
        difficulty: 'medium',
        type: 'Slang',
        quote: '"I\'m a one-man wolf pack." — Alan Garner',
        translations: makeTranslations({
          en: 'One-man wolf pack', es: 'Manada de un solo hombre', fr: 'Meute d\'un seul homme', de: 'Ein-Mann-Wolfsrudel',
          it: 'Branco di un solo uomo', pt: 'Alcateia de um homem só', ja: '一人狼の群れ', ko: '한 사람 늑대 무리',
          zh: '独狼', ar: 'قطيع ذئاب من رجل واحد', hi: 'एक आदमी का भेड़िया झुंड', tr: 'Tek kişilik kurt sürüsü',
          pl: 'Wataha jednego człowieka', uk: 'Зграя з одного вовка', ru: 'Стая из одного волка',
        }),
      },
    ],
  },
  {
    id: 'pulp-fiction',
    title: 'Pulp Fiction',
    year: 1994,
    genre: ['Crime', 'Drama'],
    poster: '/og-image.jpg',
    slangWords: [
      {
        word: 'Royale with Cheese',
        difficulty: 'medium',
        type: 'Cultural Reference',
        quote: '"They call it a Royale with Cheese." — Vincent Vega',
        translations: makeTranslations({
          en: 'Royale with Cheese', es: 'Royale con queso', fr: 'Royal Cheese', de: 'Royale mit Käse',
          it: 'Royale con formaggio', pt: 'Royale com queijo', ja: 'ロワイヤル・ウィズ・チーズ', ko: '로열 위드 치즈',
          zh: '皇家芝士堡', ar: 'رويال مع الجبن', hi: 'रॉयाल विथ चीज़', tr: 'Peynirli Royale',
          pl: 'Royale z serem', uk: 'Рояль з сиром', ru: 'Рояль с сыром',
        }),
      },
      {
        word: 'Bad motherfucker',
        difficulty: 'hard',
        type: 'Slang',
        quote: '"I\'m a bad motherfucker." — Jules Winnfield',
        translations: makeTranslations({
          en: 'Bad motherfucker (tough guy)', es: 'Tipo duro', fr: 'Un dur', de: 'Ein harter Hund',
          it: 'Un tipo tosto', pt: 'Um cara durão', ja: '悪い野郎', ko: '무서운 놈',
          zh: '狠角色', ar: 'رجلٌ قاسٍ', hi: 'खतरनाक आदमी', tr: 'Sert herif',
          pl: 'Twardziel', uk: 'Крутий чувак', ru: 'Крутой чувак',
        }),
      },
      {
        word: 'Quarter pounder',
        difficulty: 'medium',
        type: 'Food Slang',
        quote: '"A Quarter Pounder with Cheese?" — Vincent Vega',
        translations: makeTranslations({
          en: 'Quarter pounder', es: 'Cuarto de libra', fr: 'Royal Cheese', de: 'Quarter Pounder',
          it: 'Quarter Pounder', pt: 'Quarter Pounder', ja: 'クォーターパウンダー', ko: '쿼터 파울더',
          zh: '四分之一磅汉堡', ar: 'ربع رطل', hi: 'क्वार्टर पाउंडर', tr: 'Çeyrek pounder',
          pl: 'Quarter Pounder', uk: 'Квортер Паундер', ru: 'Квотер Паундер',
        }),
      },
      {
        word: 'Divine intervention',
        difficulty: 'medium',
        type: 'Expression',
        quote: '"This is divine intervention." — Jules Winnfield',
        translations: makeTranslations({
          en: 'Divine intervention', es: 'Intervención divina', fr: 'Intervention divine', de: 'Göttliche Intervention',
          it: 'Intervento divino', pt: 'Intervenção divina', ja: '神の介入', ko: '신의 개입',
          zh: '神的干预', ar: 'تدخل إلهي', hi: 'दिव्य हस्तक्षेप', tr: 'İlahi müdahale',
          pl: 'Interwencja boska', uk: 'Божественне втручання', ru: 'Божественное вмешательство',
        }),
      },
    ],
  },
  {
    id: 'stranger-things',
    title: 'Stranger Things',
    year: 2016,
    genre: ['Drama', 'Fantasy', 'Horror'],
    poster: '/og-image.jpg',
    slangWords: [
      {
        word: 'Mouthbreather',
        difficulty: 'medium',
        type: 'Insult',
        quote: '"Why are you keeping this curiosity door locked, you mouthbreather?" — Dustin Henderson',
        translations: makeTranslations({
          en: 'Mouthbreather (idiot)', es: 'Bocazas (idiota)', fr: 'Respire-bouche (idiot)', de: 'Mundatmer (Idiot)',
          it: 'Bocca-aperta (idiota)', pt: 'Respirador de boca (idiota)', ja: '口呼吸者（馬鹿）', ko: '입으로 숨쉬는 놈 (바보)',
          zh: '用嘴呼吸的人（笨蛋）', ar: 'متنفس الفم (أحمق)', hi: 'मुंह से सांस लेने वाला (बेवकूफ)', tr: 'Ağız nefesli (aptal)',
          pl: 'Usta-oddychacz (idiota)', uk: 'Ротодих (дібіл)', ru: 'Ртодых (идиот)',
        }),
      },
      {
        word: 'Upside Down',
        difficulty: 'easy',
        type: 'Proper Noun',
        quote: '"She\'s in the Upside Down." — Eleven',
        translations: makeTranslations({
          en: 'Upside Down (parallel dimension)', es: 'El Otro Lado', fr: 'L\'Envers', de: 'Die Upside Down-Welt',
          it: 'Sottosopra', pt: 'Mundo Invertido', ja: '裏側の世界', ko: '뒤집힌 세계',
          zh: '颠倒世界', ar: 'العالم المقلوب', hi: 'उल्टा दुनिया', tr: 'Ters Dünya',
          pl: 'Upside Down', uk: 'Догори дриґом', ru: 'Оборотная сторона',
        }),
      },
      {
        word: 'Eggo',
        difficulty: 'easy',
        type: 'Cultural Reference',
        quote: '"L\'Eggo my Eggo." — Eleven',
        translations: makeTranslations({
          en: 'Eggo (waffle brand)', es: 'Eggo (marca de gofres)', fr: 'Eggo (marque de gaufres)', de: 'Eggo (Waffelmarke)',
          it: 'Eggo (marca di waffle)', pt: 'Eggo (marca de waffle)', ja: 'エゴー（ワッフルブランド）', ko: '에고(와플 브랜드)',
          zh: 'Eggo（华夫饼品牌）', ar: 'إيغو (علامة الوافل)', hi: 'एग्गो (वेफल ब्रांड)', tr: 'Eggo (waffle markası)',
          pl: 'Eggo (marka gofrów)', uk: 'Егго (бренд вафель)', ru: 'Эгго (бренд вафель)',
        }),
      },
      {
        word: 'Nerd',
        difficulty: 'easy',
        type: 'Slang',
        quote: '"You\'re such a nerd." — Mike Wheeler',
        translations: makeTranslations({
          en: 'Nerd', es: 'Empollón', fr: 'Intello', de: 'Nerd',
          it: 'Secchione', pt: 'Nerd', ja: 'オタク', ko: '너드',
          zh: '书呆子', ar: 'نرد', hi: 'पढ़ाकू', tr: 'İnek',
          pl: 'Kujon', uk: 'Ботан', ru: 'Ботан',
        }),
      },
    ],
  },
  {
    id: 'the-avengers',
    title: 'The Avengers',
    year: 2012,
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    poster: '/og-image.jpg',
    slangWords: [
      {
        word: 'Assemble',
        difficulty: 'easy',
        type: 'Catchphrase',
        quote: '"Avengers, assemble!" — Captain America',
        translations: makeTranslations({
          en: 'Assemble', es: 'Reuníos', fr: 'Assemblez-vous', de: 'Versammeln!',
          it: 'Radunatevi', pt: 'Avante!', ja: '集合！', ko: '집합!',
          zh: '集合！', ar: 'تحدوا!', hi: 'इकट्ठा हो!', tr: 'Toplanın!',
          pl: 'Zbiorka!', uk: 'Збір!', ru: 'Собраться!',
        }),
      },
      {
        word: 'Hulk smash',
        difficulty: 'easy',
        type: 'Catchphrase',
        quote: '"Hulk smash!" — Hulk',
        translations: makeTranslations({
          en: 'Hulk smash', es: '¡Hulk aplasta!', fr: 'Hulk écrase!', de: 'Hulk zerstört!',
          it: 'Hulk spacca!', pt: 'Hulk esmaga!', ja: 'ハルク・スマッシュ！', ko: '헐크 스매시!',
          zh: '浩克猛击！', ar: 'هالك يسحق!', hi: 'हल्क तबाही!', tr: 'Hulk eziyor!',
          pl: 'Hulk niszczy!', uk: 'Халк лупцює!', ru: 'Халк крушить!',
        }),
      },
      {
        word: 'Genius billionaire',
        difficulty: 'easy',
        type: 'Expression',
        quote: '"Genius, billionaire, playboy, philanthropist." — Tony Stark',
        translations: makeTranslations({
          en: 'Genius billionaire', es: 'Genio multimillonario', fr: 'Milliardaire génial', de: 'Genialer Milliardär',
          it: 'Genio miliardario', pt: 'Gênio bilionário', ja: '天才億万長者', ko: '천재 억만장자',
          zh: '天才亿万富翁', ar: 'ملياردير عبقري', hi: 'प्रतिभाशाली अरबपति', tr: 'Deha milyarder',
          pl: 'Genialny miliarder', uk: 'Геніальний мільярдер', ru: 'Гениальный миллиардер',
        }),
      },
      {
        word: 'I am Iron Man',
        difficulty: 'easy',
        type: 'Catchphrase',
        quote: '"I am Iron Man." — Tony Stark',
        translations: makeTranslations({
          en: 'I am Iron Man', es: 'Soy Iron Man', fr: 'Je suis Iron Man', de: 'Ich bin Iron Man',
          it: 'Sono Iron Man', pt: 'Eu sou o Homem de Ferro', ja: '私がアイアンマンだ', ko: '나는 아이언맨이다',
          zh: '我就是钢铁侠', ar: 'أنا آيرون مان', hi: 'मैं आयरन मैन हूं', tr: 'Ben Demir Adam\'ım',
          pl: 'Jestem Iron Manem', uk: 'Я Залізна Людина', ru: 'Я Железный Человек',
        }),
      },
    ],
  },
  {
    id: 'game-of-thrones',
    title: 'Game of Thrones',
    year: 2011,
    genre: ['Action', 'Adventure', 'Drama'],
    poster: '/og-image.jpg',
    slangWords: [
      {
        word: 'Winter is coming',
        difficulty: 'easy',
        type: 'Catchphrase',
        quote: '"Winter is coming." — House Stark',
        translations: makeTranslations({
          en: 'Winter is coming', es: 'Se acerca el invierno', fr: 'L\'hiver vient', de: 'Der Winter naht',
          it: 'L\'inverno sta arrivando', pt: 'O inverno está chegando', ja: '冬が来る', ko: '겨울이 온다',
          zh: '凛冬将至', ar: 'الشتاء قادم', hi: 'सर्दी आ रही है', tr: 'Kış geliyor',
          pl: 'Nadchodzi zima', uk: 'Зима близько', ru: 'Зима близко',
        }),
      },
      {
        word: 'You know nothing',
        difficulty: 'easy',
        type: 'Catchphrase',
        quote: '"You know nothing, Jon Snow." — Ygritte',
        translations: makeTranslations({
          en: 'You know nothing', es: 'No sabes nada', fr: 'Tu ne sais rien', de: 'Du weißt nichts',
          it: 'Non sai niente', pt: 'Você não sabe de nada', ja: 'お前は何も知らない', ko: '넌 아무것도 몰라',
          zh: '你什么都不知道', ar: 'أنت لا تعرف شيئًا', hi: 'तुम्हें कुछ नहीं पता', tr: 'Hiçbir şey bilmiyorsun',
          pl: 'Niczego nie wiesz', uk: 'Ти нічого не знаєш', ru: 'Ты ничего не знаешь',
        }),
      },
      {
        word: 'Khaleesi',
        difficulty: 'medium',
        type: 'Title',
        quote: '"I am Khaleesi." — Daenerys Targaryen',
        translations: makeTranslations({
          en: 'Khaleesi (queen)', es: 'Khaleesi', fr: 'Khaleesi', de: 'Khaleesi',
          it: 'Khaleesi', pt: 'Khaleesi', ja: 'カリーシー', ko: '칼리시',
          zh: '卡丽熙', ar: 'خاليسي', hi: 'खलीसी', tr: 'Khaleesi',
          pl: 'Khaleesi', uk: 'Кхалісі', ru: 'Кхалиси',
        }),
      },
      {
        word: 'The night is dark',
        difficulty: 'medium',
        type: 'Expression',
        quote: '"The night is dark and full of terrors." — Melisandre',
        translations: makeTranslations({
          en: 'The night is dark and full of terrors', es: 'La noche es oscura y alberga horrores', fr: 'La nuit est sombre et pleine de terreurs', de: 'Die Nacht ist dunkel und voller Schrecken',
          it: 'La notte è buia e piena di terrori', pt: 'A noite é escura e cheia de horrores', ja: '夜は暗く、恐怖に満ちている', ko: '밤은 어둡고 공포로 가득하다',
          zh: '长夜黑暗，处处恐怖', ar: 'الليل مظلم ومليء بالرعوب', hi: 'रात अंधेरी है और डर से भरी है', tr: 'Gece karanlıktır ve dehşetlerle doludur',
          pl: 'Noc jest ciemna i pełna strachów', uk: 'Ніч темна і повна жахіть', ru: 'Ночь темна и полна ужасов',
        }),
      },
      {
        word: 'Dracarys',
        difficulty: 'medium',
        type: 'Command',
        quote: '"Dracarys!" — Daenerys Targaryen',
        translations: makeTranslations({
          en: 'Dracarys (dragon fire)', es: '¡Dracarys!', fr: 'Dracarys !', de: 'Dracarys!',
          it: 'Dracarys!', pt: 'Dracarys!', ja: 'ドラカリス！', ko: '드라카리스!',
          zh: '龙焰！', ar: 'دراكاريس!', hi: 'ड्रैकारिस!', tr: 'Dracarys!',
          pl: 'Dracarys!', uk: 'Дракаріс!', ru: 'Дракарис!',
        }),
      },
    ],
  },
];

export function getMovieById(id: string): Movie | undefined {
  return movies.find((m) => m.id === id);
}

export function getAllSlangWords(): SlangWord[] {
  return movies.flatMap((m) => m.slangWords);
}

export function getSlangByWord(word: string): SlangWord | undefined {
  return getAllSlangWords().find((s) => s.word === word);
}
