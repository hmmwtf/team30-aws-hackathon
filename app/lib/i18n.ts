export type Language = 'ko' | 'en' | 'ja' | 'zh' | 'de' | 'fr' | 'it' | 'ru' | 'hi' | 'pt'

export const languages = {
  ko: { name: '한국어', flag: '🇰🇷' },
  en: { name: 'English', flag: '🇺🇸' },
  ja: { name: '日本語', flag: '🇯🇵' },
  zh: { name: '中文', flag: '🇨🇳' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  fr: { name: 'Français', flag: '🇫🇷' },
  it: { name: 'Italiano', flag: '🇮🇹' },
  ru: { name: 'Русский', flag: '🇷🇺' },
  hi: { name: 'हिन्दी', flag: '🇮🇳' },
  pt: { name: 'Português', flag: '🇧🇷' },
}

export const translations = {
  ko: {
    title: 'CultureChat',
    subtitle: '문화적 배려가 담긴 매너있는 채팅 서비스',
    selectCountry: '채팅 상대방의 국가를 선택하세요',
    selectLanguage: '언어를 선택하세요',
    chatTitle: '채팅 창',
    chatSubtitle: '메시지를 입력하면 문화적 매너를 체크해드립니다',
    inputPlaceholder: '메시지를 입력하세요...',
    sendButton: '전송',
    analyzing: '분석중...',
    translating: '번역중...',
    culturalCheck: '문화 기준으로 매너를 체크합니다',
    mannerGood: '👍 매너 굿! 문화적으로 적절한 표현이에요',
    translateMessage: '메시지 번역',
    originalMessage: '원문',
    translatedMessage: '번역문',
    sendButtonText: '보내기',
    cancelButtonText: '취소',
    analyzingMessage: '번역 및 매너 분석 중...',
    modeSelection: '모드 선택',
    chatMode: '💬 채팅 모드',
    translateMode: '🌐 번역 모드',
    suggestion: '제안',
    sponsor: {
      title: '서비스가 도움이 되셨나요?',
      message: '지금까지 {{count}}번 사용하셨습니다. 서비스 개선을 위해 후원이나 리뷰를 부탁드립니다!',
      later: '나중에',
      support: '후원하기',
      account: {
        title: '후원 계좌',
        bank: '은행',
        number: '계좌번호',
        name: '예금주'
      },
      review: {
        title: '리뷰 남기기',
        message: '별점과 리뷰로 응원해주세요!'
      },
      page: {
        title: 'CultureChat 후원하기',
        subtitle: '문화적 배려가 담긴 AI 번역 서비스를 응원해주세요',
        donation: {
          title: '후원하기',
          message: '여러분의 소중한 후원이 더 나은 서비스를 만듭니다.'
        },
        review: {
          title: '리뷰 남기기',
          message: '서비스가 도움이 되셨다면 별점과 리뷰를 남겨주세요!',
          button: '리뷰 작성하기'
        },
        about: {
          title: '서비스 소개',
          feature1: {
            title: '문화적 매너 체크',
            desc: '각 국가의 문화를 고려한 표현 분석'
          },
          feature2: {
            title: 'AI 번역',
            desc: 'AWS 기반 고품질 실시간 번역'
          },
          feature3: {
            title: '실시간 피드백',
            desc: '즉각적인 문화적 조언 제공'
          }
        },
        contact: {
          title: '연락처'
        }
      }
    },
    ad: {
      title: 'CultureChat - 무료 체험',
      subtitle: '문화적 배려가 담긴 AI 번역 서비스',
      feature1: '실시간 번역',
      feature2: '매너 체크',
      feature3: '문화 분석'
    }
  },
  en: {
    title: 'CultureChat',
    subtitle: 'Culturally considerate international chat service',
    selectCountry: 'Select your chat partner\'s country',
    selectLanguage: 'Select Language',
    chatTitle: 'Chat Window',
    chatSubtitle: 'We\'ll check cultural manners when you type a message',
    inputPlaceholder: 'Type your message...',
    sendButton: 'Send',
    analyzing: 'Analyzing...',
    translating: 'Translating...',
    culturalCheck: 'cultural standards for manner checking',
    mannerGood: '👍 Good manners! Culturally appropriate expression',
    translateMessage: 'Translate Message',
    originalMessage: 'Original',
    translatedMessage: 'Translation',
    sendButtonText: 'Send',
    cancelButtonText: 'Cancel',
    analyzingMessage: 'Translating and analyzing manners...',
    modeSelection: 'Mode Selection',
    chatMode: '💬 Chat Mode',
    translateMode: '🌐 Translate Mode',
    suggestion: 'Suggestion',
    sponsor: {
      title: 'Did our service help you?',
      message: 'You have used our service {{count}} times. Please consider supporting us with a donation or review!',
      later: 'Later',
      support: 'Support Us',
      account: {
        title: 'Donation Account',
        bank: 'Bank',
        number: 'Account Number',
        name: 'Account Holder'
      },
      review: {
        title: 'Leave a Review',
        message: 'Please support us with stars and reviews!'
      },
      page: {
        title: 'Support CultureChat',
        subtitle: 'Support our AI translation service with cultural consideration',
        donation: {
          title: 'Make a Donation',
          message: 'Your valuable support helps us create better services.'
        },
        review: {
          title: 'Leave a Review',
          message: 'If our service was helpful, please leave us stars and reviews!',
          button: 'Write Review'
        },
        about: {
          title: 'About Our Service',
          feature1: {
            title: 'Cultural Manner Check',
            desc: 'Expression analysis considering each country\'s culture'
          },
          feature2: {
            title: 'AI Translation',
            desc: 'High-quality real-time translation based on AWS'
          },
          feature3: {
            title: 'Real-time Feedback',
            desc: 'Instant cultural advice provision'
          }
        },
        contact: {
          title: 'Contact Us'
        }
      }
    },
    ad: {
      title: 'CultureChat - Free Trial',
      subtitle: 'AI translation service with cultural consideration',
      feature1: 'Real-time Translation',
      feature2: 'Manner Check',
      feature3: 'Cultural Analysis'
    }
  },
  ja: {
    title: 'CultureChat',
    subtitle: '文化的配慮のある国際チャットサービス',
    selectCountry: 'チャット相手の国を選択してください',
    selectLanguage: '言語を選択',
    chatTitle: 'チャットウィンドウ',
    chatSubtitle: 'メッセージを入力すると文化的マナーをチェックします',
    inputPlaceholder: 'メッセージを入力してください...',
    sendButton: '送信',
    analyzing: '分析中...',
    translating: '翻訳中...',
    culturalCheck: '文化基準でマナーをチェックします',
    mannerGood: '👍 マナー良好！文化的に適切な表現です',
    translateMessage: 'メッセージを翻訳',
    originalMessage: '原文',
    translatedMessage: '翻訳文',
    sendButtonText: '送信',
    cancelButtonText: 'キャンセル',
    analyzingMessage: '翻訳とマナー分析中...',
    modeSelection: 'モード選択',
    chatMode: '💬 チャットモード',
    translateMode: '🌐 翻訳モード',
    suggestion: '提案',
  },
  zh: {
    title: 'CultureChat',
    subtitle: '具有文化关怀的国际聊天服务',
    selectCountry: '请选择聊天对象的国家',
    selectLanguage: '选择语言',
    chatTitle: '聊天窗口',
    chatSubtitle: '输入消息时我们会检查文化礼仪',
    inputPlaceholder: '请输入您的消息...',
    sendButton: '发送',
    analyzing: '分析中...',
    translating: '翻译中...',
    culturalCheck: '文化标准进行礼仪检查',
    mannerGood: '👍 礼仪良好！文化上合适的表达',
    translateMessage: '翻译消息',
    originalMessage: '原文',
    translatedMessage: '翻译文',
    sendButtonText: '发送',
    cancelButtonText: '取消',
    analyzingMessage: '翻译和礼仪分析中...',
    modeSelection: '模式选择',
    chatMode: '💬 聊天模式',
    translateMode: '🌐 翻译模式',
    suggestion: '建议',
  },
  de: {
    title: 'CultureChat',
    subtitle: 'Kulturell rücksichtsvoller internationaler Chat-Service',
    selectCountry: 'Wählen Sie das Land Ihres Chat-Partners',
    selectLanguage: 'Sprache auswählen',
    chatTitle: 'Chat-Fenster',
    chatSubtitle: 'Wir prüfen kulturelle Manieren, wenn Sie eine Nachricht eingeben',
    inputPlaceholder: 'Geben Sie Ihre Nachricht ein...',
    sendButton: 'Senden',
    analyzing: 'Analysiere...',
    translating: 'Übersetze...',
    culturalCheck: 'kulturelle Standards für Manieren-Prüfung',
    mannerGood: '👍 Gute Manieren! Kulturell angemessener Ausdruck',
    translateMessage: 'Nachricht übersetzen',
    originalMessage: 'Original',
    translatedMessage: 'Übersetzung',
    sendButtonText: 'Senden',
    cancelButtonText: 'Abbrechen',
    analyzingMessage: 'Übersetzen und Manieren analysieren...',
    modeSelection: 'Modus auswählen',
    chatMode: '💬 Chat-Modus',
    translateMode: '🌐 Übersetzungs-Modus',
    suggestion: 'Vorschlag',
  },
  fr: {
    title: 'CultureChat',
    subtitle: 'Service de chat international culturellement attentionné',
    selectCountry: 'Sélectionnez le pays de votre partenaire de chat',
    selectLanguage: 'Sélectionner la langue',
    chatTitle: 'Fenêtre de chat',
    chatSubtitle: 'Nous vérifierons les bonnes manières culturelles lorsque vous tapez un message',
    inputPlaceholder: 'Tapez votre message...',
    sendButton: 'Envoyer',
    analyzing: 'Analyse...',
    translating: 'Traduction...',
    culturalCheck: 'normes culturelles pour la vérification des manières',
    mannerGood: '👍 Bonnes manières ! Expression culturellement appropriée',
    translateMessage: 'Traduire le message',
    originalMessage: 'Original',
    translatedMessage: 'Traduction',
    sendButtonText: 'Envoyer',
    cancelButtonText: 'Annuler',
    analyzingMessage: 'Traduction et analyse des manières...',
    modeSelection: 'Sélection du mode',
    chatMode: '💬 Mode Chat',
    translateMode: '🌐 Mode Traduction',
    suggestion: 'Suggestion',
  },
  it: {
    title: 'CultureChat',
    subtitle: 'Servizio di chat internazionale culturalmente attento',
    selectCountry: 'Seleziona il paese del tuo partner di chat',
    selectLanguage: 'Seleziona Lingua',
    chatTitle: 'Finestra Chat',
    chatSubtitle: 'Controlleremo le buone maniere culturali quando digiti un messaggio',
    inputPlaceholder: 'Digita il tuo messaggio...',
    sendButton: 'Invia',
    analyzing: 'Analizzando...',
    translating: 'Traducendo...',
    culturalCheck: 'standard culturali per il controllo delle maniere',
    mannerGood: '👍 Buone maniere! Espressione culturalmente appropriata',
    translateMessage: 'Traduci Messaggio',
    originalMessage: 'Originale',
    translatedMessage: 'Traduzione',
    sendButtonText: 'Invia',
    cancelButtonText: 'Annulla',
    analyzingMessage: 'Traduzione e analisi delle maniere...',
    modeSelection: 'Selezione Modalità',
    chatMode: '💬 Modalità Chat',
    translateMode: '🌐 Modalità Traduzione',
    suggestion: 'Suggerimento',
  },
  ru: {
    title: 'CultureChat',
    subtitle: 'Культурно внимательный международный чат-сервис',
    selectCountry: 'Выберите страну вашего собеседника',
    selectLanguage: 'Выбрать язык',
    chatTitle: 'Окно чата',
    chatSubtitle: 'Мы проверим культурные манеры, когда вы наберете сообщение',
    inputPlaceholder: 'Введите ваше сообщение...',
    sendButton: 'Отправить',
    analyzing: 'Анализируем...',
    translating: 'Переводим...',
    culturalCheck: 'культурные стандарты для проверки манер',
    mannerGood: '👍 Хорошие манеры! Культурно подходящее выражение',
    translateMessage: 'Перевести сообщение',
    originalMessage: 'Оригинал',
    translatedMessage: 'Перевод',
    sendButtonText: 'Отправить',
    cancelButtonText: 'Отмена',
    analyzingMessage: 'Перевод и анализ манер...',
    modeSelection: 'Выбор режима',
    chatMode: '💬 Режим чата',
    translateMode: '🌐 Режим перевода',
    suggestion: 'Предложение',
  },
  hi: {
    title: 'CultureChat',
    subtitle: 'सांस्कृतिक रूप से विचारशील अंतर्राष्ट्रीय चैट सेवा',
    selectCountry: 'अपने चैट पार्टनर का देश चुनें',
    selectLanguage: 'भाषा चुनें',
    chatTitle: 'चैट विंडो',
    chatSubtitle: 'जब आप संदेश टाइप करेंगे तो हम सांस्कृतिक शिष्टाचार की जांच करेंगे',
    inputPlaceholder: 'अपना संदेश टाइप करें...',
    sendButton: 'भेजें',
    analyzing: 'विश्लेषण कर रहे हैं...',
    translating: 'अनुवाद कर रहे हैं...',
    culturalCheck: 'शिष्टाचार जांच के लिए सांस्कृतिक मानक',
    mannerGood: '👍 अच्छे शिष्टाचार! सांस्कृतिक रूप से उपयुक्त अभिव्यक्ति',
    translateMessage: 'संदेश का अनुवाद करें',
    originalMessage: 'मूल',
    translatedMessage: 'अनुवाद',
    sendButtonText: 'भेजें',
    cancelButtonText: 'रद्द करें',
    analyzingMessage: 'अनुवाद और शिष्टाचार विश्लेषण...',
    modeSelection: 'मोड चयन',
    chatMode: '💬 चैट मोड',
    translateMode: '🌐 अनुवाद मोड',
    suggestion: 'सुझाव',
  },
  pt: {
    title: 'CultureChat',
    subtitle: 'Serviço de chat internacional culturalmente atencioso',
    selectCountry: 'Selecione o país do seu parceiro de chat',
    selectLanguage: 'Selecionar Idioma',
    chatTitle: 'Janela de Chat',
    chatSubtitle: 'Verificaremos as boas maneiras culturais quando você digitar uma mensagem',
    inputPlaceholder: 'Digite sua mensagem...',
    sendButton: 'Enviar',
    analyzing: 'Analisando...',
    translating: 'Traduzindo...',
    culturalCheck: 'padrões culturais para verificação de maneiras',
    mannerGood: '👍 Boas maneiras! Expressão culturalmente apropriada',
    translateMessage: 'Traduzir Mensagem',
    originalMessage: 'Original',
    translatedMessage: 'Tradução',
    sendButtonText: 'Enviar',
    cancelButtonText: 'Cancelar',
    analyzingMessage: 'Traduzindo e analisando maneiras...',
    modeSelection: 'Seleção de Modo',
    chatMode: '💬 Modo Chat',
    translateMode: '🌐 Modo Tradução',
    suggestion: 'Sugestão',
  },
}

export function getTranslation(language: Language, key: string, variables?: Record<string, string | number>): string {
  const keys = key.split('.')
  let value: any = translations[language] || translations.ko
  
  for (const k of keys) {
    value = value?.[k]
    if (value === undefined) break
  }
  
  if (value === undefined) {
    // fallback to Korean
    value = translations.ko
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) break
    }
  }
  
  let result = value || key
  
  // 템플릿 변수 처리
  if (variables && typeof result === 'string') {
    Object.entries(variables).forEach(([varKey, varValue]) => {
      result = result.replace(new RegExp(`{{${varKey}}}`, 'g'), String(varValue))
    })
  }
  
  return result
}