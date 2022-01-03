from flask import Flask, render_template, json, request, redirect, session
from flaskext.mysql import MySQL
from auth import SHA256

mysql = MySQL()
app = Flask(__name__)
app.secret_key = 'back to the idea'

# MySQL configurations
app.config['MYSQL_DATABASE_USER'] = 'miya'
app.config['MYSQL_DATABASE_PASSWORD'] = 'LGEwjdwns10.'
app.config['MYSQL_DATABASE_DB'] = 'MiyaUserDB'
app.config['MYSQL_DATABASE_HOST'] = 'localhost'
mysql.init_app(app)

@app.route('/')
def main():
    return render_template('index.html')

@app.route('/showSignUp')
def showSignUp():
    return render_template('signup.html')

@app.route('/users/signin')
def showSignin():
    return render_template('signin.html')

@app.route('/userMain')
def userHome():
    if session.get('user'):
        return render_template('userMain.html')
    else:
        return render_template('error.html',error = 'Unauthorized Access')
        
@app.route('/signupok')
def signok():
    print('sign up ok render signok.html')
    return render_template('signok.html')

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect('/')

@app.route('/validateLogin',methods=['POST'])
def validateLogin():
    print('enterValidateLogin')
    try:
        _username = request.form['inputUser']
        _password = request.form['inputPassword']
               
        # connect to mysql
        con = mysql.connect()
        cursor = con.cursor()
        cursor.callproc('sp_validateLogin',(_username,))
        data = cursor.fetchall()

        if len(data) > 0:
            if SHA256.encrypt(_password) == str(data[0][3]):
                session['user'] = data[0][0]
                return redirect('/userMain')
            else:
                return render_template('error.html',error = 'Wrong User Name or Password.')
        else:
            return render_template('error.html',error = 'Wrong User Name or Password.')          

    except Exception as e:
        return render_template('error.html',error = str(e))
    finally:
        cursor.close()
        con.close()

@app.route('/signup',methods=['POST','GET'])
def signUp():
    try:
        _name = request.form['inputName']
        _email = request.form['inputEmail']
        _password = request.form['inputPassword']

        # validate the received values
        
        if _name and _email and _password:
            print('start db setting')            
            conn = mysql.connect()
            cursor = conn.cursor()
            _hashed_password = SHA256.encrypt(_password)
            print('input pw='+_password)
            print('hashed_PW='+_hashed_password)
            cursor.callproc('sp_createUser',(_name,_email,_hashed_password))
            data = cursor.fetchall()

            if len(data) == 0:
                conn.commit()
                print('User created successfully !')
                # return json.dumps({'message':'User created successfully !'})
                return redirect('/signupok')
            else:
                # return json.dumps({'error':str(data[0])})
                return render_template('error.html',error = str(data[0]) )
        else:
            # return json.dumps({'html':'<span>Enter the required fields</span>'})
            return render_template('error.html',error = 'Enter the required fields.' )

    except Exception as e:
        return json.dumps({'error':str(e)})
    finally:
        cursor.close() 
        conn.close()
        

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
