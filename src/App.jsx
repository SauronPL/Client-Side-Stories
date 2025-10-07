// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import StoryReel from './components/StoryReel';
import StoryViewer from './components/StoryViewer';
import { resizeImage } from './utils/imageUtils';
import './App.css';

const MAX_IMAGE_WIDTH = 1080;
const MAX_IMAGE_HEIGHT = 1920;
const STORY_DURATION_MS = 24 * 60 * 60 * 1000; // 24 godziny
const VIEW_DURATION_MS = 5000; // 5 sekund na wyświetlenie story

function App() {
  const [stories, setStories] = useState([]);
  const [viewingStorySet, setViewingStorySet] = useState(null); // { stories: [], startIndex: 0 }

  // Załaduj historie z localStorage i odfiltruj te, które wygasły
  useEffect(() => {
    const storedStories = JSON.parse(localStorage.getItem('storiesData')) || [];
    const now = Date.now();
    const validStories = storedStories.filter(story => (now - story.timestamp) < STORY_DURATION_MS);
    setStories(validStories);
    if (validStories.length < storedStories.length) {
        localStorage.setItem('storiesData', JSON.stringify(validStories));
    }
  }, []);

  const handleAddStory = async (file) => {
    if (!file) return;

    try {
      const base64Image = await resizeImage(file, MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT);
      const newStory = {
        id: `story-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        src: base64Image,
        timestamp: Date.now(),
        viewed: false, // Każda nowa historia rozpoczyna się jako nieprzeglądana
        // user: "You" // Można dodać koncepcję użytkownika później
      };
      // Dodaj nową historię na początku listy, aby pojawiła się jako pierwsza w rolce.
      const updatedStories = [newStory, ...stories.filter(s => s.id !== newStory.id)];
      setStories(updatedStories);
      localStorage.setItem('storiesData', JSON.stringify(updatedStories));
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Failed to process image. Please try a different one.");
    }
  };

  const handleViewStories = (clickedStoryId) => {
    // Po kliknięciu kręgu historii chcemy wyświetlić wszystkie dostępne stories w kolejności,
    // zaczynając od tego, który został kliknięty.
    const startIndex = stories.findIndex(s => s.id === clickedStoryId);

    if (startIndex !== -1) {
      setViewingStorySet({ stories: [...stories], startIndex }); // Przejdź wszystkie stories, zaczynając od klikniętej.

      // Oznacz kliknięte stories jako wyświetlaną w głównej tablicy 'stories' dla rolki
      const updatedStories = stories.map(s =>
        s.id === clickedStoryId && !s.viewed ? { ...s, viewed: true } : s
      );
      if (JSON.stringify(updatedStories) !== JSON.stringify(stories)) {
        setStories(updatedStories);
        localStorage.setItem('storiesData', JSON.stringify(updatedStories));
      }
    }
  };

  const handleCloseViewer = () => {
    setViewingStorySet(null);
  };

  const handleDeleteStory = useCallback((storyIdToDelete) => {
    const remainingStories = stories.filter(story => story.id !== storyIdToDelete);
    setStories(remainingStories);
    localStorage.setItem('storiesData', JSON.stringify(remainingStories));

    if (viewingStorySet) {
      const newViewingStories = viewingStorySet.stories.filter(s => s.id !== storyIdToDelete);

      if (newViewingStories.length === 0) {
        handleCloseViewer();
      } else {
        let newStartIndex = viewingStorySet.startIndex;
        const currentViewingStoryId = viewingStorySet.stories[viewingStorySet.startIndex]?.id;

        if (currentViewingStoryId === storyIdToDelete) {
          // Jeśli aktualnie oglądane story została usunięta, spróbuj pozostać przy tym samym indeksie
          // jeśli to możliwe (nowe story z listy zajmie jej miejsce),
          // lub dostosuj, jeśli była to ostatnie story.
          newStartIndex = Math.min(viewingStorySet.startIndex, newViewingStories.length - 1);
          if (newStartIndex < 0) newStartIndex = 0; // Nie powinno się to zdarzyć, jeśli newViewingStories.length > 0
        } else {
          // Jeśli *inne* story z bieżącej listy przeglądarki została usunięta,
          // znajdź nowy indeks story, która *była* przeglądana
          newStartIndex = newViewingStories.findIndex(s => s.id === currentViewingStoryId);
          if (newStartIndex === -1) { // Oglądane story nie znajduje się już na liście (np. została usunięta lub lista uległa drastycznej zmianie).
             if (newViewingStories.length > 0) newStartIndex = 0; // Powrót do pierwszego story
             else {
                 handleCloseViewer(); // Brak story do wyświetlenia
                 return;
             }
          }
        }
        setViewingStorySet({ stories: newViewingStories, startIndex: newStartIndex });
      }
    }
  }, [stories, viewingStorySet]);

  const markStoryAsViewedInReel = (storyId) => {
    // Jest ona wywoływana przez StoryViewer, gdy segment jest faktycznie wyświetlany
    const updatedStories = stories.map(s =>
      s.id === storyId && !s.viewed ? { ...s, viewed: true } : s
    );
    if (JSON.stringify(updatedStories) !== JSON.stringify(stories)) {
        setStories(updatedStories);
        localStorage.setItem('storiesData', JSON.stringify(updatedStories));
    }
  };


  return (
    <div className="app">
      <header className="app-header">
        <h1>Stories</h1>
      </header>
      <StoryReel
        stories={stories} // Zaliczenie wszystkich pojedynczych story
        onAddStory={handleAddStory}
        onViewStories={handleViewStories} // Zostanie ona wywołana z identyfikatorem konkretnej klikniętej story
      />
      {viewingStorySet && viewingStorySet.stories.length > 0 && (
        <StoryViewer
          // Klucz pomaga Reactowi rozróżnić, czy zestaw story lub indeks początkowy znacząco się zmienia
          key={viewingStorySet.stories.map(s => s.id).join('-') + `-${viewingStorySet.startIndex}`}
          storySet={viewingStorySet} // Ten zestaw będzie zawierał wszystkie aktualne stories
          onClose={handleCloseViewer}
          onDeleteStory={handleDeleteStory}
          viewDuration={VIEW_DURATION_MS}
          onStoryViewed={markStoryAsViewedInReel}
        />
      )}
      <main className="app-content">
        <p>Witaj w aplikacji Stories!</p>
        <p>Dodaj historię, klikając przycisk „+” poniżej. Kliknij kółko, aby obejrzeć.</p>
        <p>Historie znikają automatycznie po 24 godzinach.</p>
        <p>W przeglądarce możesz przesuwać lub klikać krawędzie, aby nawigować, lub kliknąć ikonę kosza, aby usunąć.</p>
      </main>
    </div>
  );
}

export default App;