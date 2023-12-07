
### <h1>SOURCE CODE ĐỒ ÁN BẤT ĐỘNG SẢN</h1>

<h3>Tên đồ án: Xây dựng ứng dụng quản lý thông tin bất động sản trên nền tảng dịch vụ điện toán đám mây AWS.</h3>

<h3>SOURCE BACKEND</h3>


## Cách cài đặt

# Bước 1: Clone Project
```
    git clone https://<token>@github.com/Yuiichann/api-batdongsan.git
```

<br>

## Bước 2: Install node Modules

```
    npm i 
```

<p>Hoặc</p>

```
    yarn
```

<br>

## Bước 3: Cấu hình biến môi trường

```
    - NODE_ENV: môi trường
    - DATABASE_URL: url database mongodb
    - ACCESS_TOKEN_SECRET: token mã hóa 
    - REFRESH_TOKEN_SECRET: token mã hóa
    - AWS_ACCESS_KEY_ID: thông tin để access vào account AWS
    - AWS_SECRET_ACCESS_KEY: thông tin để access vào account AWS
    - AWS_REGION: thông tin để access vào account AWS
    - AWS_BUCKET: thông tin để access vào account AWS
    - GMAIL_APP_USERNAME: gmail username.
    - GMAIL_APP_PASSWORD: app password của gmail.
    - CLIENT_URL: các domain client có thể truy cập vào server, viết cách nhau với dấu , VD: http://localhost:3000,http://localhost:3001
    - ADMIN_URL: các domain admin truy cập vào website
    - PRODUCT_CLIENT_URL: https://batdongsanvn.fun
    - PRODUCTION_ADMIN_URL: https://admin.batdongsanvn.fun
```

<br>

## BƯỚC CUỐI: chạy app

```
    yarn dev || npm run dev
```

