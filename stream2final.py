from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json


app = Flask(__name__)


MONGODB_HOST = 'localhost'
MONGODB_PORT = 27017
DBS_NAME = 'wagesdata'
COLLECTION_NAME = 'wages'
FIELDS = {'ID':True,'WAGE':True,'OCCUPATION': True,'SECTOR':True, 'UNION':True,'EDUCATION':True,'EXPERIENCE':True, 'AGE':True, 'SEX':True, 'MARR':True, "RACE":True,"SOUTH":True, '_id':False }


@app.route('/')
def index():
    return render_template("index.html")

@app.route("/wages")
def wages():
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
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
