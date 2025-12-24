
import { Course, Module, Lesson, User } from './types';

export const MOCK_USER: User = {
  id: 'u1',
  firstName: 'John',
  lastName: 'Wick',
  email: 'john.wick@continental.com',
  role: 'user',
  status: 'active'
};

export const MOCK_ADMIN: User = {
  id: 'a1',
  firstName: 'Admin',
  lastName: 'Operator',
  email: 'admin@flatline.com',
  role: 'admin',
  status: 'active'
};

export const COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Advanced Firearms Training',
    description: 'Master the art of tactical shooting, movement, and rapid target acquisition under stress.',
    level: 'Advanced',
    duration: 240,
    modules: 3,
    image: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 'c2',
    title: 'Executive Protection Basics',
    description: 'Foundational protocols for VIP security, route planning, and threat assessment.',
    level: 'Beginner',
    duration: 120,
    modules: 2,
    image: 'https://images.unsplash.com/photo-1551817958-c9c450974b7c?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 'c3',
    title: 'Cybersecurity for Operatives',
    description: 'Digital hygiene, secure communications, and counter-surveillance in the digital realm.',
    level: 'Intermediate',
    duration: 180,
    modules: 4,
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop'
  }
];

export const MODULES: Module[] = [
  { id: 'm1', courseId: 'c1', title: 'Module 1: Safety & Fundamentals', description: 'Core safety rules and grip techniques.', orderNumber: 1 },
  { id: 'm2', courseId: 'c1', title: 'Module 2: Tactical Reloads', description: 'Speed vs Retention reloads.', orderNumber: 2 },
  { id: 'm3', courseId: 'c1', title: 'Module 3: Dynamic Movement', description: 'Shooting while moving.', orderNumber: 3 },
];

export const LESSONS: Lesson[] = [
  {
    id: 'l1', moduleId: 'm1', title: 'The 4 Universal Safety Rules', type: 'content', orderNumber: 1,
    content: `
      <h2>The Four Rules</h2>
      <p>Treat every weapon as if it were loaded.</p>
      <p>Never point a weapon at anything you do not intend to shoot.</p>
      <p>Keep your finger straight and off the trigger until you are ready to fire.</p>
      <p>Keep your weapon on safe until you intend to fire.</p>
    `
  },
  {
    id: 'l2', moduleId: 'm1', title: 'Grip & Stance', type: 'content', orderNumber: 2,
    content: `
      <h2>Stance</h2>
      <p>The modern isosceles stance is preferred for body armor presentation.</p>
      <h2>Grip</h2>
      <p>Get as high on the tang as possible to mitigate recoil.</p>
    `
  },
  {
    id: 'l3', moduleId: 'm1', title: 'Safety Quiz', type: 'quiz', orderNumber: 3,
    passingScore: 100,
    questions: [
      {
        id: 'q1', text: 'When should your finger be on the trigger?', type: 'single_choice', points: 10,
        options: [
          { id: 'o1', text: 'Always', isCorrect: false },
          { id: 'o2', text: 'Only when sights are on target and you are ready to fire', isCorrect: true },
          { id: 'o3', text: 'When unholstering', isCorrect: false }
        ],
        explanation: 'Trigger discipline prevents negligent discharges.'
      },
      {
        id: 'q2', text: 'What is the first rule of firearm safety?', type: 'single_choice', points: 10,
        options: [
          { id: 'o4', text: 'Have fun', isCorrect: false },
          { id: 'o5', text: 'Treat every weapon as if it were loaded', isCorrect: true },
          { id: 'o6', text: 'Keep it clean', isCorrect: false }
        ]
      }
    ]
  }
];
