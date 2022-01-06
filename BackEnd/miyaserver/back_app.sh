#back app
pm2 delete back_app;
pm2 start ./back_app.py -i 0 --name back_app;
echo 'start back_app by pm2';
pm2 save;
sleep 1;
echo 'done...';
exit;
