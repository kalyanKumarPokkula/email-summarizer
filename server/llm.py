from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph, START, END
from langgraph.graph import MessagesState
from langchain_core.messages import HumanMessage, SystemMessage
import os
from pydantic import BaseModel
from langchain_ollama import ChatOllama



import os, getpass

def _set_env(var: str):
    if not os.environ.get(var):
        os.environ[var] = getpass.getpass(f"{var}: ")

_set_env("OPENAI_API_KEY")

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


def email_summarizer(email_text , privacy_mode):

    if privacy_mode:
        llm = ChatOllama(model="phi4:latest")
    else:
        llm = ChatOpenAI(model="gpt-4o-mini")
   

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


def email_reply(mail_content , privacy_mode):

    if privacy_mode:
        llm = ChatOllama(model="phi4:latest")
    else:
        llm = ChatOpenAI(model="gpt-4o-mini")
    
    reply_prompt = f"""Please generate an email reply only not the subject to the following email content.

        Email Content:
        {mail_content}

        Generate Reply:
"""
    prompt = [HumanMessage(content=reply_prompt)]
    response = llm.invoke(prompt)
    print(response.content)

    return response.content

   

