package handlers

import (
	"net/http"
	"os/exec"

	"github.com/gin-gonic/gin"
)

func ReloadACL(c *gin.Context) {
	cmd := exec.Command("docker", "kill", "--signal", "HUP", "headscale")
	output, err := cmd.CombinedOutput()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"result": string(output)})
}
