// ============================================================
// lib/data.ts — All portfolio content for Mandeep Singh
// ============================================================

export const PERSONAL = {
  name: "Mandeep Singh",
  initials: "MS",
  tagline: "AI/ML Engineer & Full Stack Developer",
  roles: [
    "AI/ML Engineer",
    "Full Stack Developer",
    "Cloud Architect",
    "Data Scientist",
    "Flutter Developer",
  ],
  bio: `Pursuing M.E. in Artificial Intelligence & Machine Learning at Chandigarh University.
I architect intelligent systems at the intersection of AI research and production engineering.
From training neural networks to deploying cloud-native applications — I build things that matter.`,
  location: "Bhiwani, Haryana, India",
  email: "mandeepes132@gmail.com",
  phone: "+91 8708893657",
  linkedin: "https://www.linkedin.com/in/vivansingh-mandeep/",
  github: "https://github.com/Mandeep-vivu",
  instagram: "https://www.instagram.com/vivu___7/",
  telegram: "https://t.me/iMMthe_KING",
  resumeUrl: "https://www.canva.com/design/DAFlhUbanOo/view",
  availableForWork: true,
};

export const STATS = [
  { label: "Projects Built", value: 10, suffix: "+" },
  { label: "Internships", value: 2, suffix: "" },
  { label: "Students Trained", value: 50, suffix: "+" },
  { label: "Certifications", value: 5, suffix: "+" },
];

// ─── Skills ─────────────────────────────────────────────────
export type Skill = {
  name: string;
  icon: string;
  level: number; // 0–100
  category: "ai" | "fullstack" | "tools";
  color: string;
};

export const SKILLS: Skill[] = [
  // AI / ML
  { name: "Python", icon: "SiPython", level: 92, category: "ai", color: "#3776AB" },
  { name: "TensorFlow", icon: "SiTensorflow", level: 75, category: "ai", color: "#FF6F00" },
  { name: "PyTorch", icon: "SiPytorch", level: 70, category: "ai", color: "#EE4C2C" },
  { name: "Scikit-learn", icon: "SiScikitlearn", level: 80, category: "ai", color: "#F7931E" },
  { name: "NumPy", icon: "SiNumpy", level: 85, category: "ai", color: "#013243" },
  { name: "Pandas", icon: "SiPandas", level: 85, category: "ai", color: "#150458" },
  { name: "Matplotlib", icon: "SiPlotly", level: 78, category: "ai", color: "#11557C" },
  { name: "Data Science", icon: "SiJupyter", level: 80, category: "ai", color: "#F37626" },
  // Full Stack / Cloud
  { name: "Next.js", icon: "SiNextdotjs", level: 72, category: "fullstack", color: "#000000" },
  { name: "React", icon: "SiReact", level: 75, category: "fullstack", color: "#61DAFB" },
  { name: "Flutter", icon: "SiFlutter", level: 84, category: "fullstack", color: "#02569B" },
  { name: "PostgreSQL", icon: "SiPostgresql", level: 90, category: "fullstack", color: "#4169E1" },
  { name: "MongoDB", icon: "SiMongodb", level: 65, category: "fullstack", color: "#47A248" },
  { name: "Docker", icon: "SiDocker", level: 60, category: "fullstack", color: "#2496ED" },
  { name: "HTML/CSS", icon: "SiHtml5", level: 87, category: "fullstack", color: "#E34F26" },
  { name: "REST APIs", icon: "SiFastapi", level: 80, category: "fullstack", color: "#009688" },
  // Tools / DevOps
  { name: "Git/GitHub", icon: "SiGithub", level: 80, category: "tools", color: "#181717" },
  { name: "Linux", icon: "SiLinux", level: 75, category: "tools", color: "#FCC624" },
  { name: "Bash", icon: "SiGnubash", level: 70, category: "tools", color: "#4EAA25" },
  { name: "DSA", icon: "SiLeetcode", level: 80, category: "tools", color: "#FFA116" },
  { name: "Kubernetes", icon: "SiKubernetes", level: 50, category: "tools", color: "#326CE5" },
  { name: "Jupyter", icon: "SiJupyter", level: 88, category: "tools", color: "#F37626" },
];

