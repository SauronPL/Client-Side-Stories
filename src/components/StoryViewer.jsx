import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSwipeable } from 'react-swipeable';
import './StoryViewer.css';

// SVG Icons
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);


const StoryViewer = ({ storySet, onClose, onDeleteStory, viewDuration, onStoryViewed }) => {
  const { stories, startIndex } = storySet;
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false); // Potencjalna funkcja pauzy/wznowienia w przyszłości
  const pauseTimeRef = useRef(0);
  const remainingTimeRef = useRef(viewDuration);

  const currentStory = stories[currentIndex];

  const resetTimerAndProgress = useCallback(() => {
    clearInterval(progressIntervalRef.current);
    clearTimeout(timerRef.current);
    setProgress(0);
    setIsPaused(false); // Resetowanie stanu wstrzymania
    remainingTimeRef.current = viewDuration; // Resetowanie pozostałego czasu
  }, [viewDuration]);

  const advanceStory = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prevIndex => prevIndex + 1);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const startTimer = useCallback((durationForThisSegment) => {
    // resetTimerAndProgress(); // Spowoduje to pełny reset, wyczyści tylko poprzednie timery.
    clearInterval(progressIntervalRef.current);
    clearTimeout(timerRef.current);
    setProgress(0); // Rozpoczęcie postępu od 0 dla nowej fabuły/segmentu.
    remainingTimeRef.current = durationForThisSegment;
    const segmentStartTime = Date.now();

    progressIntervalRef.current = setInterval(() => {
      if (!isPaused) {
        const timeElapsedInSegment = Date.now() - segmentStartTime;
        const currentSegmentProgress = Math.min((timeElapsedInSegment / durationForThisSegment) * 100, 100);
        setProgress(currentSegmentProgress);
      }
    }, 50);

    timerRef.current = setTimeout(() => {
      if (!isPaused) {
        clearInterval(progressIntervalRef.current);
        setProgress(100); // Upewnia się, że pokazuje 100% przed przejściem dalej
        advanceStory();
      }
    }, durationForThisSegment);

  }, [advanceStory, viewDuration, isPaused]); // Usunięto resetTimerAndProgress z deps, użyj określonych prześwitów
  // Efekt bieżącej zmiany fabuły
  useEffect(() => {
    if (currentStory) {
      onStoryViewed(currentStory.id);
      startTimer(viewDuration); // Rozpocznij od pełnego czasu trwania nowej historii
    }
    return () => {
      // Czyści liczników czasu po odinstalowaniu komponentu lub zmianie currentStory
      clearInterval(progressIntervalRef.current);
      clearTimeout(timerRef.current);
    };
  }, [currentIndex, currentStory, startTimer, onStoryViewed, viewDuration]); // Dodano viewDuration, aby zapewnić prawidłowe ponowne uruchomienie timera w przypadku jego zmiany.

  const goToNextStory = useCallback(() => {
    // resetTimerAndProgress(); // Nie, startTimer zajmie się resetowaniem dla nowej historii.
    advanceStory();
  }, [advanceStory]);

  const goToPreviousStory = useCallback(() => {
    if (currentIndex > 0) {
      // resetTimerAndProgress(); // Nie, startTimer zajmie się resetowaniem dla nowej historii.
      setCurrentIndex(prevIndex => prevIndex - 1);
    }
  }, [currentIndex]);

  const handleDelete = () => {
    if (currentStory) {
      const storyIdToDelete = currentStory.id;
      // Wyczyść liczniki czasu bezpośrednio przed zmianami stanu, które mogą mieć na nie wpływ.
      clearInterval(progressIntervalRef.current);
      clearTimeout(timerRef.current);
      onDeleteStory(storyIdToDelete);
      // Parent (App.jsx) obsługuje aktualizację storySet.
      // Jeśli stories nadal trwają, useEffect na currentStory zrestartuje licznik czasu.
      // Jeśli nie ma story, rodzic zamyka przeglądarkę.
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => goToNextStory(),
    onSwipedRight: () => goToPreviousStory(),
    preventScrollOnSwipe: true,
    trackMouse: true,
    onTap: (eventData) => {
      // Upewnia się, że eventData i eventData.event istnieją.
      if (!eventData || !eventData.event) {
        console.warn("onTap called without sufficient eventData.");
        return;
      }
      const target = eventData.event.target;

      // Sprawdza, czy kliknięcie jest na kontrolkach, jeśli tak, nie nawiguj.
      if (target.closest('.story-viewer-close') || target.closest('.story-viewer-delete') ||
          target.closest('.story-nav-button') || target.closest('.story-header')) {
        return;
      }

      // NAPRAWIONO: Używanie eventData.event.clientX zamiast eventData.initial[0]
      const clickX = eventData.event.clientX;
      const screenWidth = window.innerWidth;

      if (clickX < screenWidth / 3) {
          goToPreviousStory();
      } else if (clickX > screenWidth * 2 / 3) {
          goToNextStory();
      }
    }
  });


  if (!currentStory) {
    // To zabezpieczenie jest dobre, ponieważ App.jsx powinien zapobiegać renderowaniu, jeśli storySet.stories jest pusty.
    // Jeśli currentStory staje się niezdefiniowane (np. tablica stories jest pusta lub currentIndex jest poza zakresem)
    // może to wskazywać na problem w górę strumienia lub podczas szybkiej aktualizacji stanu.
    // console.warn("StoryViewer: No currentStory. Attempting to close.");
    // onClose(); // Może to prowadzić do pętli, jeśli nie będziesz ostrożny. Lepiej obsługiwane przez App.jsx check.
    return null;
  }

  return (
    <div className="story-viewer-overlay" {...swipeHandlers}>
      <div className="story-viewer-content">
        <div className="story-progress-bars">
          {stories.map((story, index) => (
            <div key={story.id || index} className="progress-bar-segment">
              <div
                className="progress-bar-fill"
                style={{ width: index < currentIndex ? '100%' : (index === currentIndex ? `${progress}%` : '0%') }}
              ></div>
            </div>
          ))}
        </div>

        <div className="story-header">
          <div className="story-user-info">
            <span className="story-user-name">Your Story</span>
             <span className="story-timestamp">{new Date(currentStory.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          <div className="story-controls">
            <button onClick={(e) => {e.stopPropagation(); handleDelete();}} className="story-viewer-delete story-control-button" aria-label="Delete story">
              <TrashIcon />
            </button>
            <button onClick={(e) => {e.stopPropagation(); onClose();}} className="story-viewer-close story-control-button" aria-label="Close stories">
              <CloseIcon />
            </button>
          </div>
        </div>

        <img src={currentStory.src} alt="Story content" className="story-image" />

        {currentIndex > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); goToPreviousStory(); }}
            className="story-nav-button prev"
            aria-label="Previous story"
          >
            <ChevronLeftIcon />
          </button>
        )}
        {currentIndex < stories.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); goToNextStory(); }}
            className="story-nav-button next"
            aria-label="Next story"
          >
            <ChevronRightIcon />
          </button>
        )}
      </div>
    </div>
  );
};

export default StoryViewer;