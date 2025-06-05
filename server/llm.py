from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph, START, END
from langgraph.graph import MessagesState
from langchain_core.messages import HumanMessage, SystemMessage
import os
from pydantic import BaseModel
from langchain_ollama import ChatOllama



import os

sys_prompt = """You are a world-class email analyst, specializing in concise summarization and focused action item detection. Your primary function is to analyze email content and provide structured JSON output.

Your goal is to identify the *key, actionable tasks* the email recipient needs to perform.  Focus on the *main actions* required, rather than listing every minor instruction or piece of information as a separate action item.  Think of the overall *purpose* of the email and what the recipient *needs to DO* as a result.

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

    # def convert_json(state: EmailState):
    #     msg = "give me in JSON format"
    #     prompt =[msg,HumanMessage(content=state.summary)]
    #     response = llm.invoke(prompt)
    #     state.summary = response.content
    #     return state

        

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
    
    reply_prompt = f"""Please generate an email reply only (not the subject) to the following email content.
        saying: {custom_instructions}

        Email Content:
        {mail_content}

        Generate Reply:
"""
    prompt = [HumanMessage(content=reply_prompt)]
    response = llm.invoke(prompt)
    print(response.content)

    return response.content
