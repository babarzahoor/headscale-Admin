package handlers

import (
	"math"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/net"
)

func GetInfo(c *gin.Context) {
	// 获取 CPU 使用率
	cpuUsage, _ := cpu.Percent(0, false)

	// 获取内存使用率
	memory, _ := mem.VirtualMemory()

	// 获取网卡信息
	netInterface := c.DefaultQuery("interface", "eth0") // 默认网卡为 eth0
	netIO, _ := net.IOCounters(true)

	var sentSpeed, recvSpeed int64
	for _, iface := range netIO {
		if iface.Name == netInterface {
			sentSpeed = int64(math.Ceil(float64(iface.BytesSent) / 1024))
			recvSpeed = int64(math.Ceil(float64(iface.BytesRecv) / 1024))
			break
		}
	}

	// 构建返回数据
	info := gin.H{
		"cpu_usage":            cpuUsage[0],
		"memory_usage_percent": memory.UsedPercent,
		"sent_speed":           sentSpeed,
		"recv_speed":           recvSpeed,
	}

	c.JSON(http.StatusOK, info)
}
