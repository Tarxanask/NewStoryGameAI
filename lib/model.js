import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import { ALLOWED_HTML_TAGS } from '@/lib/constants'

// Initialize the Google Generative AI client
const genai = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY)
const MODEL_NAME = 'gemini-1.5-flash' // Or use "gemini-1.0-pro" if preferred

const generationConfig = {
  temperature: 1,
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

// ✅ FIXED: Function to generate a story step
export async function generateStoryStep(currentGameState, gameSettings) {
  const gameProgress = JSON.stringify(currentGameState.progress)

  const prompt = `
    - Player's current power: ${currentGameState.hireability}
    - Recent choices: ${gameProgress}
    - ${gameSettings.extraPrompts || ''}

    - Provide a short message of the next story step based on the player's actions so far.
    - The entire message should be conversational with simple A1 ${gameSettings.language} level without other translations.
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

    - Ensure "effect" reflects the impact each choice has on power, ranging FROM -${gameSettings.difficulty.maxLosingPoints} to +${gameSettings.difficulty.maxGainPoints}.
    - Keep the tone engaging, and align the narrative with a dark fantasy world.
    - DO NOT add extra text — only output the object WITHOUT ANY FORMATTING.
    - You may format your story using HTML, but only with the following allowed tags: ${JSON.stringify(ALLOWED_HTML_TAGS)}
  `

  try {
    const result = await model.generateContent(prompt, { generationConfig, safetySettings })
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
    Player power: ${currentGameState.hireability}.
    Recent choices: ${gameProgress}.
    The player has written a reply: "${userInput}" to the step "${stepStory}".
    Score the player's response and determine its effect on power.
    Return the response in JSON format like this:
    {
      "reply": "",
      "effect": "-x",
      "reasoning": ""
    }

    - Ensure "effect" reflects the impact each choice has on power, ranging FROM -${gameSettings.difficulty.maxLosingPoints} to +${gameSettings.difficulty.maxGainPoints}.
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
    Based on the journey so far, craft a natural-sounding conclusion for the player. Reflect the current power score and the choices the player made:

    - Power: ${currentGameState.hireability}
    - Choices: ${gameProgress}

    Conclude the journey accordingly. If the power is greater than ${gameSettings.difficulty.hiringThreshold}, make it sound like the artifact was destroyed and the Netherworld is unleashed. If it’s ${gameSettings.difficulty.hiringThreshold} or below, make it clear the artifact remains and the Netherworld is sealed. Keep the tone professional and engaging.
    - do not mention the power score
    - Return only the conclusion as a string without any extra formatting.
    - The entire conclusion should be conversational with simple A1 ${gameSettings.language} level without other translations.
  `

  try {
    const result = await model.generateContent(prompt, { generationConfig, safetySettings })
    return result.response.text().trim()
  } catch (error) {
    console.error('Error generating conclusion:', error)
    return 'The journey concludes abruptly.'
  }
}

// Function to generate exit confirmation
export async function generateExitConfirmation(currentGameState, gameSettings) {
  const gameProgress = JSON.stringify(currentGameState.progress)

  const prompt = `
    The player is attempting to exit the game mid-journey. Generate a natural-sounding confirmation message.

    - Power: ${currentGameState.hireability}
    - Choices: ${gameProgress}

    Structure the response as a JSON object with:
    {
      "title": "A short, engaging title that fits the theme of a dark fantasy journey.",
      "body": "A conversational message acknowledging the player’s progress, subtly encouraging them to stay and finish the journey, but giving them the option to leave."
    }

    - If the power score is high, suggest the artifact is within reach.
    - If the power score is low, offer a final chance to gather strength.
    - Keep the message in simple A1 ${gameSettings.language} level without other translations.
    - DO NOT add extra text — only output the object WITHOUT ANY FORMATTING.
  `

  try {
    const result = await model.generateContent(prompt, { generationConfig, safetySettings })
    return JSON.parse(result.response.text().trim())
  } catch (error) {
    console.error('Error generating exit confirmation:', error)
    return {
      title: 'Abandon Quest?',
      body: 'The portal shimmers before you. Are you sure you wish to turn back?',
    }
  }
}

// Function to generate game opener
export async function generateGameOpener(gameSettings) {
  const prompt = `
    Generate a brief opening scene where the player, a half-human warrior from the Netherworld, crosses the portal into the human realm:

    The air crackles as you step through the portal. The stench of the human world fills your nostrils - a sickly sweet contrast to the sulfurous fumes of the Netherworld. Before you lies a ravaged battlefield, the remnants of a human army crushed by your vanguard.

    - Keep it short, sharp, and fitting with a dark fantasy theme.
    - Use simple A1 ${gameSettings.language} level.
    - include HTML tags to the response but only with the following allowed tags: ${JSON.stringify(ALLOWED_HTML_TAGS)} and WITHOUT ANY FORMATTING.
  `

  try {
    const result = await model.generateContent(prompt, { generationConfig, safetySettings })
    return result.response.text().trim()
  } catch (error) {
    console.error('Error generating game opener:', error)
    return `
      The air crackles as you step through the portal. The stench of the human world fills your nostrils - a sickly sweet contrast to the sulfurous fumes of the Netherworld. Before you lies a ravaged battlefield, the remnants of a human army crushed by your vanguard.
    `
  }
}
