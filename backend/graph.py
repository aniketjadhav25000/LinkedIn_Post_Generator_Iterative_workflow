from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_tavily import TavilySearch

from dotenv import load_dotenv
load_dotenv()


# tools
search_tool = TavilySearch(max_results=3)
tools = [search_tool]

# llms (Updated to use a widely supported stable model string)
writer_llm = ChatGoogleGenerativeAI(model = "gemini-3.5-flash-lite", temperature=0.7)
writer_llm_with_tool = writer_llm.bind_tools(tools)

reviewer_llm = ChatGroq(model="openai/gpt-oss-120b", temperature=0.3)

# state building
class State(TypedDict):
    topic: str
    messages: Annotated[list, add_messages]
    draft: str
    review_feedback: str
    is_approved: bool
    attempt: int

# nodes
WRITER_SYSTEM_PROMPT = (
    "You are an expert LinkedIn content writer. Your job is to write "
    "engaging, professional LinkedIn posts about the given topic. "
    "If the topic requires up-to-date information, statistics, or "
    "current trends, use the web search tool to gather fresh context "
    "before writing. If you have already received feedback on a "
    "previous draft, carefully address every point in the new draft. "
    "Rules for good LinkedIn posts: strong hook in the first line, "
    "1 clear takeaway, easy to skim (short paragraphs), around "
    "150–200 words, ends with a question or call-to-action to invite "
    "engagement. Do not use hashtags."
)

def writer_node(state: State) -> dict:
    previous_messages = state.get("messages", [])

    is_tool_response = (
        previous_messages
        and previous_messages[-1].type == "tool"
    )

    topic = state["topic"]

    if is_tool_response:
        attempt = state.get("attempt", 0)
        tool_result = previous_messages[-1].content

        messages = [
            ("system", WRITER_SYSTEM_PROMPT),
            (
                "human",
                f"Write a complete LinkedIn post about: {topic}.\n\n"
                f"Use this search information:\n{tool_result}\n\n"
                "You have received the search results. "
                "Now write the final post without calling another tool. "
                "Return only the complete LinkedIn post."
            )
        ]
    else:
        attempt = state.get("attempt", 0) + 1
        previous_feedback = state.get("review_feedback", "")

        if attempt == 1:
            user_message = (
                f"Write a complete LinkedIn post about: {topic}.\n"
                "Use web search if current information is necessary. "
                "Return only the complete LinkedIn post."
            )
        else:
            user_message = (
                f"Rewrite the LinkedIn post about: {topic}.\n\n"
                f"Reviewer's feedback:\n{previous_feedback}\n\n"
                "Address all the feedback and write a complete "
                "150-200 word LinkedIn post. "
                "Return only the final post."
            )

        messages = [
            ("system", WRITER_SYSTEM_PROMPT),
            ("human", user_message)
        ]

    response = writer_llm_with_tool.invoke(messages)

    print("\nWriter response:", response.content)
    print("Tool calls:", response.tool_calls)

    return {
        "messages": [response],
        "attempt": attempt
    }

tool_node = ToolNode(tools)

def extract_draft_node(state: State) -> dict:
    """Safely extracts text blocks from LLM output into clean draft string"""
    last_message = state['messages'][-1]
    raw_content = last_message.content

    if isinstance(raw_content, list):
        text_parts = []
        for part in raw_content:
            if isinstance(part, str):
                text_parts.append(part)
            elif isinstance(part, dict) and part.get("type") == "text":
                text_parts.append(part.get("text", ""))
        draft = "\n".join(text_parts).strip()
    elif isinstance(raw_content, dict):
        draft = raw_content.get("text", str(raw_content))
    else:
        draft = str(raw_content).strip()

    print(f"\n\n generated post \n {draft}\n")
    return {"draft": draft}

REVIEWER_SYSTEM_PROMPT = (
    "You are a strict LinkedIn content reviewer. You judge whether a "
    "post is publish-ready. Evaluate against these criteria:\n"
    "1. Strong hook in the first line\n"
    "2. One clear, valuable takeaway\n"
    "3. Easy to skim — uses short paragraphs\n"
    "4. Roughly 150-200 words\n"
    "5. Ends with an engaging question or CTA\n"
    "6. Professional but human tone (not corporate-robotic)\n"
    "7. No hashtags\n\n"
    "Respond in exactly this format:\n"
    "VERDICT: APPROVED or REJECTED\n"
    "FEEDBACK: <one short paragraph explaining why>\n\n"
    "Be strict but fair. Approve only if the post genuinely meets all "
    "criteria. Reject if even one criterion is clearly missing."
)

def reviewer_node(state: State) -> dict:
    draft = state['draft']

    prompt = (
        f"review this LinkedIn post draft : \n"
        f"{draft}\n"
        f"Give your reviews"
    )

    response = reviewer_llm.invoke(
        [("system", REVIEWER_SYSTEM_PROMPT), ("human", prompt)]
    )

    review_text = response.content.strip()

    is_approved = "APPROVED" in review_text.upper().split("FEEDBACK")[0]

    if "FEEDBACK:" in review_text:
        feedback = review_text.split("FEEDBACK:", 1)[1].strip()
    else:
        feedback = review_text

    verdict = "APPROVED" if is_approved else "REJECTED"
    print(f"[Verdict : {verdict}]")
    print(f"[Feedback : {feedback}]")

    return {
        "review_feedback": feedback,
        "is_approved": is_approved,
    }

# router functions
def should_use_tool(state: State):
    last_message = state["messages"][-1]
    if getattr(last_message, 'tool_calls', None):
        return "tools"
    return "extract_draft"

def should_stop_looping(state: State):
    if state['is_approved']:
        print("Post has been approved \n")
        return END
    if state["attempt"] >= 3:
        print("Reached max attempts")
        return END
    return "writer"

# Build graph
graph = StateGraph(State)

graph.add_node("writer", writer_node)
graph.add_node("tools", tool_node)
graph.add_node("extract_draft", extract_draft_node)
graph.add_node("reviewer", reviewer_node)

graph.add_edge(START, "writer")
graph.add_conditional_edges("writer", should_use_tool)
graph.add_edge("tools", "writer")
graph.add_edge("extract_draft", "reviewer")
graph.add_conditional_edges("reviewer", should_stop_looping)

app = graph.compile()

def generate_linkedin_post(topic: str):
    initial_state = {
        "topic": topic,
        "messages": [],
        "draft": "",
        "review_feedback": "",
        "is_approved": False,
        "attempt": 0,
    }

    final_state = app.invoke(initial_state)

    return {
        "topic": topic,
        "draft": final_state["draft"],
        "attempt": final_state["attempt"],
        "approved": final_state["is_approved"],
        "feedback": final_state["review_feedback"]
    }