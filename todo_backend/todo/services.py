import openai
from django.conf import settings
import json

openai.api_key = settings.OPENAI_API_KEY
client = openai.OpenAI()

def generate_text(prompt):

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are to summarize the contents of the following tasks."},
            {"role": "user", "content": "The tasks are: " + prompt}
        ]
    )   
    return response.choices[0].message.content.strip()
    

def find_activities(location, duration, interests, limit):

    promptInput = "location: " + location + ". duration: " + duration +". limit: " + str(limit) + ". "
    if interests and len(interests) > 0:
        promptInput = promptInput + " interests: " + interests + "."

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You will be provided with a location and a duration and an optional interests and a limit.  Generate a list of activities to do in the given location assuming that the person will stay in the location for the given duration.  If interests is provided, use it to guide the activies returned. Return the list of activities in json format, with each item in the list having attributes title, description, duration, cost.  Limit the number of activities generated to the given limit."},
            {"role": "user", "content": promptInput }
        ]
    )   
    tasks =  response.choices[0].message.content.strip()
    print(tasks)

    return convert_openai_response_to_json(tasks)

def find_similar_activities(location, activity_name, exclude_list, limit):

    exclude_string = ','.join(exclude_list)
    promptInput = "location: " + location + ". activity: " + activity_name + ". exclude: " + exclude_string +". limit: " + str(limit) + ". "

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You will be provided with a location and a activity and an exclude list and a limit.  Generate a list of activities to do in the given location that are similar to the given activty. Exclude the activities in the passed in exclude_list from the list returned. Return the list of activities in json format, with each item in the list having attributes title, description, duration, cost.  Limit the number of activities generated to the given limit."},
            {"role": "user", "content": promptInput }
        ]
    )   
    tasks =  response.choices[0].message.content.strip()
    print(tasks)

    return convert_openai_response_to_json(tasks)

def convert_openai_response_to_json(openai_response):
    # the openai api wraps the string result with some further markers when requesting
    # a json result in the prompt.
    # i.e,  ```json [ {"title":"title1"}]```
    # Remove the wrapper markers.
    if openai_response.startswith("```json"):
        openai_response = openai_response[7:]
    if openai_response.endswith("```"):
        openai_response = openai_response[:-3].strip()

    print(openai_response)
    jsonResponse = json.loads(openai_response)
    return jsonResponse
