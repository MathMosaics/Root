import React, { useState } from 'react';
import { Modal } from '../ui';
import { DeleteBuildsModal } from './DeleteBuildsModal';

export const BuildsModal = ({ isOpen, onClose, savedBuilds, onLoadBuild, onDeleteMultipleBuilds, onNewBuild }) => {
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    const handleDeleteConfirmed = (buildIds: string[]) => {
        onDeleteMultipleBuilds(buildIds);
        setDeleteModalOpen(false); // Close the modal after confirming
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="My Saved Builds (The Book)" maxWidth="max-w-3xl">
                <div className="flex flex-col space-y-3">
                    <div className="flex gap-2">
                        <button
                            onClick={onNewBuild}
                            className="flex-grow px-4 py-3 bg-teal-600 text-white text-lg font-bold rounded-lg shadow-md hover:bg-teal-700 transition-colors"
                        >
                            + Start a New Build
                        </button>
                        <button
                            onClick={() => setDeleteModalOpen(true)}
                            disabled={savedBuilds.length === 0}
                            className="px-4 py-3 bg-red-600 text-white text-lg font-bold rounded-lg shadow-md hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
                        >
                            Delete...
                        </button>
                    </div>

                    <div className="h-64 overflow-y-auto p-2 border border-gray-300 rounded-lg bg-gray-50">
                        {savedBuilds.length === 0 ? (
                            <p className="text-center text-gray-500 py-10">You haven't saved any builds yet!</p>
                        ) : (
                            savedBuilds.map((build) => (
                                <div key={build.id} className="flex justify-between items-center p-3 my-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                                    <span className="text-gray-800 font-semibold">{build.name}</span>
                                    <div className="space-x-2">
                                        <button
                                            onClick={() => onLoadBuild(build)}
                                            className="px-3 py-1 bg-lime-500 text-white rounded-md text-sm hover:bg-lime-600 transition-colors"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </Modal>
            <DeleteBuildsModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                builds={savedBuilds}
                onConfirmDelete={handleDeleteConfirmed}
            />
        </>
    );
};
