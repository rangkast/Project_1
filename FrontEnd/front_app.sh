#front app
pm2 delete front_app;
pm2 start ./front_app.js -i 0 --name front_app;
echo 'start front_app by pm2';
pm2 save;
sleep 1;
echo 'done...';
exit;
