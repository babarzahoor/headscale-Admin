package handlers

import (
	"encoding/json"
	"math"
	"net/http"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
)

func DataUsage(c *gin.Context) {
	// Open the data.json file
	file, err := os.Open("data_usage.json")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open data.json"})
		return
	}
	defer file.Close()

	// Read and parse the JSON data
	var jsonData map[string]map[string]string
	err = json.NewDecoder(file).Decode(&jsonData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse data.json"})
		return
	}

	// Process recv and sent data
	newRecv := processData(jsonData["recv"])
	newSent := processData(jsonData["sent"])

	// Create the response
	newData := gin.H{
		"recv": newRecv,
		"sent": newSent,
	}

	c.JSON(http.StatusOK, newData)
}

func processData(data map[string]string) map[string]string {
	keys := []string{"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y"}
	newData := make(map[string]string)

	for i := 0; i < len(keys)-1; i++ {
		val1, _ := strconv.Atoi(data[keys[i]])                    // Convert string to int
		val2, _ := strconv.Atoi(data[keys[i+1]])                  // Convert string to int
		diff := math.Ceil(float64(val2 - val1))                   // Calculate the difference
		newData[keys[i]] = strconv.FormatFloat(diff, 'f', -1, 64) // Convert float64 to string
	}

	return newData
}
