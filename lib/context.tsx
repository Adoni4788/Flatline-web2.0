import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Course, Module, Lesson, Enrollment, LiveSession, Exam, ExamAttempt } from './types';
import { COURSES, MODULES, LESSONS, MOCK_USER, MOCK_ADMIN } from './mockData';

// Extended initial state
const INITIAL_USERS: User[] = [
  MOCK_USER,
  MOCK_ADMIN,
  { id: 'u2', firstName: 'Sarah', lastName: 'Connor', email: 'sarah@resistance.net', role: 'user', status: 'active', source: 'Hawk Eye Security' },
  { id: 'u3', firstName: 'Jason', lastName: 'Bourne', email: 'jason@treadstone.cia', role: 'user', status: 'inactive', source: 'Guardsman Security' },
];

const INITIAL_ENROLLMENTS: Enrollment[] = [
  { userId: 'u1', courseId: 'c1', progress: 35, completedLessons: ['l1'], status: 'active', id: 'e1' },
  { userId: 'u2', courseId: 'c2', progress: 75, completedLessons: [], status: 'active', id: 'e2' },
  { userId: 'u1', courseId: 'c3', progress: 100, completedLessons: [], status: 'completed', id: 'e3' },
];

interface DataContextType {
  users: User[];
  courses: Course[];
  modules: Module[];
  lessons: Lesson[];
  enrollments: Enrollment[];
  liveSessions: LiveSession[];
  exams: Exam[];
  examAttempts: ExamAttempt[];
  currentUser: User | null;
  // User Actions
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'status'>) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  // Course Actions
  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (id: string, data: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  // Module Actions
  addModule: (module: Omit<Module, 'id'>) => void;
  updateModule: (id: string, data: Partial<Module>) => void;
  deleteModule: (id: string) => void;
  // Lesson Actions
  addLesson: (lesson: Omit<Lesson, 'id'>) => void;
  updateLesson: (id: string, data: Partial<Lesson>) => void;
  deleteLesson: (id: string) => void;
  // Enrollment Actions
  enrollUser: (userId: string, courseId: string) => void;
  updateProgress: (userId: string, lessonId: string, courseId: string) => void;
  getCourseProgress: (userId: string, courseId: string) => number;
  // Live Session Actions
  addLiveSession: (session: Omit<LiveSession, 'id' | 'createdAt'>) => void;
  updateLiveSession: (id: string, data: Partial<LiveSession>) => void;
  deleteLiveSession: (id: string) => void;
  // Exam Actions
  addExam: (exam: Omit<Exam, 'id' | 'createdAt'>) => void;
  updateExam: (id: string, data: Partial<Exam>) => void;
  deleteExam: (id: string) => void;
  startExamAttempt: (examId: string, userId: string) => string; // Returns attemptId
  submitExamAttempt: (attemptId: string, answers: Record<string, string[]>) => void;
  getExamAttempts: (userId: string) => ExamAttempt[];
  getExamAttempt: (attemptId: string) => ExamAttempt | undefined;
}

const DataContext = createContext<DataContextType>(null!);

