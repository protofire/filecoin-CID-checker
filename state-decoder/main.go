package main

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"net/http"

	"github.com/filecoin-project/specs-actors/actors/builtin/miner"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	ginlogrus "github.com/toorop/gin-logrus"
)

func main() {
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.Use(ginlogrus.Logger(log.New()), gin.Recovery(), cors.Default())

	router.POST("/", CreateDecodeHandler())

	log.Fatal(router.Run(":8080"))
}

type Request struct {
	State string
}

type Response struct {
	State      miner.State
	Faults     []uint64
	Recoveries []uint64
}

func CreateDecodeHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		var request Request
		if err := c.BindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		minerStateBytes, err := base64.StdEncoding.DecodeString(request.State)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		minerStateBuf := bytes.NewBuffer(minerStateBytes)
		minerState := miner.State{}

		if err := minerState.UnmarshalCBOR(minerStateBuf); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Errorf("failed minerState.UnmarshalCBOR: %w", err),
			})
			return
		}

		faultSectors, err := minerState.Faults.All(^uint64(0))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		recoveriesSectors, err := minerState.Recoveries.All(^uint64(0))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, Response{
			State:      minerState,
			Faults:     faultSectors,
			Recoveries: recoveriesSectors,
		})
	}
}
