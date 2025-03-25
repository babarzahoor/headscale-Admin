package handlers

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
)

func DataRecord(c *gin.Context) {
	// Simulate fetching system info
	info := map[string]interface{}{
		"recv_speed": 1024.0, // Example value
		"sent_speed": 2048.0, // Example value
	}

	recvSpeed := info["recv_speed"].(float64)
	sentSpeed := info["sent_speed"].(float64)

	// Read local data.json file
	file, err := os.Open("data.json")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open data.json"})
		return
	}
	defer file.Close()

	content, _ := ioutil.ReadAll(file)
	var jsonData map[string]map[string]string
	err = json.Unmarshal(content, &jsonData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse data.json"})
		return
	}

	// Update data
	keys := []string{"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y"}
	for i := 0; i < len(keys)-1; i++ {
		jsonData["sent"][keys[i]] = jsonData["sent"][keys[i+1]]
		jsonData["recv"][keys[i]] = jsonData["recv"][keys[i+1]]
	}

	jsonData["sent"]["y"] = formatFloat(sentSpeed)
	jsonData["recv"]["y"] = formatFloat(recvSpeed)

	// Write back to file
	file, err = os.Create("data.json")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write to data.json"})
		return
	}
	defer file.Close()

	err = json.NewEncoder(file).Encode(jsonData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encode data.json"})
		return
	}

	c.JSON(http.StatusOK, jsonData)
}

func formatFloat(f float64) string {
	return strconv.FormatFloat(f, 'f', -1, 64)
}
