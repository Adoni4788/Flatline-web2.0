
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  source?: string; // Security company source
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number; // minutes
  modules: number;
  image: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  orderNumber: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  type: 'single_choice' | 'multiple_choice';
  points: number;
  options: QuestionOption[];
  explanation?: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  type: 'content' | 'quiz';
  content?: string; // HTML/Markdown
  orderNumber: number;
  // Quiz specific
  questions?: Question[];
  passingScore?: number;
  timeLimit?: number;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number; // 0 - 100
  completedLessons: string[]; // array of lesson IDs
  status: 'active' | 'completed';
}
