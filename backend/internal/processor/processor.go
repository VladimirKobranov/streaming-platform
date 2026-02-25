package processor

import (
	"log"
	"sync"
	"time"

	"labbase-streaming/backend/internal/ffmpeg"
	"labbase-streaming/backend/internal/models"
	"labbase-streaming/backend/internal/storage"
)

type Processor struct {
	storage *storage.Storage
	encoder *ffmpeg.Encoder
	videos  map[string]*models.Video
	mu      sync.RWMutex
}

func NewProcessor(s *storage.Storage, e *ffmpeg.Encoder) *Processor {
	return &Processor{
		storage: s,
		encoder: e,
		videos:  make(map[string]*models.Video),
	}
}

func (p *Processor) CreateVideo(id string) *models.Video {
	p.mu.Lock()
	defer p.mu.Unlock()

	video := &models.Video{
		ID:        id,
		Status:    models.StatusProcessing,
		Path:      p.storage.GetHLSPath(id),
		CreatedAt: time.Now(),
	}
	p.videos[id] = video
	return video
}

func (p *Processor) GetVideo(id string) (*models.Video, bool) {
	p.mu.RLock()
	defer p.mu.RUnlock()

	v, ok := p.videos[id]
	return v, ok
}

func (p *Processor) ProcessVideo(id string) {
	go func() {
		inputPath := p.storage.GetRawPath(id)
		outputDir := p.storage.GetHLSPath(id)

		if err := p.storage.CreateHLSDir(id); err != nil {
			log.Printf("failed to create HLS dir for %s: %v", id, err)
			return
		}

		if err := p.encoder.ConvertToHLS(inputPath, outputDir); err != nil {
			log.Printf("failed to process video %s: %v", id, err)
			return
		}

		p.mu.Lock()
		if v, ok := p.videos[id]; ok {
			v.Status = models.StatusReady
		}
		p.mu.Unlock()

		log.Printf("Video %s processed successfully", id)
	}()
}
