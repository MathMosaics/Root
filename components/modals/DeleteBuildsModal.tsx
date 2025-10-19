import React, { useState, useEffect } from 'react';
import { Modal } from '../ui';

type Build = { id: string; name: string; };

interface DeleteBuildsModalProps {
    isOpen: boolean;
    onClose: () => void;
    builds: Build[];
    onConfirmDelete: (buildIds: string[]) => void;
}

export const DeleteBuildsModal: React.FC<DeleteBuildsModalProps> = ({ isOpen, onClose, builds, onConfirmDelete }) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isConfirming, setIsConfirming] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSelectedIds([]);
            setIsConfirming(false); // Reset confirmation state when modal opens
        }
    }, [isOpen]);

    const handleToggle = (buildId: string) => {
        setSelectedIds(prev =>
            prev.includes(buildId)
                ? prev.filter(id => id !== buildId)
                : [...prev, buildId]
        );
    };

    const proceedToConfirm = () => {
        if (selectedIds.length > 0) {
            setIsConfirming(true);
        } else {
            alert("Please select at least one build to delete.");
        }
    };

    const handleFinalDelete = () => {
        onConfirmDelete(selectedIds);
        onClose(); // Close modal and reset state for next time
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isConfirming ? "Confirm Deletion" : "Delete Builds"} maxWidth="max-w-lg">
            {isConfirming ? (
                <div className="flex flex-col space-y-4">
                    <p className="text-lg text-gray-800 font-semibold text-center">
                        Are you sure you want to permanently delete {selectedIds.length} build(s)?
                    </p>
                    <p className="text-red-600 font-medium text-center bg-red-50 p-3 rounded-lg">
                        This action cannot be undone.
                    </p>
                     <p className="text-gray-600 text-center">
                        All blocks used will be returned to your inventory.
                    </p>
                    <div className="flex justify-center space-x-4 pt-4">
                        <button onClick={() => setIsConfirming(false)} className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition font-semibold">
                            Cancel
                        </button>
                        <button onClick={handleFinalDelete} className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-bold">
                            Yes, Delete Now
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col space-y-4">
                    <p className="text-gray-600">Select the builds you want to permanently delete.</p>
                    <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50 space-y-2">
                        {builds.length > 0 ? builds.map(build => (
                            <label key={build.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(build.id)}
                                    onChange={() => handleToggle(build.id)}
                                    className="h-5 w-5 rounded text-red-600 focus:ring-red-500 border-gray-300"
                                />
                                <span className="text-gray-800 font-medium">{build.name}</span>
                            </label>
                        )) : (
                            <p className="text-center text-gray-500 py-4">No builds to delete.</p>
                        )}
                    </div>
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition">
                            Cancel
                        </button>
                        <button
                            onClick={proceedToConfirm}
                            disabled={selectedIds.length === 0}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:bg-red-300 disabled:cursor-not-allowed"
                        >
                            Delete ({selectedIds.length}) Selected
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
};