package kafka

import (
	"fmt"
	"log"
	"os"

	ckafka "github.com/confluentinc/confluent-kafka-go/kafka"
)

type KafkaConsumer struct {
	MsgChan chan *ckafka.Message
}

func(k *KafkaConsumer) Consume(){
	configMap := &ckafka.ConfigMap{
		"bootstrap.servers": os.Getenv("KafkaBootstrapServers"),
		"group.id": os.Getenv("KafkaConsumerGroupId"),

	}
	c, err := ckafka.NewConsumer(configMap)
	if err != nil {
		log.Fatalf("error consumig kafka message" + err.Error())
	}
	topics := []string{os.Getenv("KafkaReadTopic")}
	c.SubscribeTopics(topics,nil)
	fmt.Println("Kafka Consumer has been started")
	for {
		msg, err := c.ReadMessage(-1)
		if err == nil {
			k.MsgChan <- msg
		}
	}
}