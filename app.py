import gradio as gr
import json

from openai import OpenAI
import gradio as gr
from dotenv import load_dotenv
load_dotenv("config.env")

with open('public/knowledge.json', 'r') as file:
    knowledge_data = json.load(file)

client = OpenAI()

def predict(message, history):
    knowledge_content = json.dumps(knowledge_data)
    system_message = {"role": "system", "content": f"You are a helpful assistant named Tobi. sometimes you answer the questions in pidgin english. Here is some additional knowledge: {knowledge_content}"}
    history_openai_format = [system_message]
    for human, assistant in history:
        history_openai_format.append({"role": "user", "content": human })
        history_openai_format.append({"role": "assistant", "content":assistant})
    history_openai_format.append({"role": "user", "content": message})
  
    response = client.chat.completions.create(model='gpt-4o-mini',
    messages= history_openai_format,
    temperature=1.0,
    stream=True)

    partial_message = ""
    for chunk in response:
        if chunk.choices[0].delta.content is not None:
              partial_message = partial_message + chunk.choices[0].delta.content
              yield partial_message


gr.ChatInterface(
    predict,
    chatbot=gr.Chatbot(height=500),
    textbox=gr.Textbox(placeholder="Ask me a yes or no question", container=False, scale=7),
    title="Tobi-Talks",
    description="Ask me anytin wey dey your mind",
    theme="HaleyCH/HaleyCH_Theme",
    cache_examples=True,
).launch(share=False)