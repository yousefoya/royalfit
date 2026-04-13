// ================== USER & AUTH ==================
export enum UserRole {
  ADMIN = 'admin',
  TRAINER = 'trainer',
  MEMBER = 'member',
  RECEPTION = 'reception'
}


export enum ScheduleStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  NEED_UPDATE = 'need_update'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  avatar?: string;
  trainerId?: string;
  subscriptionEndDate?: string;
  scheduleStatus?: ScheduleStatus;
  scheduleLastUpdated?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Date;
}
export interface Exercise {
  name: string;
  sets: number | string;
  reps: number | string;
  rest: string;
  notes?: string;
}
// ================== NUTRITION ==================

/** هدف النظام الغذائي */
export enum NutritionGoal {
  GAIN = 'GAIN',
  BULK = 'BULK',
  FAT_LOSS = 'FAT_LOSS'
}

/** مكوّن الوجبة */
export interface Ingredient {
  name: string;      // مثال: بيض
  amount: string;    // مثال: 3 حبات / 100g
}

/** وجبة واحدة */
export interface Meal {
  id: string;
  time: string;       // 08:00 صباحًا
  name: string;       // الإفطار
  ingredients: Ingredient[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

/** نموذج تغذية كامل (بدل أيام الأسبوع) */
export interface NutritionTemplate {
  id: string;
  name: string;            // Gain Weight / Bulking / Fat Loss
  goal: NutritionGoal;
  description: string;
  meals: Meal[];

  // اختياري – للعرض السريع
  totalCalories?: number;
  totalProtein?: number;
  totalCarbs?: number;
  totalFats?: number;
}

// ================== CHALLENGES ==================

export enum ChallengeType {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  TEXT = 'TEXT'
}

export interface Challenge {
  id: string;

  title: string;
  description: string;
  type: ChallengeType;

  durationDays: number;   // من DB: duration_days
  totalPoints: number;    // من DB: total_points
  pointsPerDay: number;   // محسوبة أو راجعة من API

  startDate: string;      // YYYY-MM-DD
  status: 'ACTIVE' | 'INACTIVE';

  participantsCount: number; // COUNT من DB (أو 0)
}



export enum SubmissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface Submission {
  id: string;
  user_id: string;
  userName: string;

  challenge_id: string;
  challengeTitle: string;
  challengeType: ChallengeType;

  day: number;

  video_url: string;

  status: SubmissionStatus;
  submitted_at: string;
}

// ================== CHALLENGE PROGRESS ==================

export interface DailyChallengeProgress {
  day: number;                 // 1 → durationDays
  submitted: boolean;
  submissionId?: string;
  pointsEarned: number;
  submittedAt?: string;
}

export interface ChallengeProgress {
  challengeId: string;
  userId: string;

  currentDay: number;
  days: DailyChallengeProgress[];

  totalPointsEarned: number;
  completed: boolean;
}
// ================== ANALYTICS DASHBOARD ==================

export interface Member {
  id: string;
  name: string;
  initial: string;
}

export interface TrainerStats {
  id: string;
  name: string;
  memberCount: number;
  rating: number;
  specialty?: string;
  status: 'نشط' | 'غير نشط';
  members: Member[];
}

export interface MonthlyData {
  month: string;
  count: number;
}

export interface GymStats {
  activeUsers: number;
  registeredUsers: number;
  totalMembers: number;
  revenue?: number;
  registrationAnalysis: {
    lastMonth: number;
    thisMonth: number;
    percentageChange: number;
    history: MonthlyData[];
  };
}

export interface AttendanceData {
  day: string;
  count: number;
}

export interface MembershipDistribution {
  name: string;
  value: number;
}
