'use client';

import { useState } from 'react';
import { Scene, Room, Floor } from '@/types/tour';

interface SceneSelectorProps {
  scenes: Scene[];
  rooms?: Room[];
  floors?: Floor[];
  currentSceneId: string;
  onSelectScene: (sceneId: string, sameRoom: boolean) => void;
  visible: boolean;
}

interface RoomItem {
  id: string;
  name: string;
  description?: string;
  firstSceneId: string;
  floorId?: string;
  photos: Scene[];
}

export default function SceneSelector({
  scenes,
  rooms,
  floors,
  currentSceneId,
  onSelectScene,
  visible,
}: SceneSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const currentScene = scenes.find(s => s.id === currentSceneId);
  const currentRoomId = currentScene?.roomId;

  const hasRooms = rooms && rooms.length > 0;
  const hasFloors = floors && floors.length > 0;

  // Build room items with photos
  const roomItems: RoomItem[] | null = hasRooms
    ? rooms.flatMap(room => {
        const roomPhotos = scenes.filter(s => s.roomId === room.id);
        const firstSceneId = roomPhotos[0]?.id;
        if (!firstSceneId) return [];
        return [{
          id: room.id,
          name: room.name,
          description: room.description,
          firstSceneId,
          floorId: room.floorId,
          photos: roomPhotos,
        }];
      })
    : null;

  // Group rooms by floor
  const sortedFloors = hasFloors
    ? [...floors].sort((a, b) => a.order - b.order)
    : null;

  const handleSelect = (sceneId: string, sameRoom: boolean) => {
    onSelectScene(sceneId, sameRoom);
    setIsExpanded(false);
  };

  // Render photo sub-items for multi-photo rooms
  const renderPhotoItems = (photos: Scene[], roomId: string) => {
    if (photos.length <= 1) return null;
    const isSameRoom = roomId === currentRoomId;

    return photos.map(photo => (
      <button
        key={photo.id}
        className={`scene-selector-photo ${photo.id === currentSceneId ? 'active' : ''}`}
        onClick={() => handleSelect(photo.id, isSameRoom)}
      >
        <span className="scene-photo-name">{photo.name}</span>
        {photo.id === currentSceneId && (
          <span className="scene-item-indicator" aria-hidden="true" />
        )}
      </button>
    ));
  };

  // Render a room button + its photo sub-items
  const renderRoomWithPhotos = (item: RoomItem, index: number) => {
    const isSameRoom = item.id === currentRoomId;

    return (
      <div key={item.id} className="scene-selector-room-group">
        <button
          className={`scene-selector-item ${item.id === currentRoomId ? 'active' : ''}`}
          onClick={() => handleSelect(item.firstSceneId, isSameRoom)}
          aria-current={item.id === currentRoomId ? 'true' : undefined}
        >
          <span className="scene-item-number">{String(index + 1).padStart(2, '0')}</span>
          <div className="scene-item-info">
            <span className="scene-item-name">{item.name}</span>
            {item.description && (
              <span className="scene-item-desc">{item.description}</span>
            )}
          </div>
          {item.id === currentRoomId && item.photos.length <= 1 && (
            <span className="scene-item-indicator" aria-hidden="true" />
          )}
        </button>
        {renderPhotoItems(item.photos, item.id)}
      </div>
    );
  };

  // Build the list content
  const renderContent = () => {
    // Has rooms + floors: group by floor
    if (roomItems && sortedFloors && sortedFloors.length > 0) {
      let roomCounter = 0;

      return sortedFloors.map(floor => {
        const floorRooms = roomItems.filter(r => r.floorId === floor.id);
        if (floorRooms.length === 0) return null;

        return (
          <div key={floor.id} className="scene-selector-group">
            <div className="scene-selector-group-label">{floor.name}</div>
            {floorRooms.map(item => {
              roomCounter++;
              return renderRoomWithPhotos(item, roomCounter);
            })}
          </div>
        );
      });
    }

    // Has rooms but no floors: flat list
    if (roomItems) {
      return roomItems.map((item, index) => renderRoomWithPhotos(item, index + 1));
    }

    // Fallback: show scenes directly
    return scenes.map((scene, index) => (
      <button
        key={scene.id}
        className={`scene-selector-item ${scene.id === currentSceneId ? 'active' : ''}`}
        onClick={() => handleSelect(scene.id, false)}
        aria-current={scene.id === currentSceneId ? 'true' : undefined}
      >
        <span className="scene-item-number">{String(index + 1).padStart(2, '0')}</span>
        <div className="scene-item-info">
          <span className="scene-item-name">{scene.name}</span>
          {scene.description && (
            <span className="scene-item-desc">{scene.description}</span>
          )}
        </div>
        {scene.id === currentSceneId && (
          <span className="scene-item-indicator" aria-hidden="true" />
        )}
      </button>
    ));
  };

  return (
    <div className={`scene-selector ${visible ? 'visible' : 'hidden'}`}>
      <button
        className="scene-selector-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-label="Scene navigation"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="scene-selector-icon">
          <rect x="2" y="2" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11" y="2" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <rect x="2" y="11" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11" y="11" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span className="scene-selector-label">Rooms</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={`scene-selector-chevron ${isExpanded ? 'expanded' : ''}`}
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <div className={`scene-selector-list ${isExpanded ? 'expanded' : ''}`}>
        {renderContent()}
      </div>
    </div>
  );
}
