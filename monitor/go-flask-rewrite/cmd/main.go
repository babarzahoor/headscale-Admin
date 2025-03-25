package main

import (
	"go-flask-rewrite/internal/handlers"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.GET("/reload_acl", handlers.ReloadACL)
	r.GET("/info", handlers.GetInfo)
	r.GET("/data_record", handlers.DataRecord)
	r.GET("/data_usage", handlers.DataUsage)

	r.Run(":5000") // 监听 5000 端口
}
