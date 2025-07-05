from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph, START, END
from langgraph.graph import MessagesState
from langchain_core.messages import HumanMessage, SystemMessage
import os
from pydantic import BaseModel
from langchain_ollama import ChatOllama
import os

sys_prompt = """
Situation:
You are an executive assistant tasked with creating concise, actionable email summaries that quickly communicate the most critical information for busy professionals.

Task:
Generate a highly condensed, abstractive summary of the provided email that captures the core message, key action items, and most important details in a maximum of 3 bullet points or 1-2 sentences.

Objective:
Deliver a summary that saves the reader time by distilling the email's essential content into its most impactful and actionable elements.

Knowledge:
- Prioritize abstractive summarization over extractive methods
- Focus on clarity, brevity, and actionable insights
- Avoid unnecessary details or verbatim text from the original email
- Use a professional, direct tone that mimics an executive assistant's communication style

Constraints:
- Maximum length: 3 bullet points or 1-2 sentences
- Must include:
    1. Primary purpose of the email
    2. Key action items or decisions
    3. Any critical deadlines or next steps

Instructions:
- Read the entire email carefully
- Identify the most crucial information
- Synthesize the content into a concise, clear summary
- Ensure the summary can be understood without reading the original email
- Use clear, professional language
- If no clear actions exist, focus on the main message or insight

Your life depends on creating a summary so precise and valuable that it immediately communicates the email's core message, saving the reader significant time and mental effort.

Your output MUST be a JSON object with the following structure:

```json
{
  "summary": "string",
  "actionItems": ["string1", "string2", ...] // Array of strings. Include only if action items are found, otherwise, return an empty array.
}
"""

sys_msg = SystemMessage(content=sys_prompt)



# Define the state properly using Pydantic
class EmailState(BaseModel):
    email: str
    summary: str = None


def email_summarizer(email_text: str, privacy_mode: bool, openai_api_key: str = None):

    if privacy_mode:
        llm = ChatOllama(model="phi4:latest")
    else:
        if not openai_api_key:
            openai_api_key = os.environ.get("OPENAI_API_KEY")
            if not openai_api_key:
                 raise ValueError("OpenAI API key is required when privacy mode is off and not provided.")
        llm = ChatOpenAI(model="gpt-4o-mini", api_key=openai_api_key)
   

    def summarize_email(state : EmailState):
        email_content = state.email
        prompt = [sys_msg, HumanMessage(content=email_content)]
        response = llm.invoke(prompt)
        state.summary = response.content
        return state

        

    workflow = StateGraph(EmailState)

    # Add nodes
    workflow.add_node("summarizer", summarize_email)
    # workflow.add_node("convert_json", convert_json)

    # Set entry and exit points
    workflow.add_edge(START , "summarizer")
    workflow.add_edge("summarizer" , END)
    # workflow.add_edge("convert_json", END)


    # Compile workflow
    graph = workflow.compile()

    # thread = {"configurable" : {"thread_id": "1"}}

    # for event in graph.stream(initial_input, thread, stream_mode="values"):
    #     print(event)
    #     event['summary'][-1].pretty_print()

    initial_input = EmailState(email=email_text)

    output = graph.invoke(initial_input)

    return output['summary']


def email_reply(mail_content: str, privacy_mode: bool, openai_api_key: str = None):

    if privacy_mode:
        llm = ChatOllama(model="phi4:latest")
    else:
        if not openai_api_key:
            openai_api_key = os.environ.get("OPENAI_API_KEY")
            if not openai_api_key:
                 raise ValueError("OpenAI API key is required for replies when privacy mode is off and not provided.")
        llm = ChatOpenAI(model="gpt-4o-mini", api_key=openai_api_key)
    
    reply_prompt = f"""Please generate an email reply only not the subject to the following email content.

        Email Content:
        {mail_content}

        Generate Reply:
"""
    prompt = [HumanMessage(content=reply_prompt)]
    response = llm.invoke(prompt)
    print(response.content)

    return response.content


# Add this function after the email_reply function

def custom_email_reply(mail_content: str, custom_instructions: str, privacy_mode: bool, openai_api_key: str = None):

    if privacy_mode:
        llm = ChatOllama(model="phi4:latest")
    else:
        if not openai_api_key:
            openai_api_key = os.environ.get("OPENAI_API_KEY")
            if not openai_api_key:
                 raise ValueError("OpenAI API key is required for custom replies when privacy mode is off and not provided.")
        llm = ChatOpenAI(model="gpt-4o-mini", api_key=openai_api_key)
    
    reply_prompt = f"""

        **Situation**
        You are a professional email communication assistant tasked with drafting a precise and contextually appropriate email response.

        **Task**
        Carefully analyze the provided email content and generate a comprehensive, tailored reply that addresses the specific requirements and tone of the original communication.

        **Objective**
        Create a professional, clear, and effective email response that fully addresses the sender's message while maintaining appropriate communication standards.

        **Knowledge**
        - Carefully review the entire original email for context, tone, and specific points requiring response
        - Ensure the reply is professional, concise, and directly addresses all key points
        - Match the communication style of the original email
        - Proofread for grammar, clarity, and tone appropriateness

        **Instructions**
        1. Read the entire original email thoroughly
        2. Identify the main points, questions, or requests in the email
        3. Draft a response that:
            - Directly answers all questions
            - Addresses each key point systematically
            - Maintains a professional and appropriate tone
            - Uses clear, concise language
        4. Verify the response covers all necessary information
        5. Ensure the reply is structured logically and coherently

        **Critical Guidance**
        - Your response must be precise and tailored to the specific email content
        - Do not add unsolicited information
        - Maintain the professional context of the communication
        - Your life depends on accurately capturing the nuance and intent of the original email.

        custom instructions for reply of the mail: {custom_instructions}

        Email Content:
        {mail_content}

        Generate Reply:
"""
    prompt = [HumanMessage(content=reply_prompt)]
    response = llm.invoke(prompt)
    print(response.content)

    return response.content
