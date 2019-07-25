from flask import Flask, escape, request, render_template, url_for, jsonify
from werkzeug.serving import run_with_reloader
from datetime import timedelta
from os import path
import os
import numpy as np
import matplotlib.pyplot as plt
from igraph import *
import pandas as pd
import requests


from process import processData

dismatP = './static/npydata/dismat.npy'
namesP = './static/npydata/names_train.npy'

extra_dirs = ['./staic','./templates']
extra_files = extra_dirs[:]
for extra_dir in extra_dirs:
    for dirname, dirs, files in os.walk(extra_dir):
        for filename in files:
            filename = path.join(dirname, filename)
            if path.isfile(filename):
                extra_files.append(filename)


app = Flask(__name__, template_folder="./templates", static_folder="./static")
app.jinja_env.auto_reload = True 
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = timedelta(seconds=1)
app.config['DEBUG'] = True

@app.route('/', methods=['GET'])
def changeJson():
    jsonname = request.args.get('file')

    if jsonname:
        return render_template('index.html', jsonname = jsonname)
    else:
        return render_template('index.html', jsonname = './graph_try_all.json')

@app.route('/chpara/<threshold>', methods=['GET'])
def chpara(threshold):
    #treshold = request.form.get('Treshold')
    # maxdegree = request.form.get('maxdegree')
    print(threshold)
    print("\n\n\n\n")
    # print(maxdegree)
    print("\n\n\n\n")
    newfile = processData(dismatP, namesP, eval(threshold))
    #return render_template('index.html', jsonname = newfile)
    return jsonify(newfile)

if __name__ == '__main__':
    app.run(debug=True, extra_files=extra_files, host='0.0.0.0', port=80)
    # app.run(debug=True, extra_files=extra_files)
