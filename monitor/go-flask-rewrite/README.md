# Go Flask Rewrite

This project is a Go implementation of a Flask application that provides system and network information through a RESTful API. The application includes several endpoints to retrieve system metrics, reload configurations, and manage network data usage records.

## Project Structure

```
go-flask-rewrite
├── cmd
│   └── main.go               # Entry point of the application
├── internal
│   ├── handlers              # Contains handler functions for API routes
│   │   ├── info.go           # Handler for "/info" route
│   │   ├── reload_acl.go      # Handler for "/reload_acl" route
│   │   ├── data_record.go     # Handler for "/data_record" route
│   │   └── data_usage.go      # Handler for "/data_usage" route
│   ├── models                # Contains data structures
│   │   └── data.go           # Data models for network usage records
│   └── utils                 # Utility functions
│       ├── system_info.go    # Functions for retrieving system information
│       └── file_operations.go # Functions for file operations (read/write JSON)
├── go.mod                    # Module definition and dependencies
├── go.sum                    # Dependency checksums
└── README.md                 # Project documentation
```

## API Endpoints

- **GET /info**: Returns system information including CPU usage, memory usage, and network statistics.
- **GET /reload_acl**: Sends a signal to the Docker container to reload the ACL configuration.
- **GET /data_record**: Records the current network data usage into a JSON file.
- **GET /data_usage**: Reads the recorded data from the JSON file and processes it to return network usage statistics.

## Getting Started

1. Clone the repository:
   ```
   git clone <repository-url>
   cd go-flask-rewrite
   ```

2. Install dependencies:
   ```
   go mod tidy
   ```

3. Run the application:
   ```
   go run cmd/main.go
   ```

4. Access the API at `http://localhost:5000`.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.