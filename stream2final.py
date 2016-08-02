from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json


app = Flask(__name__)


MONGODB_HOST = 'localhost'
MONGODB_PORT = 27017
DBS_NAME = 'wagesdata'
COLLECTION_NAME = 'wages'
FIELDS = {'ID':True,'WAGE':True,'OCCUPATION 1=Management 2=Sales 3=Clerical 4=Service 5=Professional 6=Other': True,'SECTOR 0=Other 1=Manufacturing 2=Construction':True, 'UNION 1=Union member 0=Not union member':True,'EDUCATION':True,'EXPERIENCE':True, 'AGE':True, 'SEX 1=Female 0=Male':True, 'MARR 0=Unmarried 1=Married':True, "RACE 1=Other 2=Hispanic 3=White":True,"SOUTH 1=Person lives in South 0=Person lives elsewhere":True, '_id':False }


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
