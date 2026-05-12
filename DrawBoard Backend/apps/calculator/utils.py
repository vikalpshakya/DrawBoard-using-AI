import logging
import ast
import json
import google.generativeai as genai
from PIL import Image
from constants import GEMINI_API_KEY

logger = logging.getLogger(__name__)

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel(model_name="gemini-2.5-flash")

PROMPT_TEMPLATE = """You have been given an image with some mathematical expressions, equations, or graphical problems, and you need to solve them.

Note: Use the PEMDAS rule for solving mathematical expressions. PEMDAS stands for the Priority Order: Parentheses, Exponents, Multiplication and Division (from left to right), Addition and Subtraction (from left to right).

For example:
Q. 2 + 3 * 4
(3 * 4) => 12, 2 + 12 = 14.

Q. 2 + 3 + 5 * 4 - 8 / 2
5 * 4 => 20, 8 / 2 => 4, 2 + 3 => 5, 5 + 20 => 25, 25 - 4 => 21.

YOU CAN HAVE FIVE TYPES OF EQUATIONS/EXPRESSIONS IN THIS IMAGE, AND ONLY ONE CASE SHALL APPLY EVERY TIME:

1. Simple mathematical expressions like 2 + 2, 3 * 4, 5 / 6, 7 - 8, etc.: In this case, solve and return the answer in the format of a LIST OF ONE DICT [{{'expr': given expression, 'result': calculated answer}}].

2. Set of Equations like x^2 + 2x + 1 = 0, 3y + 4x = 0, 5x^2 + 6y + 7 = 12, etc.: In this case, solve for the given variable, and the format should be a COMMA SEPARATED LIST OF DICTS, with dict 1 as {{'expr': 'x', 'result': 2, 'assign': True}} and dict 2 as {{'expr': 'y', 'result': 5, 'assign': True}}. Include as many dicts as there are variables.

3. Assigning values to variables like x = 4, y = 5, z = 6, etc.: In this case, assign values to variables and return another key in the dict called {{'assign': True}}, keeping the variable as 'expr' and the value as 'result' in the original dictionary. RETURN AS A LIST OF DICTS.

4. Analyzing Graphical Math problems, which are word problems represented in drawing form, such as cars colliding, trigonometric problems, problems on the Pythagorean theorem, adding runs from a cricket wagon wheel, etc. PAY CLOSE ATTENTION TO DIFFERENT COLORS FOR THESE PROBLEMS. Return the answer in the format of a LIST OF ONE DICT [{{'expr': given expression, 'result': calculated answer}}].

5. Detecting Abstract Concepts that a drawing might show, such as love, hate, jealousy, patriotism, or a historic reference to war, invention, discovery, quote, etc. USE THE SAME FORMAT AS OTHERS TO RETURN THE ANSWER, where 'expr' will be the explanation of the drawing, and 'result' will be the abstract concept.

Make sure to use extra backslashes for escape characters like \\f -> \\\\f, \\n -> \\\\n, etc.
Here is a dictionary of user-assigned variables. If the given expression has any of these variables, use its actual value from this dictionary accordingly: {dict_of_vars_str}.
DO NOT USE BACKTICKS OR MARKDOWN FORMATTING.
PROPERLY QUOTE THE KEYS AND VALUES IN THE DICTIONARY FOR EASIER PARSING WITH Python's ast.literal_eval."""


def analyze_image(img: Image.Image, dict_of_vars: dict) -> list[dict]:
    dict_of_vars_str = json.dumps(dict_of_vars, ensure_ascii=False)
    prompt = PROMPT_TEMPLATE.format(dict_of_vars_str=dict_of_vars_str)

    response = model.generate_content([prompt, img])
    logger.info("Gemini raw response: %s", response.text)

    try:
        answers = ast.literal_eval(response.text)
    except (ValueError, SyntaxError) as e:
        logger.error("Failed to parse Gemini response: %s", e)
        raise ValueError(f"Could not parse AI response: {response.text}") from e

    for answer in answers:
        answer["assign"] = "assign" in answer and answer["assign"]

    logger.info("Parsed answers: %s", answers)
    return answers