// ─── Projects ────────────────────────────────────────────────
export type Project = {
  id: string;
  title: string;
  description: string;
  longDesc: string;
  tech: string[];
  github: string;
  demo?: string;
  featured: boolean;
  gradient: string;
  icon: string;
};

export const PROJECTS: Project[] = [
  {
    id: "covid-ml",
    title: "Covid-19 ML Predictor",
    description: "ML model predicting COVID-19 case trends using regression & time-series analysis.",
    longDesc: "Built a machine learning pipeline using Python, Scikit-learn, and Pandas to analyze and predict COVID-19 case trajectories. Implemented data preprocessing, feature engineering, and multiple regression models with cross-validation.",
    tech: ["Python", "Scikit-learn", "Pandas", "NumPy", "Matplotlib"],
    github: "https://github.com/Mandeep-vivu",
    featured: true,
    gradient: "from-violet-600/20 to-cyan-600/20",
    icon: "🧬",
  },
  {
    id: "celestial-db",
    title: "Celestial Bodies Database",
    description: "Relational database system for astronomical data using PostgreSQL & Bash scripting.",
    longDesc: "Designed a full PostgreSQL database schema for celestial bodies including galaxies, stars, planets, moons. Used Bash scripting for data ingestion automation, complex SQL queries, and reporting.",
    tech: ["PostgreSQL", "Bash", "SQL", "Linux"],
    github: "https://github.com/Mandeep-vivu/PROJECT-RDBMS",
    featured: true,
    gradient: "from-blue-600/20 to-indigo-600/20",
    icon: "🌌",
  },
  {
    id: "technozarre-app",
    title: "Technozarre App",
    description: "Lead-architected Flutter mobile app for college fest event registrations.",
    longDesc: "Served as Lead Architect for a Flutter mobile application enabling students to register for college technical fest events. Implemented real-time updates via Socket.IO, integrated REST APIs, and delivered a polished cross-platform UX.",
    tech: ["Flutter", "Dart", "Socket.IO", "REST API"],
    github: "https://github.com/Mandeep-vivu/technozarreap",
    featured: true,
    gradient: "from-emerald-600/20 to-teal-600/20",
    icon: "📱",
  },
  {
    id: "technozarre-web",
    title: "Technozarre Website",
    description: "Official college technical fest website with event listings & registration system.",
    longDesc: "Designed and developed the official website for Technozarre, the annual technical fest. Built with modern HTML/CSS/JS, featuring event details, registration forms, schedule management, and responsive design.",
    tech: ["HTML", "CSS", "JavaScript", "Responsive Design"],
    github: "https://github.com/Mandeep-vivu/technozarre_webp",
    featured: true,
    gradient: "from-orange-600/20 to-red-600/20",
    icon: "🌐",
  },
  {
    id: "flutter-chat",
    title: "Flutter Chat App",
    description: "Real-time cross-platform chat application with Socket.IO and live messaging.",
    longDesc: "Built a fully functional real-time chat application using Flutter and Dart. Integrated Socket.IO for bi-directional event-based communication, REST API for user authentication, and a clean modern UI.",
    tech: ["Flutter", "Dart", "Socket.IO", "API"],
    github: "https://github.com/Mandeep-vivu",
    featured: false,
    gradient: "from-pink-600/20 to-rose-600/20",
    icon: "💬",
  },
  {
    id: "fitness-ai",
    title: "AI Fitness Trainer",
    description: "Computer vision-based AI fitness coach with real-time pose detection & feedback.",
    longDesc: "Developed an AI fitness trainer using Python, OpenCV, and MediaPipe for real-time pose estimation and exercise tracking. Features voice feedback, rep counting, and a Streamlit dashboard.",
    tech: ["Python", "OpenCV", "MediaPipe", "Streamlit", "Computer Vision"],
    github: "https://github.com/Mandeep-vivu",
    featured: false,
    gradient: "from-yellow-600/20 to-amber-600/20",
    icon: "🏋️",
  },
];

// ─── Timeline ────────────────────────────────────────────────
export type TimelineEntry = {
  id: string;
  year: string;
  title: string;
  org: string;
  description: string;
  type: "education" | "experience" | "leadership";
  side: "left" | "right";
};

