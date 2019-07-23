from flask import Flask, escape, request, render_template

app = Flask(__name__)

@app.route('/')
def hello():
    return render_template('index.html', jsonname = './graph_try_all.json')

@app.route('/<jsonname>')
def changeJson(jsonname):
    return render_template('index.html', jsonname = jsonname)
