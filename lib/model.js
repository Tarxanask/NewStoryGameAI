// lib/gemini.js
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import { ALLOWED_HTML_TAGS } from '@/lib/constants'

// Initialize the Google Generative AI client
const genai = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY)
const MODEL_NAME = 'gemini-1.5-flash' // Or use "gemini-1.0-pro" if preferred

const generationConfig = {
  temperature: 1, // Adjust for more or less creative responses
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
}

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
]

const model = genai.getGenerativeModel({ model: MODEL_NAME })
// Function to generate a story step
export async function generateStoryStep(currentGameState, gameSettings) {
  const gameProgress = JSON.stringify(currentGameState.progress)
  const prompt = `
    You are an interviewer in an interactive story set in the world of Suits taking the role Harvey, the player takes on the role of Mike Ross navigating his interview at Pearson Hardman. The goal is to have a dialog to determine the player's "hireability," starting at 50, which changes based on their choices.

    - Player's current hireability: ${currentGameState.hireability}
    - Recent choices: ${gameProgress}
    - ${gameSettings.extraPrompt || ''}

    - Provide a short message of the next story step based on the player's actions so far.
    - The entire message should be conversational with simple A1 ${
      gameSettings.language
    } level without other translations.
    - The choices should be in human word as if the player is actually telling them.
    - Present exactly three distinct concise choices the player can make. Each choice should subtly influence the hireability score.
    - Return the result as a JSON object in this format:

    {
      "story": "Narrate the next part of the story.",
      "character": "Character name",
      "choices": [
        {
          "text": "Choice A.",
          "effect": "+x"
        },
        {
          "text": "Choice B.",
          "effect": "-x"
        },
        {
          "text": "Choice C.",
          "effect": "-x"
        }
      ]
    }

    - Ensure "effect" reflects the impact each choice has on hireability, ranging FROM -${
      gameSettings.difficulty.maxLosingPoints
    } to +${gameSettings.difficulty.maxGainPoints}.
    - Keep the tone engaging, and align the narrative with Suits' high-stakes legal drama.
    - DO NOT add extra text — only output the object WITHOUT ANY FORMATTING.
    - You may format your the story using HTML, but only with the following allowed tags: ${JSON.stringify(
      ALLOWED_HTML_TAGS
    )}
  `
  try {
    const result = await model.generateContent(prompt, { generationConfig })
    const text = result.response.text()
    return JSON.parse(text.trim())
  } catch (error) {
    console.error('Error generating story step:', error)
    return null
  }
}

// Function to interpret user input
export async function interpretUserInput(userInput, currentGameState, stepStory, gameSettings) {
  const gameProgress = JSON.stringify(currentGameState.progress)
  const prompt = `
    Player hireability: ${currentGameState.hireability}.
    Recent choices: ${gameProgress}.
    The player has written a reply: "${userInput}" to the step "${stepStory}".
    Score the player's response and determine its effect on hireability.
    Return the response in JSON format like this:
    {
      "reply": "",
      "effect": "-x",
      "reasoning": ""
    }

    - Ensure "effect" reflects the impact each choice has on hireability, ranging FROM -${gameSettings.difficulty.maxLosingPoints} to +${gameSettings.difficulty.maxGainPoints}.
    - DO NOT add extra text — only output the object WITHOUT ANY FORMATTING.
  `
  try {
    const result = await model.generateContent(prompt, { generationConfig, safetySettings })
    const text = result.response.text()
    return JSON.parse(text.trim())
  } catch (error) {
    console.error('Error interpreting user input:', error)
    return null
  }
}

// Function to generate the conclusion
export async function generateConclusion(currentGameState, gameSettings) {
  const gameProgress = JSON.stringify(currentGameState.progress)
  const prompt = `
    Based on the interview so far, craft a natural-sounding conclusion for the player’s interview with Harvey Specter. Reflect the current hireability score and the choices the player made:

    - Hireability: ${currentGameState.hireability}
    - Choices: ${gameProgress}

    Conclude the interview accordingly. If the hireability is greater than ${gameSettings.difficulty.hiringThreshold}, make it sound like the player got hired. If it’s ${gameSettings.difficulty.hiringThreshold} or below, make it clear they got rejected but keep the tone professional and engaging.
    - do not mention the hirebility score
    - Return only the conclusion as a string without any extra formatting.
    - The entire conclusion should be conversational with simple A1 ${gameSettings.language} level without other translations.
  `
  try {
    const result = await model.generateContent(prompt, { generationConfig, safetySettings })
    return result.response.text().trim()
  } catch (error) {
    console.error('Error generating conclusion:', error)
    return 'The interview concludes abruptly.'
  }
}

export async function generateExitConfirmation(currentGameState, gameSettings) {
  const gameProgress = JSON.stringify(currentGameState.progress)
  const prompt = `
    The player is attempting to exit the game mid-interview with Harvey Specter. Generate a natural-sounding confirmation message from Harvey as the player stands to leave.

    - Hireability: ${currentGameState.hireability}
    - Choices: ${gameProgress}

    Structure the response as a JSON object with:
    {
      "title": "A short, engaging title that fits the theme of a high-stakes interview.",
      "body": "A conversational message from Harvey acknowledging the player’s progress, subtly encouraging them to stay and finish the interview, but giving them the option to leave."
    }

    - If the hireability score is high, Harvey should suggest the player is almost there.
    - If the hireability score is low, Harvey should offer a final chance to turn things around.
    - Keep the message in simple A1 ${gameSettings.language} level without other translations.
    - DO NOT add extra text — only output the object WITHOUT ANY FORMATTING.
  `
  try {
    const result = await model.generateContent(prompt, { generationConfig, safetySettings })
    return JSON.parse(result.response.text().trim())
  } catch (error) {
    console.error('Error generating exit confirmation:', error)
    return {
      title: 'Exit Interview?',
      body: 'Harvey looks up as you stand to leave. Are you sure you want to go?',
    }
  }
}

export async function generateGameOpener(gameSettings) {
  const prompt = `
  You are a receptionist "Donna" in an interactive story set in the world of Suits taking the role Harvey, the player takes on the role of Mike Ross navigating his interview at Pearson Hardman.
    Generate a brief opening scene where Donna greets the player as they approach Harvey's office for an interview:

      Donna smirks as you approach. “Let me guess… here for Harvey?” <br />
      You nod. “Mike Ross. Interview.” <br />
      She tilts her head. “Think you’ve got what it takes?” <br />
      She gestures to the door.

    - Keep it short, sharp, and fitting with Donna’s confident tone.
    - Use simple A1 ${gameSettings.language} level.
    - include HTML tags to the response but only with the following allowed tags: ${JSON.stringify(
      ALLOWED_HTML_TAGS
    )} and WITHOUT ANY FORMATTING.
  `
  try {
    const result = await model.generateContent(prompt, { generationConfig, safetySettings })
    return result.response.text().trim()
  } catch (error) {
    console.error('Error generating game opener:', error)
    return `
      Donna smirks as you approach. “Let me guess… here for Harvey?” <br />
      You nod. “Mike Ross. Interview.” <br />
      She tilts her head. “Think you’ve got what it takes?” <br />
      She gestures to the door.
    `
  }
}
