FROM golang:1.21-alpine

WORKDIR /app

# Install git for downloading go packages
RUN apk add --no-cache git

COPY . .

# Initialize module and fetch dependencies dynamically
RUN go mod init visual_algo_backend
RUN go get github.com/gin-contrib/cors
RUN go get github.com/gin-gonic/gin
RUN go get github.com/google/uuid
RUN go get github.com/docker/docker/client
RUN go get gorm.io/driver/postgres
RUN go get gorm.io/gorm
RUN go get gorm.io/datatypes
RUN go mod tidy

# Build the binary
RUN go build -o server .

EXPOSE 8080

CMD ["./server"]
