'use client';

interface TourHeaderProps {
  tourName: string;
  sceneName: string;
  sceneDescription?: string;
  visible: boolean;
}

export default function TourHeader({
  tourName,
  sceneName,
  sceneDescription,
  visible,
}: TourHeaderProps) {
  return (
    <header className={`tour-header ${visible ? 'visible' : 'hidden'}`}>
      <div className="tour-header-content">
        <span className="tour-header-tour-name">{tourName}</span>
        <h1 className="tour-header-scene-name">{sceneName}</h1>
        {sceneDescription && (
          <p className="tour-header-description">{sceneDescription}</p>
        )}
      </div>
    </header>
  );
}
