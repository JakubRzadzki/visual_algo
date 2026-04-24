FROM golang:alpine

WORKDIR /app

# Install git for downloading go packages
RUN apk add --no-cache git

COPY . .

# Download dependencies and generate go.sum using the locked go.mod
RUN go mod tidy

# Build the binary
RUN go build -o server .

EXPOSE 8080

CMD ["./server"]
