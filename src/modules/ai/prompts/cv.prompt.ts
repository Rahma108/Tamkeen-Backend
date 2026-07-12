export const cvPrompt = (cv: string) => `
You are an ATS expert.

Analyze the following CV.

Return ONLY valid JSON with the following structure:

{
  "summary": "",
  "score": 0,
  "skills": [],
  "experience": [],
  "education": [],
  "languages": [],
  "strengths": [],
  "weaknesses": [],
  "recommendations": []
}

CV:
${cv}
`;