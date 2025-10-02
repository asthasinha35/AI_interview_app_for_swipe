// Mock AI evaluation - in a real application, this would call an AI service
export const evaluateAnswer = async (answer, question) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // Mock evaluation logic based on answer length, keywords, etc.
  let baseScore = 50; // Base score
  
  // Score based on answer length (with reasonable limits)
  const answerLength = answer.trim().length;
  if (answerLength > 200) baseScore += 20;
  else if (answerLength > 100) baseScore += 10;
  else if (answerLength < 30) baseScore -= 20;
  
  // Score based on question difficulty
  if (question.difficulty === 'Easy') baseScore += 10;
  else if (question.difficulty === 'Hard') baseScore -= 10;
  
  // Add some random variation to make it more realistic
  const variation = Math.random() * 20 - 10; // -10 to +10
  let finalScore = Math.round(baseScore + variation);
  
  // Ensure score is within bounds
  finalScore = Math.max(0, Math.min(100, finalScore));
  
  // Bias scores to be more realistic (more in 60-90 range for good answers)
  if (finalScore > 70 && Math.random() > 0.3) {
    finalScore = Math.min(90, finalScore + 10);
  }
  
  return finalScore;
};