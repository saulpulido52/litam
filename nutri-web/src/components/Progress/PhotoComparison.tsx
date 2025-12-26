import React, { useState, useEffect } from 'react';
import { Upload, Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Photo {
    id: string;
    url: string;
    date: string;
    type: 'front' | 'side' | 'back';
}

interface PhotoComparisonProps {
    patientId: string;
}

export const PhotoComparison: React.FC<PhotoComparisonProps> = ({ patientId }) => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [selectedPhotos, setSelectedPhotos] = useState<[number, number]>([0, 1]);

    // Load photos from localStorage
    useEffect(() => {
        const savedPhotos = localStorage.getItem(`photos_${patientId}`);
        if (savedPhotos) {
            setPhotos(JSON.parse(savedPhotos));
        }
    }, [patientId]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'side' | 'back') => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const newPhoto: Photo = {
                id: Date.now().toString(),
                url: reader.result as string,
                date: new Date().toISOString(),
                type
            };

            const updatedPhotos = [...photos, newPhoto];
            setPhotos(updatedPhotos);
            localStorage.setItem(`photos_${patientId}`, JSON.stringify(updatedPhotos));
        };
        reader.readAsDataURL(file);
    };

    const deletePhoto = (id: string) => {
        const updatedPhotos = photos.filter(p => p.id !== id);
        setPhotos(updatedPhotos);
        localStorage.setItem(`photos_${patientId}`, JSON.stringify(updatedPhotos));
    };

    const navigatePhoto = (index: number, direction: 'prev' | 'next') => {
        const newIndex = direction === 'prev'
            ? Math.max(0, selectedPhotos[index] - 1)
            : Math.min(photos.length - 1, selectedPhotos[index] + 1);

        const newSelection: [number, number] = [...selectedPhotos] as [number, number];
        newSelection[index] = newIndex;
        setSelectedPhotos(newSelection);
    };

    if (photos.length === 0) {
        return (
            <div
                className="rounded-3 shadow-lg p-5 border"
                style={{
                    background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
                    borderColor: '#bfdbfe'
                }}
            >
                <div className="text-center">
                    <Camera className="mx-auto mb-3 text-primary" size={48} />
                    <h3 className="h5 fw-bold text-dark mb-2">Fotos de Progreso</h3>
                    <p className="small text-secondary mb-4">
                        Sube fotos para comparar visualmente tu progreso
                    </p>

                    <div className="d-flex flex-wrap gap-2 justify-content-center">
                        <label className="btn btn-primary btn-sm">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'front')}
                                className="d-none"
                            />
                            📸 Frente
                        </label>
                        <label className="btn btn-primary btn-sm">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'side')}
                                className="d-none"
                            />
                            📸 Lado
                        </label>
                        <label className="btn btn-primary btn-sm">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'back')}
                                className="d-none"
                            />
                            📸 Espalda
                        </label>
                    </div>
                </div>
            </div>
        );
    }

    const PhotoCard = ({ photoIndex, label }: { photoIndex: number; label: string }) => {
        const photo = photos[photoIndex];
        if (!photo) return null;

        return (
            <div className="position-relative">
                <div
                    className="bg-light rounded-3 overflow-hidden shadow-lg"
                    style={{ aspectRatio: '3/4' }}
                >
                    <img
                        src={photo.url}
                        alt={`Progreso ${label}`}
                        className="w-100 h-100"
                        style={{ objectFit: 'cover' }}
                    />
                </div>
                <div className="position-absolute top-0 start-0 end-0 d-flex align-items-center justify-content-between p-2">
                    <span
                        className="badge text-white small"
                        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                    >
                        {label}
                    </span>
                    <button
                        onClick={() => deletePhoto(photo.id)}
                        className="btn btn-danger btn-sm rounded-circle p-1"
                        style={{ width: '28px', height: '28px' }}
                    >
                        <X size={14} />
                    </button>
                </div>
                <div className="position-absolute bottom-0 start-0 end-0 p-2">
                    <div
                        className="badge text-white small w-100"
                        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                    >
                        {new Date(photo.date).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        })}
                    </div>
                </div>

                {/* Navigation arrows */}
                <div
                    className="position-absolute start-0 end-0 d-flex justify-content-between px-2"
                    style={{ top: '50%', transform: 'translateY(-50%)' }}
                >
                    <button
                        onClick={() => navigatePhoto(label === 'Antes' ? 0 : 1, 'prev')}
                        disabled={photoIndex === 0}
                        className="btn btn-dark btn-sm rounded-circle p-2"
                        style={{
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            border: 'none',
                            opacity: photoIndex === 0 ? 0.3 : 1
                        }}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => navigatePhoto(label === 'Antes' ? 0 : 1, 'next')}
                        disabled={photoIndex === photos.length - 1}
                        className="btn btn-dark btn-sm rounded-circle p-2"
                        style={{
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            border: 'none',
                            opacity: photoIndex === photos.length - 1 ? 0.3 : 1
                        }}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-3 shadow-lg p-4 border">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <h3 className="h5 fw-bold text-dark mb-0">📸 Comparación de Fotos</h3>
                <label className="btn btn-primary btn-sm d-flex align-items-center gap-2">
                    <Upload size={16} />
                    Subir Foto
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'front')}
                        className="d-none"
                    />
                </label>
            </div>

            <div className="row g-3">
                <div className="col-md-6">
                    <PhotoCard photoIndex={selectedPhotos[0]} label="Antes" />
                </div>
                <div className="col-md-6">
                    <PhotoCard photoIndex={selectedPhotos[1]} label="Ahora" />
                </div>
            </div>

            {photos.length > 2 && (
                <div className="mt-3 text-center small text-secondary">
                    Usa las flechas para navegar entre {photos.length} fotos
                </div>
            )}
        </div>
    );
};
