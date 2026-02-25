package processor

import (
	"log"
	"os"
	"sync"
	"time"

	"labbase-streaming/backend/ffmpeg"
	"labbase-streaming/backend/models"
	"labbase-streaming/backend/storage"
)

type Processor struct {
	storage *storage.Storage
	encoder *ffmpeg.Encoder
	videos  map[string]*models.Video
	mu      sync.RWMutex
	sem     chan struct{}
}

func NewProcessor(s *storage.Storage, e *ffmpeg.Encoder) *Processor {
	p := &Processor{
		storage: s,
		encoder: e,
		videos:  make(map[string]*models.Video),
		sem:     make(chan struct{}, 2),
	}
	p.LoadExistingVideos()
	return p
}

func (p *Processor) LoadExistingVideos() {
	ids, err := p.storage.ListVideos()
	if err != nil {
		log.Printf("failed to list existing videos: %v", err)
		return
	}

	p.mu.Lock()
	defer p.mu.Unlock()

	for _, id := range ids {
		p.videos[id] = &models.Video{
			ID:        id,
			Status:    models.StatusReady,
			Path:      p.storage.GetHLSPath(id),
			CreatedAt: time.Now(),
		}
	}
	if len(ids) > 0 {
		log.Printf("Loaded %d existing videos from storage", len(ids))
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

func (p *Processor) ListVideos() []*models.Video {
	p.mu.RLock()
	defer p.mu.RUnlock()

	videos := make([]*models.Video, 0, len(p.videos))
	for _, v := range p.videos {
		videos = append(videos, v)
	}
	return videos
}

func (p *Processor) ProcessVideo(id string) {
	go func() {
		p.sem <- struct{}{}
		defer func() { <-p.sem }()

		inputPath := p.storage.GetRawPath(id)
		outputDir := p.storage.GetHLSPath(id)

		if err := p.storage.CreateHLSDir(id); err != nil {
			log.Printf("failed to create HLS dir for %s: %v", id, err)
			p.mu.Lock()
			if v, ok := p.videos[id]; ok {
				v.Status = models.StatusError
				v.Error = "failed to create HLS directory"
			}
			p.mu.Unlock()
			return
		}

		if err := p.encoder.ConvertToHLS(inputPath, outputDir); err != nil {
			log.Printf("failed to process video %s: %v", id, err)
			p.mu.Lock()
			if v, ok := p.videos[id]; ok {
				v.Status = models.StatusError
				v.Error = err.Error()
			}
			p.mu.Unlock()
			return
		}

		if err := os.Remove(inputPath); err != nil {
			log.Printf("failed to delete raw file for %s: %v", id, err)
		} else {
			log.Printf("cleaned up raw file for %s", id)
		}

		p.mu.Lock()
		if v, ok := p.videos[id]; ok {
			v.Status = models.StatusReady
		}
		p.mu.Unlock()

		log.Printf("Video %s processed successfully", id)
	}()
}
