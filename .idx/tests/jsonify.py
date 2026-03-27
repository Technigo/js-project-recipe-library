from flask import Flask, request, jsonify
import re

app= Flask(__name__)
def validate_password(password):
    """
    Validate the strength of a password
    A strong password must contain at least:
    - 8 characters
    - 1 uppercase letter
    - 1 lowercase letter
    - 1 digit
    - 1 special character
    """
    if (len(password) < 8 or
        not re.search(r"[A-Z]", password) or
        not re.search(r"[a-z]", password) or
        not re.search(r"[0-9]", password) or
        not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password)):
        return False
    return True

@app.route('/signup', methods=['POST'])
def sinup():
    data = request.get_json()
    
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
    if not validate_password(password):
        return jsonify({"error": "Password is not strong enough"}), 400
    # Here you would normally save the user to your database
    # For simplicity we will just return a succesful message

    return jsonify({"message": "User signed up succesfully"}), 200

if __name__ == '__main__':
    app.run(debug=True)