export const TIMELINE: TimelineEntry[] = [
  {
    id: "me-cu",
    year: "2025 – Present",
    title: "M.E. in Artificial Intelligence & Machine Learning",
    org: "Chandigarh University, Punjab",
    description: "Pursuing post-graduate research in AI/ML, deep learning, neural networks, and intelligent systems engineering.",
    type: "education",
    side: "right",
  },
  {
    id: "flutter-intern",
    year: "2023",
    title: "Flutter Developer Intern",
    org: "Henceforth Solutions, Mohali",
    description: "Worked on production Flutter applications, resolved UI bugs, implemented new features, and improved app performance.",
    type: "experience",
    side: "left",
  },
  {
    id: "ds-intern",
    year: "Jun 2023",
    title: "Data Science Trainee",
    org: "MedTourEasy",
    description: "Completed an intensive 4-week data science training program. Delivered a capstone project: Analysis of Fitness Data.",
    type: "experience",
    side: "right",
  },
  {
    id: "vp-tcs",
    year: "Jun 2022 – Apr 2023",
    title: "Vice President",
    org: "TCS Society (Computer Science Society)",
    description: "Led and organized coding competitions including CodeWar. Trained 50+ students in programming fundamentals. Managed technical events.",
    type: "leadership",
    side: "left",
  },
  {
    id: "btech",
    year: "2019 – 2023",
    title: "B.Tech in Computer Engineering",
    org: "The Technological Institute of Textile & Sciences, Bhiwani",
    description: "Graduated with 68.4%. Specialized in software development, databases, and systems engineering. Led multiple technical projects.",
    type: "education",
    side: "right",
  },
  {
    id: "hsse",
    year: "2017 – 2018",
    title: "Senior Secondary (Non-Medical + CS)",
    org: "Vaish Model Sr. Sec. School, Bhiwani",
    description: "Scored 77.4% in Class XII with Computer Science as a core subject.",
    type: "education",
    side: "left",
  },
];

// ─── Achievements ────────────────────────────────────────────
export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: "award" | "leadership" | "certification" | "academic";
  link?: string;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "ibm-ds",
    title: "IBM Data Science Specialization",
    description: "Completed the IBM Data Science Professional Certificate on Coursera — covering Python, SQL, ML, data viz and capstone projects.",
    icon: "🏅",
    type: "certification",
    link: "https://coursera.org/share/58179a230f4557af4ef7602850eb0df9",
  },
  {
    id: "infosys-python",
    title: "Python Fundamentals — Infosys Springboard",
    description: "44-hour Python programming course by Infosys Springboard covering core language, OOP, and data handling.",
    icon: "🐍",
    type: "certification",
    link: "https://infyspringboard.onwingspan.com/public-assets/infosysheadstart/cert/lex_auth_0125409616243425281061_shared/1-e3e0c8f2-029f-4326-b8be-7c918b334cfd.pdf",
  },
  {
    id: "technical-head",
    title: "Technical Head — Technozarre Fest",
    description: "Appointed Technical Head of the official 2-day college Technical Fest. Led event planning, coordination, and technical execution.",
    icon: "🎯",
    type: "leadership",
  },
  {
    id: "vp",
    title: "Vice President — TCS Computer Society",
    description: "Held the VP position in the college Computer Science Society. Organized coding events and mentored 50+ students.",
    icon: "👑",
    type: "leadership",
  },
  {
    id: "nfs-winner",
    title: "1st Place — NFS Gaming Championship",
    description: "Won the NFS Most Wanted competitive gaming event among 50+ participants at the college gaming tournament.",
    icon: "🏆",
    type: "award",
  },
  {
    id: "quiz-2nd",
    title: "2nd Place — College Quiz Competition",
    description: "Achieved 2nd place in the college-level general and technical quiz competition.",
    icon: "🧠",
    type: "award",
  },
  {
    id: "htet-supervisor",
    title: "Zone Supervisor — HTET Exam",
    description: "Supervised 120+ exam agents as Zone Supervisor for the Haryana Teacher Eligibility Test (HTET).",
    icon: "📋",
    type: "leadership",
  },
  {
    id: "campus-ambassador",
    title: "Campus Ambassador",
    description: "Served as Campus Ambassador managing and mentoring a cohort of 48+ students.",
    icon: "🌟",
    type: "leadership",
  },
];
