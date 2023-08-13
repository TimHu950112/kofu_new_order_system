from flask import*
from resources.login import*
from dotenv import load_dotenv
from datetime import datetime
from linebot import LineBotApi, WebhookHandler
from linebot.exceptions import InvalidSignatureError
from linebot.models import MessageEvent, TextMessage, TextSendMessage
import pymongo,os,certifi,pytz,io,base64
import pandas as pd

load_dotenv()

#初始化資料庫連線
client=pymongo.MongoClient("mongodb+srv://"+os.getenv("mongodb")+".rpebx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",tlsCAFile=certifi.where())
db=client.order_center
order=db.order
customer=db.customer
print('\x1b[6;30;42m' + '資料庫連線成功'.center(87) + '\x1b[0m')

def generate_random_key(length):
    characters = string.digits  
    random_key = ''.join(random.choice(characters) for _ in range(length))
    return random_key

def get_order_id():
    print(list(order.find({},{"_id":1}).sort("_id",-1))[0]['_id']+1)

def get_notify_list(name):
    return list(customer.find({"name":name}))

def get_key(name):
    result=list(customer.find({'name':name}))
    if len(result)!=0:
        return str(result[0]['key'])
    key=[]
    for i in range(0,5):
        random_key = generate_random_key(10)
        print(random_key)
        key.append(random_key)
    customer.insert_one({
    'name':name,
    'key':key,
    'user':{}
    })
    return str(key)

def bind_key(user,key,line_id):
    result=list(customer.find({'key':key}))
    if len(result)!=0:
        customer.update_one({ '_id': result[0]['_id'] },{ '$pull': { 'key': key } })
        customer.update_one({'_id': result[0]['_id'] },{ '$set': { "user."+user: line_id } })
        return '成功綁定-'+result[0]['name']
    else:
        return '無效的密鑰或發生錯誤，請聯繫客服'


class Finish_Order(Resource):
    @login_required
    def get(self,order_id):
        order.update_one({"_id":int(order_id)},{"$set":{"status":1}})
        result=list(order.find({'_id':int(order_id)}))[0]
        if len(list(customer.find({'name':result['customer']})))!=0 :
            text='【商品送達通知】\n【地點】'+result['location']+'\n【商品內容】'
            for i in result['order_list']:
                text+='\n'+i+':'+str(result['order_list'][i])
            return jsonify(name=result['customer'],text=text)
        return jsonify(name='none',text='none')

class Delete_Order(Resource):
    @login_required
    def get(self,order_id):
        order.update_one({"_id":int(order_id)},{"$set":{"disable":1}})
        return jsonify(order_id='success'+order_id)

class Send_Order(Resource):
    @login_required
    def post(self,order_list,order_detail):
        order_list=list(json.loads(order_list))
        order_detail=list(json.loads(order_detail))[0]
        mongodb_list=[]
        mongodb_dict={}
        for i in order_list:
            for r in i:
                mongodb_list.append(i[r])
        for i in range(0,int(len(mongodb_list))):
            if i%2==0:
                mongodb_dict[mongodb_list[i]]= mongodb_list[i+1]  
        time=order_detail['order_time'].replace("T","-").split("-")
        order.insert_one({
            '_id':list(order.find({},{"_id":1}).sort("_id",-1))[0]['_id']+1,
            'order_list':mongodb_dict,
            'location':order_detail['location'],
            'customer':order_detail['customer'],
            'year':time[0],
            'month':time[1],
            'date':time[2],
            'time':time[3],
            'status':0,
            'disable':0
        })
        return 'success'
    
class Html_List(Resource):
    @login_required
    def get(self,date):
        order_id=list(order.find({},{"_id":1}).sort("_id",-1))[0]['_id']+1
        if date!='all':
            if not '_id' in date :
                if date=='today':
                    date=datetime.now(pytz.timezone('Asia/Taipei')).strftime('%Y-%m-%d').split("-")
                else:
                    date=date.split("-")
                result=list(order.find({"$and":[{"year":date[0]},{"month":date[1]},{"date":date[2]},{"disable":0}]}).sort([["status",1],["location",1],["year",1],["month",1],["date",1],['time',1]]))
                print(result)
            else:
                result=list(order.find({"$and":[{"_id":int(date.split('_id')[1])},{"disable":0}]}).sort([["status",1],["location",1],["year",1],["month",1],["date",1],['time',1]]))
        else:
            result=list(order.find({"disable":0}).sort([["status",1],["location",1],["year",1],["month",1],["date",1],['time',1]]))

        return jsonify(order_id=order_id,html_order_list=json.dumps(result))

class Key_Setting(Resource):
    @login_required
    def get(self,setting):
        if setting=='load_page':
            return make_response(render_template('key.html'))
        elif setting=='get_key':
            return jsonify(data=json.dumps(list(customer.find({},{'name':1,'key':1,'user':1,'_id':0}))))
            
class Download_Excel(Resource):
    @login_required
    def get(self,selection):
        id_list=[]
        customer_list=[]
        time_list=[]
        location_list=[]
        order_list=[]
        status_list=[]
        selection=selection.split('-')
        for i in json.loads(request.args.get('table_data')):
            if len(selection)!=3:
                if selection[0] in i['order_list'] and i['disable']!=1:
                    id_list.append(i['_id'])
                    customer_list.append(i['customer'])
                    time_list.append(i['year']+'-'+i['month']+'-'+i['date']+' '+i['time'])
                    location_list.append(i['location'])
                    order_list.append(str(i['order_list']))
                    if i['status']==0:
                        status_list.append('未完成')
                    else:
                        status_list.append('已完成')
            else:
                if i['disable']!=1:
                    if selection[0] in i['order_list'] or selection[1] in i['order_list'] or selection[2] in i['order_list']:
                        id_list.append(i['_id'])
                        customer_list.append(i['customer'])
                        time_list.append(i['year']+'-'+i['month']+'-'+i['date']+' '+i['time'])
                        location_list.append(i['location'])
                        order_list.append(str(i['order_list']))
                        if i['status']==0:
                            status_list.append('未完成')
                        else:
                            status_list.append('已完成')

        data = {
        '_id': id_list,
        '時間':time_list,
        '地點':location_list,
        '議員': customer_list,
        '商品清單':order_list,
        '狀態':status_list,
        }
        df = pd.DataFrame(data)

        # 將 DataFrame 寫入 Excel 檔案
        excel_file = io.BytesIO()
        with pd.ExcelWriter(excel_file, engine='xlsxwriter') as writer:
            df.to_excel(writer, sheet_name='Sheet1', index=False)

       # 將 Excel 檔案的內容轉為 base64 編碼
        excel_base64 = base64.b64encode(excel_file.getvalue()).decode('utf-8')

        # 返回包含下載連結的 JSON 資料
        return {'download_url': f'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,{excel_base64}'}