from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json


app = Flask(__name__)


MONGODB_HOST = 'ds145295.mlab.com'
MONGODB_PORT = 45295
DBS_NAME = 'heroku_f5hxrt7w'
COLLECTION_NAME = 'stats'
MONGO_URI = 'mongodb://admin:admin@ds145295.mlab.com:45295/heroku_f5hxrt7w'

FIELDS = {'ID':True,'WAGE':True,'OCCUPATION': True,'SECTOR':True, 'UNION':True,'EDUCATION':True,'EXPERIENCE':True, 'AGE':True, 'SEX':True, 'MARR':True, "RACE":True,"SOUTH":True, '_id':False }


@app.route('/')
def index():
    return render_template("index.html")

@app.route("/wages")
def wages():
    connection = MongoClient(MONGO_URI)
    collection = connection[DBS_NAME][COLLECTION_NAME]
    wages = collection.find(projection=FIELDS, limit=1000)
    json_wages = []
    for wage in wages:
        json_wages.append(wage)
    json_wages = json.dumps(json_wages)
    connection.close()
    return json_wages


if __name__ == '__main__':
    app.run()