// Fix: Make children optional to resolve TS error
export const DataProvider = ({ children }: { children?: React.ReactNode }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [courses, setCourses] = useState<Course[]>(COURSES);
  const [modules, setModules] = useState<Module[]>(MODULES);
  const [lessons, setLessons] = useState<Lesson[]>(LESSONS);
  const [enrollments, setEnrollments] = useState<Enrollment[]>(INITIAL_ENROLLMENTS);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Restore session
  useEffect(() => {
    const stored = localStorage.getItem('flatline_user');
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  }, []);

  const login = async (email: string) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('flatline_user', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('flatline_user');
  };

  const addUser = (userData: Omit<User, 'id' | 'status'>) => {
    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      status: 'active'
    };
    setUsers([...users, newUser]);
  };

  const updateUser = (id: string, data: Partial<User>) => {
    setUsers(users.map(u => u.id === id ? { ...u, ...data } : u));
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    // Also delete user's enrollments
    setEnrollments(enrollments.filter(e => e.userId !== id));
  };

  const addCourse = (courseData: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      ...courseData,
      id: Math.random().toString(36).substr(2, 9)
    };
    setCourses([...courses, newCourse]);
  };

  const updateCourse = (id: string, data: Partial<Course>) => {
    setCourses(courses.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
    // Also delete associated modules, lessons, and enrollments
    const courseModules = modules.filter(m => m.courseId === id);
    const moduleIds = courseModules.map(m => m.id);
    setModules(modules.filter(m => m.courseId !== id));
    setLessons(lessons.filter(l => !moduleIds.includes(l.moduleId)));
    setEnrollments(enrollments.filter(e => e.courseId !== id));
  };

  const addModule = (moduleData: Omit<Module, 'id'>) => {
    const newModule: Module = {
      ...moduleData,
      id: Math.random().toString(36).substr(2, 9)
    };
    setModules([...modules, newModule]);
    // Update course modules count
    const courseModules = modules.filter(m => m.courseId === moduleData.courseId);
    updateCourse(moduleData.courseId, { modules: courseModules.length + 1 });
  };

  const updateModule = (id: string, data: Partial<Module>) => {
    setModules(modules.map(m => m.id === id ? { ...m, ...data } : m));
  };

  const deleteModule = (id: string) => {
    const module = modules.find(m => m.id === id);
    if (module) {
      setModules(modules.filter(m => m.id !== id));
      setLessons(lessons.filter(l => l.moduleId !== id));
      // Update course modules count
      const courseModules = modules.filter(m => m.courseId === module.courseId && m.id !== id);
      updateCourse(module.courseId, { modules: courseModules.length });
    }
  };

  const addLesson = (lessonData: Omit<Lesson, 'id'>) => {
    const newLesson: Lesson = {
      ...lessonData,
      id: Math.random().toString(36).substr(2, 9)
    };
    setLessons([...lessons, newLesson]);
  };

  const updateLesson = (id: string, data: Partial<Lesson>) => {
    setLessons(lessons.map(l => l.id === id ? { ...l, ...data } : l));
  };

  const deleteLesson = (id: string) => {
    setLessons(lessons.filter(l => l.id !== id));
    // Remove from completed lessons in enrollments
    setEnrollments(enrollments.map(e => ({
      ...e,
      completedLessons: e.completedLessons.filter(lessonId => lessonId !== id)
    })));
  };

  const enrollUser = (userId: string, courseId: string) => {
    if (enrollments.some(e => e.userId === userId && e.courseId === courseId)) return;
    const newEnrollment: Enrollment = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      courseId,
      progress: 0,
      completedLessons: [],
      status: 'active'
    };
    setEnrollments([...enrollments, newEnrollment]);
  };

  const updateProgress = (userId: string, lessonId: string, courseId: string) => {
    setEnrollments(prev => prev.map(e => {
      if (e.userId === userId && e.courseId === courseId) {
        if (e.completedLessons.includes(lessonId)) return e;
        
        const newCompleted = [...e.completedLessons, lessonId];
        // Calculate simplistic progress
        const courseModules = modules.filter(m => m.courseId === courseId);
        const moduleIds = courseModules.map(m => m.id);
        const totalLessons = lessons.filter(l => moduleIds.includes(l.moduleId)).length;
        const newProgress = Math.round((newCompleted.length / totalLessons) * 100);
        
        return {
          ...e,
          completedLessons: newCompleted,
          progress: newProgress,
          status: newProgress === 100 ? 'completed' : 'active'
        };
      }
      return e;
    }));
  };

  const getCourseProgress = (userId: string, courseId: string) => {
    const enrollment = enrollments.find(e => e.userId === userId && e.courseId === courseId);
    return enrollment ? enrollment.progress : 0;
  };

  // Live Session Actions
  const addLiveSession = (sessionData: Omit<LiveSession, 'id' | 'createdAt'>) => {
    const newSession: LiveSession = {
      ...sessionData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    setLiveSessions(prev => [...prev, newSession]);
  };

  const updateLiveSession = (id: string, data: Partial<LiveSession>) => {
    setLiveSessions(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const deleteLiveSession = (id: string) => {
    setLiveSessions(prev => prev.filter(s => s.id !== id));
  };

  // Exam Actions
  const addExam = (examData: Omit<Exam, 'id' | 'createdAt'>) => {
    const newExam: Exam = {
      ...examData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    setExams(prev => [...prev, newExam]);
  };

  const updateExam = (id: string, data: Partial<Exam>) => {
    setExams(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  };

  const deleteExam = (id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
    setExamAttempts(prev => prev.filter(a => a.examId !== id));
  };

  const startExamAttempt = (examId: string, userId: string): string => {
    const exam = exams.find(e => e.id === examId);
    if (!exam) throw new Error('Exam not found');

    const existingAttempts = examAttempts.filter(a => a.examId === examId && a.userId === userId);
    if (existingAttempts.length >= exam.maxAttempts) {
      throw new Error('Maximum attempts reached');
    }

    const attemptId = Math.random().toString(36).substr(2, 9);
    const newAttempt: ExamAttempt = {
      id: attemptId,
      examId,
      userId,
      startedAt: new Date().toISOString(),
      answers: {},
      status: 'in_progress'
    };
    setExamAttempts(prev => [...prev, newAttempt]);
    return attemptId;
  };

  const submitExamAttempt = (attemptId: string, answers: Record<string, string[]>) => {
    const attempt = examAttempts.find(a => a.id === attemptId);
    if (!attempt) return;

    const exam = exams.find(e => e.id === attempt.examId);
    if (!exam) return;

    let score = 0;
    let totalPoints = 0;

    exam.questions.forEach(question => {
      totalPoints += question.points;
      const userAnswers = answers[question.id] || [];
      const correctAnswers = question.options.filter(opt => opt.isCorrect).map(opt => opt.id);

      if (question.type === 'single_choice') {
        if (userAnswers.length === 1 && correctAnswers.includes(userAnswers[0])) {
          score += question.points;
        }
      } else {
        const isCorrect =
          userAnswers.length === correctAnswers.length &&
          userAnswers.every(ans => correctAnswers.includes(ans));
        if (isCorrect) {
          score += question.points;
        }
      }
    });

    const percentage = Math.round((score / totalPoints) * 100);
    const passed = percentage >= exam.passingScore;

    setExamAttempts(prev => prev.map(a => 
      a.id === attemptId 
        ? { ...a, submittedAt: new Date().toISOString(), answers, score: percentage, passed, status: 'submitted' }
        : a
    ));
  };

  const getExamAttempts = (userId: string) => {
    return examAttempts.filter(a => a.userId === userId);
  };

  const getExamAttempt = (attemptId: string) => {
    return examAttempts.find(a => a.id === attemptId);
  };

  return (
    <DataContext.Provider value={{
      users, courses, modules, lessons, enrollments, liveSessions, exams, examAttempts, currentUser,
      login, logout,
      addUser, updateUser, deleteUser,
      addCourse, updateCourse, deleteCourse,
      addModule, updateModule, deleteModule,
      addLesson, updateLesson, deleteLesson,
      enrollUser, updateProgress, getCourseProgress,
      addLiveSession, updateLiveSession, deleteLiveSession,
      addExam, updateExam, deleteExam, startExamAttempt, submitExamAttempt, getExamAttempts, getExamAttempt
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);