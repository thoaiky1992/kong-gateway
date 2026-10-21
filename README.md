# Kong API

Dự án chạy Kong Gateway, PostgreSQL và hai API mẫu (`user-api`, `post-api`) bằng Docker Compose.

## Khởi động dự án

Yêu cầu: Docker và Docker Compose. Chạy các lệnh sau tại thư mục gốc dự án.

1. Tạo file `.env` với mật khẩu PostgreSQL dùng cho Kong:

   ```dotenv
   KONG_PG_PASSWORD=your_password
   ```

2. Khởi động PostgreSQL và chờ dịch vụ sẵn sàng:

   ```bash
   docker compose up -d kong-db
   ```

3. **Chỉ trong lần cài đặt đầu tiên**, khởi tạo database cho Kong:

   ```bash
   docker compose --profile tools run --rm kong-migrations
   ```

4. Tạo tài khoản Basic Auth để mở Kong Manager. Chọn mật khẩu riêng khi được hỏi (lệnh này tạo lại file mật khẩu nếu đã tồn tại):

   ```bash
   htpasswd -cB .htpasswd admin
   ```

   Nếu máy chưa có `htpasswd`, có thể dùng Docker:

   ```bash
   docker run --rm -it -v "$PWD:/work" -w /work httpd:2.4-alpine \
     htpasswd -cB .htpasswd admin
   ```

5. Khởi động Kong, lớp xác thực quản trị và hai API mẫu:

   ```bash
   docker compose up -d --build
   docker compose ps
   ```

Kong Proxy: `http://localhost:8000`; Kong Manager: `http://localhost:8002`. Trình duyệt sẽ hỏi tài khoản `admin` và mật khẩu vừa tạo. Admin API được chuyển qua `http://localhost:8002/_api/` và dùng cùng lớp xác thực. Cổng `8001` của Kong không còn mở trực tiếp trên máy host. Hai API mẫu chạy trong mạng Docker tại `user-api:3000` và `post-api:3001`.

File `.htpasswd` chứa mật khẩu đã băm và được bỏ qua bởi Git. Để đổi mật khẩu, chạy lại bước 4 rồi khởi động lại lớp xác thực bằng `docker compose restart kong-admin-auth`.

Lớp Basic Auth này bảo vệ đường truy cập từ máy host vào giao diện và Admin API. Các container trong mạng `kong-net` vẫn gọi trực tiếp được `http://kong:8001` (như các lệnh decK bên dưới). Nếu cần quản lý người dùng và phân quyền ngay trong Kong, hãy dùng tính năng RBAC của Kong Gateway Enterprise với license phù hợp.

Để dừng các dịch vụ:

```bash
docker compose down
```

## Export và import cấu hình Kong bằng decK

Các lệnh dưới đây dùng mạng `kong-net` do Compose tạo và truy cập Admin API tại `http://kong:8001`. Chạy chúng trong thư mục gốc dự án, nơi có file `kong.yaml`. Lệnh `dump` sẽ ghi đè file này; hãy lưu bản cũ trước nếu cần.

### Kiểm tra kết nối

```bash
docker run --rm --network kong-net \
  kong/deck gateway ping \
  --kong-addr http://kong:8001
```

### Export ra `kong.yaml` trong thư mục hiện tại

```bash
docker run --rm --network kong-net \
  -v "$PWD:/files" -w /files \
  kong/deck gateway dump \
  --kong-addr http://kong:8001 \
  -o kong.yaml
```

### Kiểm tra cấu hình trong file

```bash
docker run --rm --network kong-net \
  -v "$PWD:/files" -w /files \
  kong/deck gateway validate \
  --kong-addr http://kong:8001 kong.yaml
```

### Xem Kong sẽ thêm, sửa hoặc xóa những gì

```bash
docker run --rm --network kong-net \
  -v "$PWD:/files" -w /files \
  kong/deck gateway diff \
  --kong-addr http://kong:8001 kong.yaml
```

### Import sau khi đã xem diff

```bash
docker run --rm --network kong-net \
  -v "$PWD:/files" -w /files \
  kong/deck gateway sync \
  --kong-addr http://kong:8001 kong.yaml
```
