package config

import (
	"strings"

	"github.com/spf13/viper"
)

type Config struct {
	Lotus struct {
		RpcUrl string
	}

	Db struct {
		ConnectionString string
		Name             string
	}
}

func LoadConfiguration() (*Config, error) {
	// from the environment
	viper.SetEnvPrefix("CID")
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	viper.AutomaticEnv()

	// from a config file
	viper.SetConfigName("config")
	viper.AddConfigPath("./")

	if err := viper.ReadInConfig(); err != nil {
		return nil, err
	}

	var C *Config
	if err := viper.Unmarshal(&C); err != nil {
		return nil, err
	}

	return C, nil
}
