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
}

func NewProcessor(s *storage.Storage, e *ffmpeg.Encoder) *Processor {
	p := &Processor{
		storage: s,
		encoder: e,
		videos:  make(map[string]*models.Video),
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
			CreatedAt: time.Now(), // Мы не храним точное время без БД, ставим текущее
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

func (p *Processor) ListVideos() []*models.Video {
	p.mu.RLock()
	defer p.mu.RUnlock()

	videos := make([]*models.Video, 0, len(p.videos))
	for _, v := range p.videos {
		videos = append(videos, v)
	}
	return videos
}

func (p *Processor) DeleteVideo(id string) bool {
	p.mu.Lock()
	defer p.mu.Unlock()

	video, ok := p.videos[id]
	if !ok {
		return false
	}

	if err := os.RemoveAll(video.Path); err != nil {
		log.Printf("failed to delete video files for %s: %v", id, err)
	}

	rawPath := p.storage.GetRawPath(id)
	if err := os.Remove(rawPath); err != nil {
		log.Printf("failed to delete raw file for %s: %v", id, err)
	}

	delete(p.videos, id)
	return true
}

func (p *Processor) GetStorage() *storage.Storage {
	return p.storage
}
