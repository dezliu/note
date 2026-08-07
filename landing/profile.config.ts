export interface ProfileConfig {
  // Basic Profile Information
  profile: {
    name: string;
    username: string;
    title: string;
    description: string;
    bio: string;
    image: string;
    website: string;
    location: string;
    email?: string;
    currentFocus: string[];
    funFact: string;
  };

  // Social Links
  socialLinks: {
    github: string;
    linkedin?: string;
    twitter?: string;
    telegram?: string;
    discord?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
    [key: string]: string | undefined;
  };

  // Skills and Technologies
  skills: string[];

  // Stats to display
  stats: {
    projects: string;
    profileViews: string;
    streak: string;
    botUsers?: string;
    [key: string]: string | undefined;
  };

  // Achievements
  achievements: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;

  // Terminal Configuration
  terminal: {
    hostname: string;
    username: string;
    theme: 'dark' | 'light' | 'matrix' | 'cyberpunk';
    welcomeMessage: string[];
    customCommands: {
      [command: string]: {
        description: string;
        output: string[] | (() => string[]);
        action?: 'navigate' | 'external' | 'function';
        target?: string;
      };
    };
    enabledCommands: string[];
    prompt: string;
  };

  // System Information for neofetch
  systemInfo: {
    os: string;
    host: string;
    kernel: string;
    uptime: string;
    packages: string;
    shell: string;
    resolution: string;
    de: string;
    wm: string;
    terminal: string;
    cpu: string;
    gpu: string;
    memory: string;
    ascii?: string[];
  };

  // Project Configuration
  projects: {
    featuredRepos: string[];
    excludeRepos: string[];
    categories: {
      [category: string]: string[];
    };
  };

  // Blog Configuration
  blogs: {
    enabled: boolean;
    featuredPosts: string[];
    categories: string[];
    availableBlogs: string[];
  };

  // SEO Configuration
  seo: {
    siteName: string;
    keywords: string[];
    author: string;
    twitterHandle?: string;
    ogImage?: string;
  };

  // Theme Configuration
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    terminalBackground: string;
    terminalText: string;
    font: string;
  };

  // Navigation Configuration
  navigation: {
    brandName: string;
    brandUrl: string;
    links: Array<{
      name: string;
      path: string;
      external?: boolean;
      color?: string;
    }>;
    systemInfo: {
      // os: string;
      shell: string;
      showDateTime: boolean;
    };
  };

  // Footer Configuration
  footer: {
    statusMessage: string;
    madeWithLove: {
      enabled: boolean;
      text: string;
      location: string;
    };
    systemStatus: {
      enabled: boolean;
      message: string;
    };
  };
}

// Default configuration - Users can override any of these values
export const profileConfig: ProfileConfig = {
  profile: {
    name: "dezliu",
    username: "dezliu",
    title: "Vibe Coding",
    description: "Talk is cheap, show me the code.",
    bio: "Talk is cheap, show me the code.",
    image: "/H.svg",
    website: "https://dezliu.github.io/note/",
    location: "ShangHai",
    email: "dezliu@outlook.com",
    currentFocus: [
      "Vibe coding",
    ],
    funFact: "Talk is cheap, show me the code."
  },

  socialLinks: {
    github: "https://github.com/dezliu",
  },

  skills: [
    "Java",
    "Python",
    "Linux",
    "Docker",
  ],

  stats: {
    projects: "--",
    profileViews: "--",
    streak: "--",
  },

  achievements: [
    {
      title: "Vibe Coding",
      description: "Talk is cheap, show me the code.",
      icon: "💻"
    }
  ],

  terminal: {
    hostname: "dezliu.github.io",
    username: "dezliu",
    theme: "light",
    welcomeMessage: [
      "",
      "  _____ ____    _   _ ",
      " |  ___|  _ \  | | | |",
      " | |_  | | | | | | | |",
      " |  _| | |_| | | |_| |",
      " |_|   |____/   \___/ ",
      "",
      "  Talk is cheap, show me the code.",
      "",
      "  Type 'help' to see available commands.",
      "  Type 'docs' to visit my knowledge base.",
      ""
    ],
    customCommands: {
      "docs": {
        description: "Open my knowledge base (MkDocs)",
        output: [
          "📚 Redirecting to knowledge base...",
          "",
          "Visit: https://dezliu.github.io/note/"
        ],
        action: "external",
        target: "https://dezliu.github.io/note/"
      },
      "joke": {
        description: "Tell a programming joke",
        output: () => {
          const jokes = [
            "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
            "How many programmers does it take to change a light bulb? None, that's a hardware problem! 💡",
            "Why do Java developers wear glasses? Because they can't C#! 👓",
            "There are only 10 types of people in the world: those who understand binary and those who don't.",
            "A SQL query goes into a bar, walks up to two tables and asks: 'Can I join you?' 🍺"
          ];
          return [jokes[Math.floor(Math.random() * jokes.length)]];
        }
      }
    },
    enabledCommands: [
      "help", "about", "whoami", "profile", "projects", "neofetch", "clear",
      "ls", "cd", "pwd", "fortune", "cowsay", "tree", "ps", "top", "grep",
      "cat", "man", "history", "date", "uptime", "uname", "parrot", "sl",
      "docs", "joke"
    ],
    prompt: "dezliu@dezliu.github.io:~$"
  },

  systemInfo: {
    os: "macOS",
    host: "dezliu.github.io",
    kernel: "darwin",
    uptime: "--",
    packages: "--",
    shell: "zsh",
    resolution: "--",
    de: "--",
    wm: "--",
    terminal: "browser",
    cpu: "--",
    gpu: "--",
    memory: "--"
  },

  projects: {
    featuredRepos: [],
    excludeRepos: [],
    categories: {}
  },

  blogs: {
    enabled: false,
    featuredPosts: [],
    categories: [],
    availableBlogs: []
  },

  seo: {
    siteName: "dezliu - Terminal",
    keywords: ["developer", "portfolio", "terminal", "java"],
    author: "dezliu",
  },

  theme: {
    primaryColor: "#1a95e0",
    secondaryColor: "#727578",
    accentColor: "#1a95e0",
    backgroundColor: "#ffffff",
    textColor: "#151515",
    terminalBackground: "#ffffff",
    terminalText: "#151515",
    font: "Menlo, Monaco, 'Courier New', monospace"
  },

  navigation: {
    brandName: "dezliu",
    brandUrl: "/note/",
    links: [
      { name: "docs", path: "https://dezliu.github.io/note/", external: true, color: "var(--theme-primary)" },
      { name: "gh", path: "https://github.com/dezliu", external: true, color: "var(--theme-muted)" }
    ],
    systemInfo: {
      shell: "zsh",
      showDateTime: false
    }
  },

  footer: {
    statusMessage: "Connected",
    madeWithLove: {
      enabled: true,
      text: "Made with ❤️",
      location: "ShangHai"
    },
    systemStatus: {
      enabled: true,
      message: "System OK"
    }
  }
};

export default profileConfig;
