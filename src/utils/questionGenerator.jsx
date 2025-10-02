export const generateQuestions = () => {
  const questions = [
    // Easy questions
    {
      id: 1,
      text: "What is React and what are its main features?",
      difficulty: "Easy",
      timeLimit: 20,
      category: "React"
    },
    {
      id: 2,
      text: "Explain the difference between let, const, and var in JavaScript.",
      difficulty: "Easy",
      timeLimit: 20,
      category: "JavaScript"
    },
    // Medium questions
    {
      id: 3,
      text: "How would you optimize the performance of a React application?",
      difficulty: "Medium",
      timeLimit: 60,
      category: "React"
    },
    {
      id: 4,
      text: "Explain RESTful API design principles and best practices.",
      difficulty: "Medium",
      timeLimit: 60,
      category: "Backend"
    },
    // Hard questions
    {
      id: 5,
      text: "Describe how you would implement server-side rendering with React and Node.js. What are the challenges?",
      difficulty: "Hard",
      timeLimit: 120,
      category: "Full Stack"
    },
    {
      id: 6,
      text: "Explain microservices architecture and discuss when you would choose it over a monolithic architecture.",
      difficulty: "Hard",
      timeLimit: 120,
      category: "Architecture"
    }
  ];

  return questions;
};