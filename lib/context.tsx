import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Course, Module, Lesson, Enrollment } from './types';
import { COURSES, MODULES, LESSONS, MOCK_USER, MOCK_ADMIN } from './mockData';

// Extended initial state
const INITIAL_USERS: User[] = [
  MOCK_USER,
  MOCK_ADMIN,
  { id: 'u2', firstName: 'Sarah', lastName: 'Connor', email: 'sarah@resistance.net', role: 'user', status: 'active' },
  { id: 'u3', firstName: 'Jason', lastName: 'Bourne', email: 'jason@treadstone.cia', role: 'user', status: 'inactive' },
];

const INITIAL_ENROLLMENTS: Enrollment[] = [
  { userId: 'u1', courseId: 'c1', progress: 35, completedLessons: ['l1'], status: 'active' },
];

interface DataContextType {
  users: User[];
  courses: Course[];
  modules: Module[];
  lessons: Lesson[];
  enrollments: Enrollment[];
  currentUser: User | null;
  // Actions
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'status'>) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addCourse: (course: Omit<Course, 'id'>) => void;
  enrollUser: (userId: string, courseId: string) => void;
  updateProgress: (userId: string, lessonId: string, courseId: string) => void;
  getCourseProgress: (userId: string, courseId: string) => number;
}

const DataContext = createContext<DataContextType>(null!);

// Fix: Make children optional to resolve TS error
export const DataProvider = ({ children }: { children?: React.ReactNode }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [courses, setCourses] = useState<Course[]>(COURSES);
  const [modules, setModules] = useState<Module[]>(MODULES);
  const [lessons, setLessons] = useState<Lesson[]>(LESSONS);
  const [enrollments, setEnrollments] = useState<Enrollment[]>(INITIAL_ENROLLMENTS);
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
  };

  const addCourse = (courseData: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      ...courseData,
      id: Math.random().toString(36).substr(2, 9)
    };
    setCourses([...courses, newCourse]);
  };

  const enrollUser = (userId: string, courseId: string) => {
    if (enrollments.some(e => e.userId === userId && e.courseId === courseId)) return;
    setEnrollments([...enrollments, { userId, courseId, progress: 0, completedLessons: [], status: 'active' }]);
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

  return (
    <DataContext.Provider value={{
      users, courses, modules, lessons, enrollments, currentUser,
      login, logout, addUser, updateUser, deleteUser, addCourse, enrollUser, updateProgress, getCourseProgress
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);