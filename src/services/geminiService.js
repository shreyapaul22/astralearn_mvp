import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '../../config';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Clean markdown formatting from text
 * @param {string} text - Text with potential markdown
 * @returns {string} - Clean plain text
 */
function cleanMarkdown(text) {
  if (!text) return text;
  
  return text
    // Remove bold (**text** or __text__)
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    // Remove italic (*text* or _text_)
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // Remove inline code (`code`)
    .replace(/`(.+?)`/g, '$1')
    // Remove code blocks (```code```)
    .replace(/```[\s\S]*?```/g, (match) => match.replace(/```/g, ''))
    // Remove headers (# header)
    .replace(/^#+\s+/gm, '')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate a math question based on subject and class
 * @param {string} subject - The subject (e.g., 'Maths')
 * @param {number} classNum - The class number (8, 9, or 10)
 * @returns {Promise<string>} - The generated question
 */
export async function generateQuestion(subject, classNum) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    // Add randomization to get different questions
    const topics = [
      'algebra and linear equations',
      'geometry and mensuration',
      'arithmetic and percentages',
      'quadratic equations',
      'triangles and angles',
      'number systems and fractions',
      'ratios and proportions',
      'simple and compound interest',
      'profit and loss',
      'time, speed and distance'
    ];
    
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const timestamp = Date.now();

    const prompt = `You are a mathematics teacher creating a NEW and UNIQUE question for Class ${classNum} students.

IMPORTANT: Generate a DIFFERENT question each time. Use random numbers and scenarios. (Request ID: ${timestamp})

Focus on: ${randomTopic}

Requirements:
- Generate ONE clear, well-formatted mathematics problem appropriate for Class ${classNum}
- Use DIFFERENT numbers than typical examples
- The problem should be solvable by hand in 3-5 steps
- Do NOT include the solution or answer
- Make it interesting and practical
- Vary the difficulty within Class ${classNum} range

Examples of question styles (but create your own with different numbers):
- Linear equations: "Solve for x: [random]x + [random] = [random]"
- Geometry: "Find the area of a [shape] with [dimensions]"
- Word problems: "If [quantity] items cost ₹[amount], what is the cost of [different quantity] items?"
- Percentages: "[random]% of [number] is what number?"

Generate ONE NEW UNIQUE question NOW:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const question = response.text().trim();

    console.log('Generated question:', question);
    return question;
  } catch (error) {
    console.error('Error generating question:', error);
    throw new Error('Failed to generate question. Please check your API key and internet connection.');
  }
}

/**
 * Generate a hint based on the question and the student's current progress on the canvas
 * @param {string} question - The current question
 * @param {string} base64Image - Base64 encoded image of the canvas (optional)
 * @returns {Promise<string>} - A contextual helpful hint
 */
export async function generateHint(question, base64Image) {
  try {
    console.log('Generating contextual hint for question:', question);
    console.log('Canvas image provided:', !!base64Image);
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    let prompt = `You are a mathematics teacher providing hints to help a student solve a problem.

QUESTION:
${question}`;

    // If canvas has content, analyze it
    if (base64Image && base64Image.length > 100) {
      prompt += `

STUDENT'S CURRENT WORK:
Analyze what the student has written/drawn on the whiteboard.`;

      const imagePart = {
        inlineData: {
          data: base64Image.replace(/^data:image\/\w+;base64,/, ''),
          mimeType: 'image/png',
        },
      };

      prompt += `

INSTRUCTIONS:
1. First, carefully examine what the student has written or drawn on the whiteboard
2. Assess their current progress - have they started correctly? Are they on the right track?
3. If they have made progress:
   - Acknowledge what they've done correctly
   - Guide them on the NEXT STEP they should take
   - Be specific about what to do next
4. If their approach is incorrect:
   - Gently point out what's wrong
   - Suggest the correct approach or concept they should use
   - Don't just say "wrong" - explain why
5. If they haven't started or made little progress:
   - Guide them on where to BEGIN
   - Suggest the first step or the approach they should take
   - Remind them of the key concept needed
6. Keep the hint concise (2-4 sentences maximum)
7. Use simple, encouraging, supportive language
8. Do NOT include the final answer or numerical result
9. Focus on helping them move forward from their current position

Example responses:
- Good progress: "Good! You've set up the equation correctly. Now try isolating the variable by moving all terms with x to one side."
- Wrong approach: "I see you're using the wrong formula here. This problem requires the quadratic formula, not simple factoring. Try using the formula: x = (-b ± √(b²-4ac))/2a"
- Just starting: "To begin, identify what you're trying to find and what information you're given. Then try setting up an equation that relates these values."
- Stuck midway: "You've correctly identified the main equation. Now apply the distributive property to simplify the left side."

Generate a contextual hint based on their current work:`;

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const hint = response.text().trim();
      
      console.log('Generated contextual hint:', hint);
      return cleanMarkdown(hint);
    } else {
      // No canvas content - provide general hint
      prompt += `

INSTRUCTIONS:
1. Provide a helpful hint that guides the student without giving away the complete answer
2. Focus on the approach, method, or key concept needed to solve this problem
3. Guide them on where to START
4. Keep the hint concise (2-3 sentences maximum)
5. Use simple, encouraging language
6. Do NOT include the final answer or numerical result
7. Focus on the method or approach they should take

Generate a helpful hint to get them started:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const hint = response.text().trim();
      
      console.log('Generated general hint:', hint);
      return cleanMarkdown(hint);
    }
  } catch (error) {
    console.error('Error generating hint:', error);
    throw new Error('Failed to generate hint. Please try again.');
  }
}

/**
 * Verify the answer using AI vision analysis
 * @param {string} question - The original question
 * @param {string} base64Image - Base64 encoded image of the canvas
 * @returns {Promise<object>} - Verification result with isCorrect and feedback
 */
export async function verifyAnswer(question, base64Image) {
  try {
    console.log('Verifying answer with AI...');
    console.log('Question:', question);
    console.log('Image data length:', base64Image?.length);
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are a mathematics teacher reviewing a student's handwritten solution on a whiteboard.

IMPORTANT: You MUST analyze the actual drawing/writing in the image provided. Look carefully at what the student has written or drawn.

QUESTION:
${question}

INSTRUCTIONS:
1. First, describe what you see in the image - what numbers, equations, or working did the student write?
2. Analyze if the student's written answer matches the correct solution
3. Check their working and methodology
4. Determine if the answer is CORRECT or INCORRECT based on what they actually wrote

Your response MUST be in this exact JSON format:
{
  "isCorrect": true,
  "feedback": "Start by describing what you see in the image, then provide detailed analysis of their solution",
  "correctAnswer": "The correct answer and solution steps"
}

CRITICAL JSON FORMATTING RULES:
- Use VALID JSON only - ensure all strings are properly escaped
- Use plain text in strings - NO markdown (no **, \`, __, etc.)
- For line breaks in strings, use \\n (double backslash n)
- Escape quotes inside strings with \\"
- Keep text simple and readable
- Write numbers and equations clearly
- Use "x" for multiplication, "/" for division
- Do NOT include special control characters

CRITICAL: Base your evaluation ONLY on what is actually drawn/written in the image. Do not assume or guess.
Be honest - if the answer is wrong, say so clearly. If you cannot read the handwriting, say that too.`;

    const imagePart = {
      inlineData: {
        data: base64Image.replace(/^data:image\/\w+;base64,/, ''),
        mimeType: 'image/png',
      },
    };

    console.log('Sending request to Gemini AI...');
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const responseText = response.text();
    console.log('AI Response:', responseText);

    // Try to parse JSON response
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || 
                       responseText.match(/(\{[\s\S]*\})/);
      
      if (jsonMatch) {
        // Clean the JSON string before parsing
        let jsonString = jsonMatch[1];
        
        // Remove control characters (U+0000 to U+001F)
        jsonString = jsonString.replace(/[\u0000-\u001F]/g, '');
        
        // Try to parse the cleaned JSON
        try {
          const jsonResponse = JSON.parse(jsonString);
          // Clean markdown from feedback and correctAnswer
          return {
            isCorrect: jsonResponse.isCorrect,
            feedback: cleanMarkdown(jsonResponse.feedback),
            correctAnswer: jsonResponse.correctAnswer ? cleanMarkdown(jsonResponse.correctAnswer) : null,
          };
        } catch (innerError) {
          console.error('JSON parse error even after cleaning:', innerError);
          // Try manual extraction as fallback
          const isCorrect = jsonString.includes('"isCorrect": true') || 
                          jsonString.includes('"isCorrect":true');
          const feedbackMatch = jsonString.match(/"feedback"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
          const answerMatch = jsonString.match(/"correctAnswer"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
          
          return {
            isCorrect: isCorrect,
            feedback: cleanMarkdown(feedbackMatch ? feedbackMatch[1].replace(/\\n/g, '\n') : responseText),
            correctAnswer: answerMatch ? cleanMarkdown(answerMatch[1].replace(/\\n/g, '\n')) : null,
          };
        }
      } else {
        // Fallback if AI doesn't return proper JSON
        return {
          isCorrect: responseText.toLowerCase().includes('correct') && 
                    !responseText.toLowerCase().includes('incorrect'),
          feedback: cleanMarkdown(responseText),
          correctAnswer: null,
        };
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback response
      return {
        isCorrect: responseText.toLowerCase().includes('correct') && 
                  !responseText.toLowerCase().includes('incorrect'),
        feedback: cleanMarkdown(responseText),
        correctAnswer: null,
      };
    }
  } catch (error) {
    console.error('Error verifying answer:', error);
    throw new Error('Failed to verify answer. Please try again.');
  }
}

