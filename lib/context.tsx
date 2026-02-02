import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Course, Module, Lesson, Enrollment, LiveSession, Exam, ExamAttempt } from './types';
import { COURSES, MODULES, LESSONS, MOCK_USER, MOCK_ADMIN } from './mockData';
import { supabase } from './supabase';

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
  sessionChecked: boolean;
  // User Actions
  login: (email: string, password: string) => Promise<boolean>;
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

export const DataProvider = ({ children }: { children?: React.ReactNode }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>(INITIAL_ENROLLMENTS);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Load data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch courses
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: true });

        if (coursesError) throw coursesError;
        if (coursesData) {
          setCourses(coursesData.map((c: any) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            level: c.level,
            duration: c.duration,
            modules: c.modules,
            image: c.image
          })));
        }

        // Fetch modules
        const { data: modulesData, error: modulesError } = await supabase
          .from('modules')
          .select('*')
          .order('order_number', { ascending: true });

        if (modulesError) throw modulesError;
        if (modulesData) {
          setModules(modulesData.map((m: any) => ({
            id: m.id,
            courseId: m.course_id,
            title: m.title,
            description: m.description,
            orderNumber: m.order_number
          })));
        }

        // Fetch lessons
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .order('order_number', { ascending: true });

        if (lessonsError) throw lessonsError;
        if (lessonsData) {
          setLessons(lessonsData.map((l: any) => ({
            id: l.id,
            moduleId: l.module_id,
            title: l.title,
            type: l.type,
            orderNumber: l.order_number,
            content: l.content,
            videoUrl: l.video_url,
            passingScore: l.passing_score,
            questions: l.questions
          })));
        }

        // Fetch enrollments
        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select('*')
          .order('enrolled_at', { ascending: false });

        if (enrollmentsError) throw enrollmentsError;
        if (enrollmentsData) {
          setEnrollments(enrollmentsData.map((e: any) => ({
            id: e.id,
            userId: e.user_id,
            courseId: e.course_id,
            progress: e.progress,
            completedLessons: e.completed_lessons || [],
            status: e.status
          })));
        }

        console.log('✅ Data loaded from Supabase:', {
          courses: coursesData?.length,
          modules: modulesData?.length,
          lessons: lessonsData?.length,
          enrollments: enrollmentsData?.length
        });
      } catch (error) {
        console.error('Error loading data from Supabase:', error);
        // Fallback to mock data if Supabase fails
        setCourses(COURSES);
        setModules(MODULES);
        setLessons(LESSONS);
      }
    };

    loadData();
  }, []);

  // Restore session from localStorage (temporary - will use Supabase Auth later)
  useEffect(() => {
    const stored = localStorage.getItem('flatline_user');
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
    // Mark session as checked even if no user found
    setSessionChecked(true);
  }, []);

  // Login function - now uses Supabase Auth with password
  const login = async (email: string, password: string) => {
    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password
      });

      if (authError || !authData.user) {
        console.error('Auth error:', authError);
        return false;
      }

      // Get user profile from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .eq('status', 'active')
        .single();

      if (userError || !userData) {
        console.error('User profile error:', userError);
        // Sign out if we can't find the user profile
        await supabase.auth.signOut();
        return false;
      }

      // Map database user to app user
      const user: User = {
        id: userData.id,
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: userData.email,
        role: userData.role,
        status: userData.status,
        source: userData.source
      };

      setCurrentUser(user);
      localStorage.setItem('flatline_user', JSON.stringify(user));
      return true;
    } catch (err) {
      console.error('Login exception:', err);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('flatline_user');
  };

  const addUser = async (userData: Omit<User, 'id' | 'status'>, userId: string) => {
    try {
      // Create user profile in users table with provided ID (from Supabase Auth)
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: userId,
          first_name: userData.firstName,
          last_name: userData.lastName,
          email: userData.email,
          role: userData.role,
          status: 'active',
          source: userData.source || 'Direct'
        }]);

      if (profileError) throw profileError;

      const newUser: User = {
        id: userId,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
        status: 'active',
        source: userData.source || 'Direct'
      };

      setUsers([...users, newUser]);
      console.log('✅ User profile created:', userData.email);
      return newUser;
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  };

  const updateUser = (id: string, data: Partial<User>) => {
    setUsers(users.map(u => u.id === id ? { ...u, ...data } : u));
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    // Also delete user's enrollments
    setEnrollments(enrollments.filter(e => e.userId !== id));
  };

  const addCourse = async (courseData: Omit<Course, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert([{
          title: courseData.title,
          description: courseData.description,
          level: courseData.level,
          duration: courseData.duration,
          modules: courseData.modules,
          image: courseData.image
        }])
        .select()
        .single();

      if (error) throw error;

      // Map response to Course type
      const newCourse: Course = {
        id: data.id,
        title: data.title,
        description: data.description,
        level: data.level,
        duration: data.duration,
        modules: data.modules,
        image: data.image
      };

      setCourses([...courses, newCourse]);
      console.log('✅ Course added:', newCourse.title);
    } catch (error) {
      console.error('Error adding course:', error);
      throw error;
    }
  };

  const updateCourse = async (id: string, data: Partial<Course>) => {
    try {
      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.level !== undefined) updateData.level = data.level;
      if (data.duration !== undefined) updateData.duration = data.duration;
      if (data.modules !== undefined) updateData.modules = data.modules;
      if (data.image !== undefined) updateData.image = data.image;

      const { error } = await supabase
        .from('courses')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setCourses(courses.map(c => c.id === id ? { ...c, ...data } : c));
      console.log('✅ Course updated');
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      // Delete associated lessons first
      const courseModules = modules.filter(m => m.courseId === id);
      const moduleIds = courseModules.map(m => m.id);

      if (moduleIds.length > 0) {
        await supabase.from('lessons').delete().in('module_id', moduleIds);
      }

      // Delete associated modules
      await supabase.from('modules').delete().eq('course_id', id);

      // Delete the course
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;

      // Update local state
      setCourses(courses.filter(c => c.id !== id));
      setModules(modules.filter(m => m.courseId !== id));
      setLessons(lessons.filter(l => !moduleIds.includes(l.moduleId)));
      setEnrollments(enrollments.filter(e => e.courseId !== id));

      console.log('✅ Course deleted');
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  };

  const addModule = async (moduleData: Omit<Module, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('modules')
        .insert([{
          course_id: moduleData.courseId,
          title: moduleData.title,
          description: moduleData.description,
          order_number: moduleData.orderNumber
        }])
        .select()
        .single();

      if (error) throw error;

      const newModule: Module = {
        id: data.id,
        courseId: data.course_id,
        title: data.title,
        description: data.description,
        orderNumber: data.order_number
      };

      setModules([...modules, newModule]);

      // Update course modules count
      const courseModules = modules.filter(m => m.courseId === moduleData.courseId);
      await updateCourse(moduleData.courseId, { modules: courseModules.length + 1 });

      console.log('✅ Module added:', newModule.title);
    } catch (error) {
      console.error('Error adding module:', error);
      throw error;
    }
  };

  const updateModule = async (id: string, data: Partial<Module>) => {
    try {
      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.orderNumber !== undefined) updateData.order_number = data.orderNumber;
      if (data.courseId !== undefined) updateData.course_id = data.courseId;

      const { error } = await supabase
        .from('modules')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setModules(modules.map(m => m.id === id ? { ...m, ...data } : m));
      console.log('✅ Module updated');
    } catch (error) {
      console.error('Error updating module:', error);
      throw error;
    }
  };

  const deleteModule = async (id: string) => {
    try {
      const module = modules.find(m => m.id === id);
      if (!module) return;

      // Delete associated lessons
      await supabase.from('lessons').delete().eq('module_id', id);

      // Delete the module
      const { error } = await supabase.from('modules').delete().eq('id', id);
      if (error) throw error;

      // Update local state
      setModules(modules.filter(m => m.id !== id));
      setLessons(lessons.filter(l => l.moduleId !== id));

      // Update course modules count
      const courseModules = modules.filter(m => m.courseId === module.courseId && m.id !== id);
      await updateCourse(module.courseId, { modules: courseModules.length });

      console.log('✅ Module deleted');
    } catch (error) {
      console.error('Error deleting module:', error);
      throw error;
    }
  };

  const addLesson = async (lessonData: Omit<Lesson, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .insert([{
          module_id: lessonData.moduleId,
          title: lessonData.title,
          type: lessonData.type,
          order_number: lessonData.orderNumber,
          content: lessonData.content,
          video_url: lessonData.videoUrl,
          passing_score: lessonData.passingScore,
          questions: lessonData.questions
        }])
        .select()
        .single();

      if (error) throw error;

      const newLesson: Lesson = {
        id: data.id,
        moduleId: data.module_id,
        title: data.title,
        type: data.type,
        orderNumber: data.order_number,
        content: data.content,
        videoUrl: data.video_url,
        passingScore: data.passing_score,
        questions: data.questions
      };

      setLessons([...lessons, newLesson]);
      console.log('✅ Lesson added:', newLesson.title);
    } catch (error) {
      console.error('Error adding lesson:', error);
      throw error;
    }
  };

  const updateLesson = async (id: string, data: Partial<Lesson>) => {
    try {
      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.orderNumber !== undefined) updateData.order_number = data.orderNumber;
      if (data.content !== undefined) updateData.content = data.content;
      if (data.videoUrl !== undefined) updateData.video_url = data.videoUrl;
      if (data.passingScore !== undefined) updateData.passing_score = data.passingScore;
      if (data.questions !== undefined) updateData.questions = data.questions;
      if (data.moduleId !== undefined) updateData.module_id = data.moduleId;

      const { error } = await supabase
        .from('lessons')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setLessons(lessons.map(l => l.id === id ? { ...l, ...data } : l));
      console.log('✅ Lesson updated');
    } catch (error) {
      console.error('Error updating lesson:', error);
      throw error;
    }
  };

  const deleteLesson = async (id: string) => {
    try {
      const { error } = await supabase.from('lessons').delete().eq('id', id);
      if (error) throw error;

      setLessons(lessons.filter(l => l.id !== id));

      // Remove from completed lessons in enrollments
      setEnrollments(enrollments.map(e => ({
        ...e,
        completedLessons: e.completedLessons.filter(lessonId => lessonId !== id)
      })));

      console.log('✅ Lesson deleted');
    } catch (error) {
      console.error('Error deleting lesson:', error);
      throw error;
    }
  };

  const enrollUser = async (userId: string, courseId: string) => {
    try {
      // Check if already enrolled
      const existing = enrollments.find(e => e.userId === userId && e.courseId === courseId);
      if (existing) return;

      const { data, error } = await supabase
        .from('enrollments')
        .insert([{
          user_id: userId,
          course_id: courseId,
          progress: 0,
          completed_lessons: [],
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;

      const newEnrollment: Enrollment = {
        id: data.id,
        userId: data.user_id,
        courseId: data.course_id,
        progress: data.progress,
        completedLessons: data.completed_lessons || [],
        status: data.status
      };

      setEnrollments([...enrollments, newEnrollment]);
      console.log('✅ User enrolled in course');
    } catch (error) {
      console.error('Error enrolling user:', error);
      throw error;
    }
  };

  const updateProgress = async (userId: string, lessonId: string, courseId: string) => {
    try {
      // Find the enrollment
      const enrollment = enrollments.find(e => e.userId === userId && e.courseId === courseId);
      if (!enrollment) return;

      // Check if lesson already completed
      if (enrollment.completedLessons.includes(lessonId)) return;

      const newCompleted = [...enrollment.completedLessons, lessonId];

      // Calculate progress
      const courseModules = modules.filter(m => m.courseId === courseId);
      const moduleIds = courseModules.map(m => m.id);
      const totalLessons = lessons.filter(l => moduleIds.includes(l.moduleId)).length;
      const newProgress = totalLessons > 0 ? Math.round((newCompleted.length / totalLessons) * 100) : 0;
      const newStatus = newProgress === 100 ? 'completed' : 'active';

      // Update in Supabase
      const { error } = await supabase
        .from('enrollments')
        .update({
          completed_lessons: newCompleted,
          progress: newProgress,
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', enrollment.id);

      if (error) throw error;

      // Update local state
      setEnrollments(prev => prev.map(e => {
        if (e.id === enrollment.id) {
          return {
            ...e,
            completedLessons: newCompleted,
            progress: newProgress,
            status: newStatus
          };
        }
        return e;
      }));

      console.log('✅ Progress updated:', newProgress + '%');
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
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
      users, courses, modules, lessons, enrollments, liveSessions, exams, examAttempts, currentUser, sessionChecked,
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