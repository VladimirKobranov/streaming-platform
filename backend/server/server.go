package server

import (
	"labbase-streaming/backend/config"
	"labbase-streaming/backend/processor"
	"labbase-streaming/backend/storage"
)

type Server struct {
	processor *processor.Processor
	storage   *storage.Storage
	config    *config.Config
}

func NewServer(p *processor.Processor, s *storage.Storage, cfg *config.Config) *Server {
	return &Server{
		processor: p,
		storage:   s,
		config:    cfg,
	}
}
