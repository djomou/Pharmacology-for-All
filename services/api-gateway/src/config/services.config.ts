export interface ServiceConfig {
  name: string; url: string; prefix: string; description: string; public: boolean;
}

export const SERVICES_CONFIG: ServiceConfig[] = [
  { name:'Auth Service',            url:process.env.AUTH_SERVICE_URL         ||'http://auth-service:3001',          prefix:'/api/auth',          description:'Authentification OAuth2 JWT',         public:true  },
  { name:'Drug Service',            url:process.env.DRUG_SERVICE_URL         ||'http://drug-service:3002',          prefix:'/api/drugs',         description:'Médicaments et présentations',        public:true  },
  { name:'Drug Service Molecules',  url:process.env.DRUG_SERVICE_URL         ||'http://drug-service:3002',          prefix:'/api/molecules',     description:'Substances actives',                  public:true  },
  { name:'Drug Service Companies',  url:process.env.DRUG_SERVICE_URL         ||'http://drug-service:3002',          prefix:'/api/companies',     description:'Laboratoires pharmaceutiques',        public:true  },
  { name:'Posology Service',        url:process.env.POSOLOGY_SERVICE_URL     ||'http://posology-service:3003',      prefix:'/api/posologies',    description:'Posologies et doses',                 public:true  },
  { name:'Interaction Service',     url:process.env.INTERACTION_SERVICE_URL  ||'http://interaction-service:3004',   prefix:'/api/interactions',  description:'Interactions médicamenteuses',        public:true  },
  { name:'Search Service',          url:process.env.SEARCH_SERVICE_URL       ||'http://search-service:3005',        prefix:'/api/search',        description:'Recherche full-text',                 public:true  },
  { name:'Indication Service',      url:process.env.INDICATION_SERVICE_URL   ||'http://indication-service:3006',    prefix:'/api/indications',   description:'Indications et CIM-10',               public:true  },
  { name:'Safety Service',          url:process.env.SAFETY_SERVICE_URL       ||'http://safety-service:3007',        prefix:'/api/safety',        description:'Effets indésirables et alertes',      public:true  },
  { name:'International Service',   url:process.env.INTERNATIONAL_SERVICE_URL||'http://international-service:3008', prefix:'/api/international', description:'Équivalences internationales',        public:true  },
  { name:'Document Service',        url:process.env.DOCUMENT_SERVICE_URL     ||'http://document-service:3009',      prefix:'/api/documents',     description:'Notices et images',                   public:true  },
  { name:'Patient Service',         url:process.env.PATIENT_SERVICE_URL      ||'http://patient-service:3010',       prefix:'/api/patients',      description:'Profils patients et ordonnances',     public:false },
  { name:'Notification Service',    url:process.env.NOTIFICATION_SERVICE_URL ||'http://notification-service:3011',  prefix:'/api/notifications', description:'Notifications et alertes',            public:false },
  { name:'Advisor Service',         url:process.env.ADVISOR_SERVICE_URL      ||'http://symptom-advisor-service:3012',prefix:'/api/advisor',      description:'Conseiller symptômes',                public:true  },
  { name:'Chat Service (IA)',       url:process.env.CHAT_SERVICE_URL         ||'http://chat-service:3013',          prefix:'/api/chat',          description:'MedocAssistant — IA Qwen2.5',         public:true  },
];
