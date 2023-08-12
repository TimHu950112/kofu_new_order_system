from flask import Flask, session, render_template
from flask_restful import Api
from resources.login import *
from resources.function import*
from dotenv import load_dotenv
from datetime import date, datetime, time, timedelta
import pymongo,os,certifi

load_dotenv()

#初始化資料庫連線
client=pymongo.MongoClient("mongodb+srv://"+os.getenv("mongodb")+".rpebx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",tlsCAFile=certifi.where())
db=client.order_center
users=db['users']
customer=db.customer
print('\x1b[6;30;42m' + '資料庫連線成功'.center(87) + '\x1b[0m')

app = Flask(__name__)
app.secret_key = "your_secret_key"

# LINE 聊天機器人的基本資料
line_bot_api = LineBotApi(os.getenv('line_access'))
handler = WebhookHandler(os.getenv('line_secret'))


# 登入檢查裝飾器
def login_required(func):
    def wrapper(*args, **kwargs):
        if 'username' in session:
            return func(*args, **kwargs)
        else:
            flash('請先登入')
            return redirect('/login')
    return wrapper

# 加載api
api = Api(app)
api.add_resource(LoginResource, '/login', resource_class_kwargs={'users': users})
api.add_resource(LogoutResource, '/logout')
api.add_resource(RegisterResource, '/register', resource_class_kwargs={'users': users})
api.add_resource(Finish_Order, '/finish_order/<string:order_id>')
api.add_resource(Delete_Order, '/delete_order/<string:order_id>')
api.add_resource(Send_Order, '/send_order/<string:order_list>/<string:order_detail>')
api.add_resource(Html_List,'/html_list/<string:date>')
api.add_resource(Key_Setting,'/key_setting/<string:setting>')

@app.before_request
def before_request():
    session.permanent = True
    app.permanent_session_lifetime = timedelta(days=30)  # 設定 session 的有效期限

# 登入頁面
@app.route('/login')
def login():
    return render_template('login.html')

#Home_page
@app.route('/')
@login_required
def home():
    return render_template('home.html')

@app.route('/page')
def test():
    return render_template('test.html')

@app.route('/callback',methods=['POST'])
def callback():
    signature = request.headers['X-Line-Signature']

    body = request.get_data(as_text=True)
    app.logger.info("Request body: " + body)

    try:
        handler.handle(body, signature)
    except InvalidSignatureError:
        abort(400)

    return 'OK'

#line_reply
@handler.add(MessageEvent, message=TextMessage)
def echo(event):
    if event.message.text.isnumeric() == True:
        line_bot_api.reply_message(event.reply_token,TextSendMessage(bind_key(str(line_bot_api.get_profile(event.source.user_id).display_name),event.message.text,event.source.user_id)))
    if event.message.text=='test':
        line_bot_api.reply_message(event.reply_token,TextSendMessage('test'))
    if '/key' in event.message.text:
        print(event.message.text.split(' ')[1])
        line_bot_api.reply_message(event.reply_token,TextSendMessage('【密鑰列表】\n'+get_key(event.message.text.split(' ')[1]) ))
    # line_bot_api.multicast([], )
    return 200

@app.route('/notify')
def notify():
    line_bot_api.multicast(list(list(customer.find({'name':request.args.get('name')}))[0]['user'].values()), TextSendMessage(text=request.args.get('text')))
    return 200


if __name__ == '__main__':
    app.run(debug=True,port=5000)
