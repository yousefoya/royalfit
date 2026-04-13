import {
  UserRole,
  User,
  Message,
  ScheduleStatus,
  NutritionTemplate,
  NutritionGoal
} from './types';


const getFutureDate = (months: number) => {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
};

const getPastDate = (months: number) => {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString();
};

const getDaysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};


export const MOCK_USERS: User[] = [
  { id: '1', name: 'أحمد المدير', role: UserRole.ADMIN, phone: '0790000000', avatar: 'https://picsum.photos/id/1005/200/200' },
  
  { id: '2', name: 'كوتش سارة', role: UserRole.TRAINER, phone: '0791234567', avatar: 'https://picsum.photos/id/1011/200/200' },
  
  { id: '3', name: 'محمد المشترك', role: UserRole.MEMBER, phone: '0771234567', avatar: 'https://picsum.photos/id/1012/200/200', trainerId: '2', subscriptionEndDate: getFutureDate(1), scheduleStatus: ScheduleStatus.COMPLETED, scheduleLastUpdated: getDaysAgo(5) },
  
  { id: '4', name: 'خالد المشترك', role: UserRole.MEMBER, phone: '0781234567', avatar: 'https://picsum.photos/id/1013/200/200', trainerId: '2', subscriptionEndDate: getPastDate(1), scheduleStatus: ScheduleStatus.NEED_UPDATE, scheduleLastUpdated: getDaysAgo(25) },
  
  { id: '5', name: 'رامي الجديد', role: UserRole.MEMBER, phone: '0799999999', avatar: 'https://picsum.photos/id/1014/200/200', trainerId: '2', subscriptionEndDate: getFutureDate(2), scheduleStatus: ScheduleStatus.PENDING }
];


export const WORKOUT_DB: Record<string, string[]> = {
  'عضلات الظهر': [
    'سحب أمامي واسع', 'سحب أمامي واسع عكسي', 'سحب ضيق قبضة ضيقة', 'سحب جالس قبضة ضيقة', 'سحب جالس قبضة واسعة',
    'سحب منشار ضيق', 'سحب منشار واسع', 'سحب همر عكسي', 'سحب همر أمامي', 'جهاز رقم (7) همر', 'جهاز رقم (7) أمامي',
    'جهاز رقم (7) عكسي', 'جهاز رقم (6) ضيق', 'جهاز رقم (6) واسع', 'كابل منحنى واسع', 'واسع TBAR', 'ضيق TBAR',
    'منشار دامبلز', 'أوفر لاس', 'بار أمامي منحني', 'بار عكسي منحني'
  ],

  'عضلات الصدر': [
    'جهاز رقم (1) علوي', 'جهاز رقم (1) ضيق', 'جهاز رقم (1) سفلي', 'جهاز رقم (2)', 'جهاز رقم (3) علوي', 'جهاز رقم (3) سفلي',
    'كابل تجميع مستوي', 'كابل تجميع علوي', 'كابل تجميع سفلي', 'همر علوي', 'همر سفلي', 'همر مستوي', 'بار مستوي',
    'بار علوي', 'بار سفلي', 'Smith علوي', 'Smith مستوي', 'Smith سفلي', 'ضغط دامبلز مستوي', 'ضغط دامبلز علوي',
    'ضغط دامبلز سفلي', 'متوازي', 'فتح دامبلز علوي', 'فتح دامبلز مستوي'
  ],

  'عضلات الأكتاف': [
    'همر جانبي', 'جهاز أكتاف ضيق', 'جهاز أكتاف واسع', 'فلاي دامبلز جانبي', 'تبادل دامبلز أمامي',
    'جهاز (2) خلفي قبضة سفلية', 'جهاز (2) خلفي', 'حبل خلفي كابل', 'فلاي جانبي كابل', 'حبل كابل أمامي',
    'ترابيس دامبلز', 'ترابيس بار', 'ترابيس كابل', 'ضغط جانبي جالس', 'أرنولد جالس', 'أمامي بار', 'ضغط أمامي جالس',
    'منحني دامبلز خلفي', 'أمامي Smith'
  ],

  'عضلات الأرجل': [
    'جهاز رقم (9)', 'جهاز رقم (10)', 'جهاز رقم (8)', 'جهاز iner + outer', 'جهاز دفع خلفي', 'جهاز رقم (13)',
    'Hack squat', 'همر دفع', 'همر بطات', 'سكوات Smith', 'سكوات دامبلز', 'طعن دامبلز', 'Hamstring BAR',
    'SOMOSQUAT', 'Hipthrust BAR', 'Bulgarian دامبلز', 'Romanian Deadlift', 'Stiff Leg Deadlift'
  ],

  'عضلات البايسيبس': [
    'همر جالس واسع', 'لاري سكوت بار', 'تبادل دامبلز', 'همر دامبلز', 'كابل حبل داخلي', 'كابل حبل خارجي',
    'كابل مسكة (V)', 'كابل مسطرة واسع', 'كابل مسطرة ضيق', 'تبادل دامبلز بنش 45 درجة', 'بار أولمبي',
    'بار أعوج ضيق واقف', 'بار مستقيم واسع واقف', 'كابل قبضة فردي', 'تكوير دامبلز', 'بار ثلاث سبعات'
  ],

  'عضلات الترايسيبس': [
    'كابل مستقيم ضيق', 'كابل مستقيم واسع', 'كابل مستقيم مسكة (V)', 'كابل حبل داخلي', 'كابل حبل خارجي',
    'كابل فردي', 'كابل فردي عكسي', 'كابل خلفي', 'دامبلز زوجي خلف الرأس', 'دامبلز فردي خلف الرأس',
    'Kickback Dumbles', 'Kickback Cable', 'همر زوجي نائم', 'بار خلف الرأس'
  ],

  'عضلات المعدة': [
    'كرانش (Crunches)', 'رفع أرجل (Leg Raises)', 'بلانك (Plank)', 'عجلة (Ab Wheel)', 'تويست روسي (Russian Twist)'
  ],

'كارديو وإحماء': [
    'Treadmill', 'Cross', 'Bicycle', 'Steps', 'High knee', 'Jumping jacks', 
    'Burpee', 'Battle rope', 'Box jumps', 'Throw the ball'
  ]
};


