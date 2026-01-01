
import { Course, Module, Lesson, User } from './types';

export const MOCK_USER: User = {
  id: 'u1',
  firstName: 'John',
  lastName: 'Wick',
  email: 'john.wick@continental.com',
  role: 'user',
  status: 'active',
  source: 'Continental Security'
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
    image: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=800&h=600&fit=crop'
  },
  {
    id: 'c2',
    title: 'Executive Protection Basics',
    description: 'Foundational protocols for VIP security, route planning, and threat assessment.',
    level: 'Beginner',
    duration: 120,
    modules: 2,
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop'
  },
  {
    id: 'c3',
    title: 'Cybersecurity for Operatives',
    description: 'Digital hygiene, secure communications, and counter-surveillance in the digital realm.',
    level: 'Intermediate',
    duration: 180,
    modules: 4,
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop'
  }
];

export const MODULES: Module[] = [
  // Course 1: Advanced Firearms Training
  { id: 'm1', courseId: 'c1', title: 'Module 1: Safety & Fundamentals', description: 'Core safety rules and grip techniques.', orderNumber: 1 },
  { id: 'm2', courseId: 'c1', title: 'Module 2: Tactical Reloads', description: 'Speed vs Retention reloads.', orderNumber: 2 },
  { id: 'm3', courseId: 'c1', title: 'Module 3: Dynamic Movement', description: 'Shooting while moving.', orderNumber: 3 },

  // Course 2: Executive Protection Basics
  { id: 'm4', courseId: 'c2', title: 'Module 1: Threat Assessment', description: 'Identifying and analyzing potential threats.', orderNumber: 1 },
  { id: 'm5', courseId: 'c2', title: 'Module 2: Route Planning', description: 'Strategic movement and secure route selection.', orderNumber: 2 },

  // Course 3: Cybersecurity for Operatives
  { id: 'm6', courseId: 'c3', title: 'Module 1: Digital Hygiene', description: 'Secure communications and OPSEC.', orderNumber: 1 },
  { id: 'm7', courseId: 'c3', title: 'Module 2: Counter-Surveillance', description: 'Detection and evasion techniques.', orderNumber: 2 },
  { id: 'm8', courseId: 'c3', title: 'Module 3: Secure Systems', description: 'Hardening devices and networks.', orderNumber: 3 },
  { id: 'm9', courseId: 'c3', title: 'Module 4: Incident Response', description: 'Handling digital compromises.', orderNumber: 4 },
];

