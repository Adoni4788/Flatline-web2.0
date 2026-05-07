import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Course, Module, Lesson, Enrollment, LiveSession, Exam, ExamAttempt } from './types';
import { parsePresentationLessonContent } from './presentations';
import { supabase } from './supabase';

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
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'status'>, userId: string) => Promise<User>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  // Course Actions
  addCourse: (course: Omit<Course, 'id'>) => Promise<void>;
  updateCourse: (id: string, data: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  // Module Actions
  addModule: (module: Omit<Module, 'id'>) => Promise<void>;
  updateModule: (id: string, data: Partial<Module>) => Promise<void>;
  deleteModule: (id: string) => Promise<void>;
  // Lesson Actions
  addLesson: (lesson: Omit<Lesson, 'id'>) => Promise<void>;
  updateLesson: (id: string, data: Partial<Lesson>) => Promise<void>;
  deleteLesson: (id: string) => Promise<void>;
  // Enrollment Actions
  enrollUser: (userId: string, courseId: string) => Promise<void>;
  updateProgress: (userId: string, lessonId: string, courseId: string) => Promise<void>;
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
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
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
            type: l.type === 'content' && parsePresentationLessonContent(l.content) ? 'presentation' : l.type,
            orderNumber: l.order_number,
            content: l.content,
            videoUrl: l.video_url,
            passingScore: l.passing_score,
            questions: l.questions
          })));
        }

        // Fetch users
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (usersError) throw usersError;
        if (usersData) {
          setUsers(usersData.map((u: any) => ({
            id: u.id,
            firstName: u.first_name,
            lastName: u.last_name,
            email: u.email,
            role: u.role,
            status: u.status,
            source: u.source
          })));
        }

        // Fetch enrollments
        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select('*')
          .order('created_at', { ascending: false });

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
      } catch {
        // Data will remain as empty arrays if Supabase fails
      }
    };

    loadData();
  }, []);

  // Restore session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('flatline_user');
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
    setSessionChecked(true);
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password
      });

      if (authError) return authError.message;
      if (!authData.user) return 'Login failed. Please try again.';

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .eq('status', 'active')
        .single();

      if (userError || !userData) {
        await supabase.auth.signOut();
        return 'Your account is inactive or not found. Please contact support.';
      }

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
      return null;
    } catch (err: any) {
      return err.message || 'An unexpected error occurred.';
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    localStorage.removeItem('flatline_user');
  };

  const addUser = async (userData: Omit<User, 'id' | 'status'>, userId: string) => {
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

    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const updateUser = async (id: string, data: Partial<User>) => {
    const updateData: any = {};
    if (data.firstName !== undefined) updateData.first_name = data.firstName;
    if (data.lastName !== undefined) updateData.last_name = data.lastName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.source !== undefined) updateData.source = data.source;

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
  };

  const deleteUser = async (id: string) => {
    await supabase.from('enrollments').delete().eq('user_id', id);

    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;

    setUsers(prev => prev.filter(u => u.id !== id));
    setEnrollments(prev => prev.filter(e => e.userId !== id));
  };

  const addCourse = async (courseData: Omit<Course, 'id'>) => {
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

    const newCourse: Course = {
      id: data.id,
      title: data.title,
      description: data.description,
      level: data.level,
      duration: data.duration,
      modules: data.modules,
      image: data.image
    };

    setCourses(prev => [...prev, newCourse]);
  };

  const updateCourse = async (id: string, data: Partial<Course>) => {
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

    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteCourse = async (id: string) => {
    const courseModules = modules.filter(m => m.courseId === id);
    const moduleIds = courseModules.map(m => m.id);

    if (moduleIds.length > 0) {
      const { error: lessonsError } = await supabase.from('lessons').delete().in('module_id', moduleIds);
      if (lessonsError) throw new Error(`Failed to delete lessons: ${lessonsError.message}`);
    }

    const { error: modulesError } = await supabase.from('modules').delete().eq('course_id', id);
    if (modulesError) throw new Error(`Failed to delete modules: ${modulesError.message}`);

    const { error: enrollmentsError } = await supabase.from('enrollments').delete().eq('course_id', id);
    if (enrollmentsError) throw new Error(`Failed to delete enrollments: ${enrollmentsError.message}`);

    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) throw error;

    setCourses(prev => prev.filter(c => c.id !== id));
    setModules(prev => prev.filter(m => m.courseId !== id));
    setLessons(prev => prev.filter(l => !moduleIds.includes(l.moduleId)));
    setEnrollments(prev => prev.filter(e => e.courseId !== id));
  };

  const addModule = async (moduleData: Omit<Module, 'id'>) => {
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

    setModules(prev => [...prev, newModule]);

    const courseModules = modules.filter(m => m.courseId === moduleData.courseId);
    await updateCourse(moduleData.courseId, { modules: courseModules.length + 1 });
  };

  const updateModule = async (id: string, data: Partial<Module>) => {
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

    setModules(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  };

  const deleteModule = async (id: string) => {
    const module = modules.find(m => m.id === id);
    if (!module) return;

    await supabase.from('lessons').delete().eq('module_id', id);

    const { error } = await supabase.from('modules').delete().eq('id', id);
    if (error) throw error;

    setModules(prev => prev.filter(m => m.id !== id));
    setLessons(prev => prev.filter(l => l.moduleId !== id));

    const courseModules = modules.filter(m => m.courseId === module.courseId && m.id !== id);
    await updateCourse(module.courseId, { modules: courseModules.length });
  };

  const addLesson = async (lessonData: Omit<Lesson, 'id'>) => {
    const databaseLessonType = lessonData.type === 'presentation' ? 'content' : lessonData.type;

    const { data, error } = await supabase
      .from('lessons')
      .insert([{
        module_id: lessonData.moduleId,
        title: lessonData.title,
        type: databaseLessonType,
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
      type: lessonData.type,
      orderNumber: data.order_number,
      content: data.content,
      videoUrl: data.video_url,
      passingScore: data.passing_score,
      questions: data.questions
    };

    setLessons(prev => [...prev, newLesson]);
  };

  const updateLesson = async (id: string, data: Partial<Lesson>) => {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.type !== undefined) updateData.type = data.type === 'presentation' ? 'content' : data.type;
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

    setLessons(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
  };

  const deleteLesson = async (id: string) => {
    const { error } = await supabase.from('lessons').delete().eq('id', id);
    if (error) throw error;

    setLessons(prev => prev.filter(l => l.id !== id));
    setEnrollments(prev => prev.map(e => ({
      ...e,
      completedLessons: e.completedLessons.filter(lessonId => lessonId !== id)
    })));
  };

  const enrollUser = async (userId: string, courseId: string) => {
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

    setEnrollments(prev => [...prev, newEnrollment]);
  };

  const updateProgress = async (userId: string, lessonId: string, courseId: string) => {
    const enrollment = enrollments.find(e => e.userId === userId && e.courseId === courseId);
    if (!enrollment) return;

    if (enrollment.completedLessons.includes(lessonId)) return;

    const newCompleted = [...enrollment.completedLessons, lessonId];

    const courseModules = modules.filter(m => m.courseId === courseId);
    const moduleIds = courseModules.map(m => m.id);
    const totalLessons = lessons.filter(l => moduleIds.includes(l.moduleId)).length;
    const newProgress = totalLessons > 0 ? Math.round((newCompleted.length / totalLessons) * 100) : 0;
    const newStatus = newProgress === 100 ? 'completed' : 'active';

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
