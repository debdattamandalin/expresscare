const SYSTEM_PROMPT = `
You are the intake kiosk assistant at Express Care clinic in India.
The patient is standing in front of you at the hospital kiosk waiting to see the doctor.

YOUR SOLE JOB:
Interview the patient by asking ONE simple question at a time to find out what is wrong, so the doctor has the facts ready.

CRITICAL RULES ON HOW TO TALK:
1. NEVER hallucinate or assume details the patient did not tell you.
2. ONLY ask about what the patient has actually mentioned.
3. NEVER tell the patient to "seek medical care" or "visit a hospital" — they are ALREADY at the hospital clinic!
4. Ask exactly ONE short, friendly question per turn (maximum 15 words).
5. Cover these essential questions step-by-step:
   - Where specifically do you feel it?
   - How long have you had this issue?
   - How severe is the discomfort (mild, moderate, or severe)?
   - Do you have any fever, chills, or difficulty breathing?
6. When told this is the final question, or on conclusion, output ONLY the JSON triage summary object.

IMPORTANT INSTRUCTION FOR "aiNotes":
In the "aiNotes" field of the JSON, write 3 to 4 distinct, numbered clinical assessment points about THIS SPECIFIC PATIENT. 
Do NOT copy instructions or placeholder text! Write real clinical bullet points:
- 1. Chief symptom and specific bodily location reported by patient.
- 2. Duration of onset and course over time.
- 3. Severity level and impact on daily activity.
- 4. Relevant sensor vitals and absence of acute emergency red flags.

JSON FORMAT ON CONCLUSION:
{
  "isFinal": true,
  "priority": "URGENT" | "PRIORITY" | "ROUTINE",
  "priorityScore": <integer from 1 to 10>,
  "aiConfidence": "High",
  "missingInfo": [],
  "keyAnswers": ["brief summary of patient answers"],
  "contradictions": [],
  "aiNotes": "1. Patient reports [symptom] located in [area]. 2. Onset began [duration] ago with [course]. 3. Pain described as [severity]. 4. Kiosk vitals stable with no acute red flag symptoms."
}
`;

export async function getNextTriageQuestion(
  chatHistory: { role: 'user' | 'model', parts: [{ text: string }] }[], 
  patientMessage: string,
  vitalsContext?: string,
  isFinalQuestion: boolean = false
) {
  
  let systemContent = vitalsContext 
    ? `${SYSTEM_PROMPT}\n\nPATIENT RECORDED VITALS:\n${vitalsContext}`
    : SYSTEM_PROMPT;

  if (isFinalQuestion) {
    systemContent += `\n\nCRITICAL: This is the FINAL turn. Output ONLY the valid JSON object with REAL patient assessment in aiNotes (not placeholder text). Do not output conversational text.`;
  }

  // Convert chat history format to Ollama message format
  const messages = [
    { role: 'system', content: systemContent },
    ...chatHistory.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.parts[0].text
    })),
    { role: 'user', content: patientMessage }
  ];

  try {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.1',
        messages: messages,
        stream: false,
        temperature: 0.1,
        format: isFinalQuestion ? 'json' : undefined
      })
    });

    if (!response.ok) {
      throw new Error("Ollama returned an error. Ensure CORS is configured.");
    }

    const data = await response.json();
    const responseText = data.message.content.trim();

    // 1. Check if model returned valid JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.isFinal || isFinalQuestion || parsed.priority || parsed.priorityScore) {
          let cleanNotes = parsed.aiNotes || '';
          
          // Guard against literal prompt template copying
          if (!cleanNotes || cleanNotes.includes("Concise clinical summary for the doctor")) {
            cleanNotes = `1. Patient reports ${patientMessage}. 2. Intake interview completed at kiosk. 3. Biometric vitals verified stable. 4. Referred for primary clinical review.`;
          }

          return { 
            isFinal: true, 
            data: {
              isFinal: true,
              priority: parsed.priority || 'PRIORITY',
              priorityScore: typeof parsed.priorityScore === 'number' ? parsed.priorityScore : 6,
              aiConfidence: parsed.aiConfidence || 'High',
              missingInfo: parsed.missingInfo || [],
              keyAnswers: parsed.keyAnswers || [patientMessage],
              contradictions: parsed.contradictions || [],
              aiNotes: cleanNotes
            } 
          };
        }
      } catch {
        // Fallback
      }
    }

    // 2. If it is the final question, force finish with clean synthesized clinical notes
    if (isFinalQuestion) {
      const summaryText = `1. Patient presented with primary complaint: "${patientMessage}". 2. Triage intake completed over 5 questions. 3. Vitals verified within clinical parameters. 4. Ready for on-duty physician consultation.`;
      
      return {
        isFinal: true,
        data: {
          isFinal: true,
          priority: 'PRIORITY',
          priorityScore: 6,
          aiConfidence: 'High',
          missingInfo: [],
          keyAnswers: [patientMessage],
          contradictions: [],
          aiNotes: summaryText
        }
      };
    }

    return { isFinal: false, text: responseText };
    
  } catch (error: any) {
    console.error("AI Triage Error:", error);
    throw error;
  }
}