export const LESSONS: Lesson[] = [
  // Course 1: Advanced Firearms Training - Module 1
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
  },

  // Course 2: Executive Protection Basics - Module 1 (m4)
  {
    id: 'l4', moduleId: 'm4', title: 'Introduction to Threat Assessment', type: 'content', orderNumber: 1,
    content: `
      <h2>Understanding Threats</h2>
      <p>Threat assessment is the systematic evaluation of potential dangers to a principal or protected asset. This involves identifying, analyzing, and prioritizing potential threats based on capability and intent.</p>
      <h3>Key Principles</h3>
      <ul>
        <li>Situational Awareness: Constant vigilance of the environment</li>
        <li>Baseline Recognition: Understanding what is normal in a given environment</li>
        <li>Anomaly Detection: Identifying deviations from the baseline</li>
        <li>Risk Calculation: Evaluating likelihood and potential impact</li>
      </ul>
    `
  },
  {
    id: 'l5', moduleId: 'm4', title: 'Threat Indicators', type: 'content', orderNumber: 2,
    content: `
      <h2>Recognizing Threat Indicators</h2>
      <p>Pre-incident indicators are observable behaviors or circumstances that suggest hostile intent or planning.</p>
      <h3>Common Indicators</h3>
      <ul>
        <li>Surveillance and reconnaissance activities</li>
        <li>Unusual interest in security measures</li>
        <li>Attempts to test response procedures</li>
        <li>Acquisition of materials or information</li>
        <li>Suspicious behavior near access points</li>
      </ul>
    `
  },
  {
    id: 'l6', moduleId: 'm4', title: 'Threat Assessment Quiz', type: 'quiz', orderNumber: 3,
    passingScore: 70,
    questions: [
      {
        id: 'q3', text: 'What is the primary goal of threat assessment?', type: 'single_choice', points: 10,
        options: [
          { id: 'o7', text: 'To eliminate all risks', isCorrect: false },
          { id: 'o8', text: 'To identify, analyze, and prioritize potential threats', isCorrect: true },
          { id: 'o9', text: 'To arrest suspicious individuals', isCorrect: false }
        ],
        explanation: 'Threat assessment helps prioritize resources and responses based on actual risk levels.'
      }
    ]
  },

  // Course 2: Executive Protection Basics - Module 2 (m5)
  {
    id: 'l7', moduleId: 'm5', title: 'Route Planning Fundamentals', type: 'content', orderNumber: 1,
    content: `
      <h2>Strategic Route Selection</h2>
      <p>Effective route planning is critical for executive protection. It involves selecting primary, alternate, and emergency routes while considering various risk factors.</p>
      <h3>Planning Considerations</h3>
      <ul>
        <li>Threat environment and historical data</li>
        <li>Chokepoints and vulnerable areas</li>
        <li>Hospital and safe haven locations</li>
        <li>Communication coverage</li>
        <li>Traffic patterns and timing</li>
      </ul>
    `
  },
  {
    id: 'l8', moduleId: 'm5', title: 'Route Security Protocol', type: 'content', orderNumber: 2,
    content: `
      <h2>Securing the Route</h2>
      <p>Route security involves advance work, surveillance detection, and real-time adaptation to changing conditions.</p>
      <h3>Best Practices</h3>
      <ul>
        <li>Conduct advance reconnaissance</li>
        <li>Vary routes and timings</li>
        <li>Maintain multiple contingency options</li>
        <li>Establish communication checkpoints</li>
        <li>Coordinate with local authorities when appropriate</li>
      </ul>
    `
  },

  // Course 3: Cybersecurity for Operatives - Module 1 (m6)
  {
    id: 'l9', moduleId: 'm6', title: 'Digital Operational Security', type: 'content', orderNumber: 1,
    content: `
      <h2>OPSEC in the Digital Age</h2>
      <p>Operational Security (OPSEC) prevents adversaries from discovering critical information about operations, capabilities, and intentions through digital channels.</p>
      <h3>Core Principles</h3>
      <ul>
        <li>Need-to-know information sharing</li>
        <li>Compartmentalization of sensitive data</li>
        <li>Secure communication practices</li>
        <li>Digital footprint minimization</li>
        <li>Social media awareness</li>
      </ul>
    `
  },
  {
    id: 'l10', moduleId: 'm6', title: 'Secure Communications', type: 'content', orderNumber: 2,
    content: `
      <h2>Encrypted Communication Tools</h2>
      <p>Understanding and properly implementing encrypted communication is essential for operational security.</p>
      <h3>Best Practices</h3>
      <ul>
        <li>Use end-to-end encrypted messaging</li>
        <li>Implement VPN for all connections</li>
        <li>Verify encryption protocols</li>
        <li>Secure voice communications</li>
        <li>Properly dispose of sensitive communications</li>
      </ul>
    `
  },
  {
    id: 'l11', moduleId: 'm6', title: 'Digital Hygiene Quiz', type: 'quiz', orderNumber: 3,
    passingScore: 70,
    questions: [
      {
        id: 'q4', text: 'What does OPSEC stand for?', type: 'single_choice', points: 10,
        options: [
          { id: 'o10', text: 'Operations Security', isCorrect: false },
          { id: 'o11', text: 'Operational Security', isCorrect: true },
          { id: 'o12', text: 'Operation Specifications', isCorrect: false }
        ]
      }
    ]
  },

  // Course 3: Cybersecurity for Operatives - Module 2 (m7)
  {
    id: 'l12', moduleId: 'm7', title: 'Counter-Surveillance Techniques', type: 'content', orderNumber: 1,
    content: `
      <h2>Digital Counter-Surveillance</h2>
      <p>Counter-surveillance in the digital realm involves detecting and evading electronic monitoring and tracking.</p>
      <h3>Techniques</h3>
      <ul>
        <li>Device fingerprinting awareness</li>
        <li>Traffic analysis evasion</li>
        <li>Location services management</li>
        <li>Metadata stripping</li>
        <li>Browser fingerprint mitigation</li>
      </ul>
    `
  },

  // Course 3: Cybersecurity for Operatives - Module 3 (m8)
  {
    id: 'l13', moduleId: 'm8', title: 'System Hardening', type: 'content', orderNumber: 1,
    content: `
      <h2>Hardening Devices and Networks</h2>
      <p>System hardening reduces the attack surface of devices and networks used in operations.</p>
      <h3>Hardening Steps</h3>
      <ul>
        <li>Disable unnecessary services</li>
        <li>Implement strong authentication</li>
        <li>Regular security updates</li>
        <li>Network segmentation</li>
        <li>Intrusion detection systems</li>
      </ul>
    `
  },

  // Course 3: Cybersecurity for Operatives - Module 4 (m9)
  {
    id: 'l14', moduleId: 'm9', title: 'Incident Response', type: 'content', orderNumber: 1,
    content: `
      <h2>Handling Digital Compromises</h2>
      <p>Effective incident response minimizes damage and facilitates rapid recovery from security breaches.</p>
      <h3>Response Phases</h3>
      <ul>
        <li>Detection and Analysis</li>
        <li>Containment</li>
        <li>Eradication</li>
        <li>Recovery</li>
        <li>Post-Incident Activity</li>
      </ul>
    `
  },
  {
    id: 'l15', moduleId: 'm9', title: 'Cybersecurity Final Assessment', type: 'quiz', orderNumber: 2,
    passingScore: 75,
    questions: [
      {
        id: 'q5', text: 'What is the first step in incident response?', type: 'single_choice', points: 10,
        options: [
          { id: 'o13', text: 'Eradication', isCorrect: false },
          { id: 'o14', text: 'Detection and Analysis', isCorrect: true },
          { id: 'o15', text: 'Recovery', isCorrect: false }
        ],
        explanation: 'You must first detect and analyze an incident before you can respond to it.'
      }
    ]
  }
];
