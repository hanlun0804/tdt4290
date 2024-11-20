import ollama
from datetime import datetime

def test(input_text):
    # Get today's date dynamically in DD/MM/YYYY format
    today_date = datetime.now().strftime("%d/%m/%Y")
    
    # Prepare the chat message for the model
    prompt = f"""Assume that today's date is {today_date}. Given the following text: "{input_text}" Extract and return ONLY the date mentioned in the text, formatted as DD/MM/YY."""

    # Send the prompt to the model
    response = ollama.chat(model='llama3.1', messages=[{'role': 'user', 'content': prompt}, ])
    
    # Extract and print the response content
    extracted_date = response['message']['content'].strip()
    print(extracted_date)
    return extracted_date

import re
from datetime import datetime

def find_latest_date(text):
    # Regular expression to find dates in dd/mm/yy format
    date_pattern = r'\b(\d{2}/\d{2}/\d{2})\b'
    
    # Find all dates in the text
    dates = re.findall(date_pattern, text)
    
    # Return the last mentioned date, or None if no date is found
    return dates[-1] if dates else None

result = test("Jeg var på butikken igår.")
latest_date = find_latest_date(result)
print(latest_date)
