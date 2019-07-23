from flask import Flask, escape, request, render_template
from werkzeug.serving import run_with_reloader
from datetime import timedelta
from os import path
import os
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
    if not jsonname:
        return render_template('index.html', jsonname = './graph_try_all.json')
    else:
        return render_template('index.html', jsonname = jsonname)

# @app.route('/chpara', methods=['POST'])
# def chpara():


if __name__ == '__main__':
    app.run(debug=True, extra_files=extra_files)