export const MUSCLE_IMAGES: Record<string, string> = {
  'عضلات الصدر': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop',

  'عضلات الظهر': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438',

  'عضلات الأرجل': 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?q=80&w=1470&auto=format&fit=crop',

  'عضلات الأكتاف': 'https://images.unsplash.com/photo-1517964603305-11c0f6f66012',

  'عضلات البايسيبس': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop',

  'عضلات الترايسيبس': 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?q=80&w=1470&auto=format&fit=crop',

  'عضلات المعدة': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop',

  'كارديو وإحماء': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop'
};
// ===== NUTRITION TEMPLATES =====

export const NUTRITION_TEMPLATES: NutritionTemplate[] = [
  {
    id: 'bulk-pro',
    name: 'نظام التضخيم الاحترافي',
    description: 'سعرات عالية مع تركيز على البروتين',
    goal: NutritionGoal.BULK,
    meals: [
      {
        id: 'bulk-b1',
        time: '08:00 صباحاً',
        name: 'الإفطار',
        ingredients: [
          { name: 'بيض', amount: '4 بياض + 1 كامل' },
          { name: 'شوفان', amount: '100g' }
        ],
        calories: 750,
        protein: 35,
        carbs: 60,
        fats: 15
      },
      {
        id: 'bulk-l1',
        time: '02:00 مساءً',
        name: 'الغداء',
        ingredients: [
          { name: 'صدر دجاج', amount: '200g' },
          { name: 'أرز', amount: 'كوب' }
        ],
        calories: 1200,
        protein: 50,
        carbs: 50,
        fats: 20
      },
      {
        id: 'bulk-d1',
        time: '08:00 مساءً',
        name: 'العشاء',
        ingredients: [
          { name: 'تونا', amount: 'علبة' },
          { name: 'توست أسمر', amount: '2' }
        ],
        calories: 1050,
        protein: 40,
        carbs: 30,
        fats: 10
      }
    ]
  }
];
