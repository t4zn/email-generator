import { EmailInput, AIConfig } from './types';

// Function to correct common typos and normalize input
function normalizeInput(input: EmailInput): EmailInput {
  return {
    name: input.name.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' '),
    role: correctTechTitle(input.role),
    skills: input.skills.map(skill => correctTechTerms(skill)),
    experience: correctExperienceText(input.experience),
    projects: input.projects.map(project => 
      project.charAt(0).toUpperCase() + project.slice(1)
    ),
    portfolioLink: input.portfolioLink,
    linkedinLink: input.linkedinLink,
    companyName: input.companyName.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' '),
    targetRole: correctTechTitle(input.targetRole),
    recruiterName: input.recruiterName ? 
      input.recruiterName.charAt(0).toUpperCase() + input.recruiterName.slice(1) : 
      undefined,
    tone: normalizeTone(input.tone)
  };
}

// Function to correct tech titles
function correctTechTitle(title: string): string {
  const commonTitles = {
    'senir': 'Senior',
    'softwre': 'Software',
    'enginer': 'Engineer',
    'develper': 'Developer',
    'programer': 'Programmer',
    'arcitect': 'Architect',
    'devops': 'DevOps'
  };
  
  return title.toLowerCase().split(' ')
    .map(word => commonTitles[word] || word)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Function to correct tech terms
function correctTechTerms(term: string): string {
  const commonTerms = {
    'pythn': 'Python',
    'javascipt': 'JavaScript',
    'react': 'React',
    'nod': 'Node',
    'typescript': 'TypeScript',
    'vue': 'Vue.js'
  };
  
  return commonTerms[term.toLowerCase()] || term;
}

function correctExperienceText(text: string): string {
  return text.replace(/yrs/g, 'years')
            .replace(/expernce/g, 'experience')
            .replace(/dev/g, 'development');
}

function normalizeTone(tone?: string): 'formal' | 'friendly' | 'direct' {
  const tones = {
    'profesional': 'formal',
    'formal': 'formal',
    'friendly': 'friendly',
    'casual': 'friendly',
    'direct': 'direct',
    'straight': 'direct'
  };
  
  return tones[tone?.toLowerCase()] || 'formal';
}

export async function generateImprovedEmail(userData: EmailInput, aiConfig: AIConfig): Promise<string> {
  // First normalize and correct the input
  const normalizedInput = normalizeInput(userData);
  
  const prompt = `
Create a unique and personalized cold email for a job application with the following requirements:

Context:
- Applicant: ${normalizedInput.name}, ${normalizedInput.role}
- Target: ${normalizedInput.targetRole} at ${normalizedInput.companyName}
- Experience: ${normalizedInput.experience}
- Skills: ${normalizedInput.skills.join(', ')}
- Key Projects: ${normalizedInput.projects.join('; ')}
- Tone: ${normalizedInput.tone}

Requirements:
1. Write a completely original email that sounds like it was written by a real person
2. Use natural language and vary sentence structure
3. Include specific details about the applicant's experience and skills
4. Reference the company's industry and needs
5. No templates or formulaic structures
6. Make every sentence unique and contextual
7. Add personal insights about why this specific role at this company

Output Format:
- Include a clear subject line
- Use proper email structure
- Add a professional signature if provided links exist
`;

  try {
    const groqKey = aiConfig.apiKey || process.env.GROQ_API_KEY;
    if (!groqKey) {
      throw new Error('Groq API key not found');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model: aiConfig.model || 'llama3-8b-8192',
        messages: [{
          role: 'user',
          content: prompt
        }],
        max_tokens: 1000,
        temperature: 0.8,
        top_p: 0.95,
        frequency_penalty: 0.7,
        presence_penalty: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || 'Failed to generate email.';
  } catch (error) {
    console.error('Error generating email:', error);
    throw error;
  }
}