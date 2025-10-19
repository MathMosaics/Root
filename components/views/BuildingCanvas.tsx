import React from 'react';
import { useBuildingCanvas } from '../../hooks/useBuildingCanvas';
import { BLOCK_DIMENSIONS, blockOrder } from '../../constants';
import { BlockIcon } from '../ui';

export const BuildingCanvas = ({ buildState, setBuildState, inventory, onInventoryUpdate, onSave, onClose, loadedImages }) => {
    const {
        blocks,
        buildName,
        setBuildName,
        selectedBlockId,
        setSelectedBlockId,
        draggingBlock,
        ghostBlock,
        canvasRef,
        selectedBlock,
        getBlockEffectiveDimensions,
        handleBlockRightClick,
        handleBlockMouseDown,
        handleBlockTouchStart,
        handleDragMove,
        handleDragEnd,
        handleDeleteBlock,
        handleRotateBlock,
        handleInventoryMouseDown,
        handleInventoryTouchStart,
        handleSave,
    } = useBuildingCanvas({ buildState, inventory, onInventoryUpdate, onSave });
    
    const { currentBlock: currentBlockType } = buildState;

    return (
        <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-90 z-40 flex flex-col animate-fade-in touch-none" 
            onMouseUp={handleDragEnd} 
            onMouseMove={handleDragMove} 
            onMouseLeave={handleDragEnd}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
        >
            <header className="w-full flex-shrink-0 flex items-center justify-between gap-4 p-3 bg-gray-950/80 backdrop-blur-sm shadow-2xl border-b-2 border-cyan-500">
                 <input
                    type="text"
                    value={buildName}
                    onChange={(e) => setBuildName(e.target.value)}
                    className="p-2 rounded-lg text-gray-800 text-xl font-bold border-2 border-gray-400 focus:border-cyan-500 transition-colors w-64 bg-gray-200"
                    placeholder="Build Name"
                />
                <div className="flex items-center gap-4">
                    <button onClick={handleSave} className="px-6 py-2 bg-cyan-600 text-white font-bold rounded-lg shadow-md hover:bg-cyan-700 transition-colors flex items-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V4zm3 0a1 1 0 00-1 1v4a1 1 0 102 0V5a1 1 0 00-1-1z" /></svg>
                        Save
                    </button>
                    <button onClick={onClose} className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 transition-colors flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
                        Exit
                    </button>
                </div>
            </header>

            <main className="flex-grow w-full relative">
                <div
                    ref={canvasRef}
                    className="absolute inset-0 bg-sky-400 overflow-hidden"
                    style={{ minHeight: '66.66vh' }}
                    onClick={() => setSelectedBlockId(null)}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    {ghostBlock && (
                        <div
                            className="absolute opacity-70 pointer-events-none"
                            style={{
                                left: `${ghostBlock.x}px`,
                                top: `${ghostBlock.y}px`,
                                width: `${BLOCK_DIMENSIONS[ghostBlock.type].width}px`,
                                height: `${BLOCK_DIMENSIONS[ghostBlock.type].height}px`,
                                zIndex: 20,
                            }}
                        >
                            <BlockIcon 
                                block={ghostBlock.type} 
                                size="w-full h-full" 
                                className={!ghostBlock.isValid ? 'bg-red-500/50 ring-4 ring-red-500' : 'ring-2 ring-white'}
                                images={loadedImages}
                            />
                        </div>
                    )}

                    {blocks.map(block => {
                        const dims = BLOCK_DIMENSIONS[block.type];
                        const isDraggingThisBlock = draggingBlock && draggingBlock.id === block.id;
                        const isInvalidDrag = isDraggingThisBlock && !draggingBlock.isValid;

                        return (
                            <div
                                key={block.id}
                                onMouseDown={(e) => handleBlockMouseDown(e, block)}
                                onTouchStart={(e) => handleBlockTouchStart(e, block)}
                                onContextMenu={(e) => handleBlockRightClick(e, block)}
                                className={`absolute cursor-grab transition-opacity ${isInvalidDrag ? 'bg-red-500 bg-opacity-50' : ''}`}
                                style={{
                                    left: `${block.x}px`,
                                    top: `${block.y}px`,
                                    width: `${dims.width}px`,
                                    height: `${dims.height}px`,
                                    transform: `rotate(${block.rotation}deg)`,
                                    zIndex: isDraggingThisBlock ? 10 : 1,
                                }}
                            >
                                <BlockIcon block={block.type} size="w-full h-full" className={isInvalidDrag ? 'opacity-50' : ''} images={loadedImages}/>
                            </div>
                        );
                    })}

                    {selectedBlock && (
                        <div
                            className="absolute z-20 bg-gray-800 bg-opacity-75 rounded-lg p-1 flex gap-1 animate-fade-in"
                            style={{
                                left: `${selectedBlock.x + getBlockEffectiveDimensions(selectedBlock).width + 5}px`,
                                top: `${selectedBlock.y}px`,
                            }}
                        >
                            <button onClick={() => handleRotateBlock(selectedBlockId)} title="Rotate (R)" className="p-1 hover:bg-gray-600 rounded">🔄</button>
                            <button onClick={() => handleDeleteBlock(selectedBlockId)} title="Delete" className="p-1 hover:bg-gray-600 rounded">❌</button>
                        </div>
                    )}
                </div>
            </main>

            <footer className="w-full flex-shrink-0 flex flex-wrap gap-3 p-3 bg-gray-950/80 backdrop-blur-sm shadow-inner border-t-2 border-gray-700 justify-center max-h-40 overflow-y-auto">
                {blockOrder.reduce((acc, block) => {
                    const count = inventory[block];
                    if (count !== undefined) {
                        const numCount = Number(count);
                        if (isFinite(numCount)) {
                            acc.push(
                                <div
                                    key={block}
                                    onMouseDown={(e) => handleInventoryMouseDown(e, block)}
                                    onTouchStart={(e) => handleInventoryTouchStart(e, block)}
                                    onClick={() => setBuildState(s => ({ ...s, currentBlock: block }))}
                                    className={`p-1 flex flex-col items-center transition-all rounded-lg shadow-lg ${currentBlockType === block ? 'bg-lime-500 ring-4 ring-lime-300' : 'bg-gray-800 hover:bg-gray-700'} ${numCount <= 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-grab'}`}
                                >
                                    <BlockIcon block={block} size="h-12 w-12" count={numCount} className="shadow-none" images={loadedImages} />
                                    <span className="text-xs mt-1 font-semibold text-white">{block}</span>
                                </div>
                            );
                        }
                    }
                    return acc;
                }, [] as React.ReactNode[])}
                <button
                    onClick={() => setBuildState(s => ({ ...s, currentBlock: 'Air' }))}
                    className={`p-1 flex flex-col items-center transition-all rounded-lg shadow-lg ${currentBlockType === 'Air' ? 'bg-red-500 ring-4 ring-red-300' : 'bg-gray-800 hover:bg-gray-700'}`}
                >
                    <div className="h-12 w-12 flex items-center justify-center text-3xl">🪓</div>
                    <span className="text-xs mt-1 font-semibold text-white">Remove</span>
                </button>
            </footer>
        </div>
    );
};