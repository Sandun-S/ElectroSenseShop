cd D:\bussiness\ElectroSenseShop\shop-admin
npm install
npm run dev

cd D:\bussiness\ElectroSenseShop\shop-frontend
npm install
npm run dev

npm install -g firebase-tools
firebase login

firebase use electrosense-shop  or firebase use --add     > default
firebase target:apply hosting shop electrosense-shop
firebase target:apply hosting admin electrosense-admin






Build the shop app:

cd shop-frontend
npm run build
cd ..

Build the admin app:

cd shop-admin
npm run build
cd ..

Now deploy:

firebase deploy
firebase deploy --only firestore