import subprocess
import sys

try:
    from flask import Flask
except ImportError:
    print("Flask is not installed. Installing now...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "flask"])
    from flask import Flask

app = Flask(__name__)

@app.route("/")
def alive():
    return "Alive"

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
