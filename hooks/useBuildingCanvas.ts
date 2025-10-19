import { useState, useRef, useCallback } from 'react';
import { BLOCK_DIMENSIONS } from '../constants';

export const useBuildingCanvas = ({ buildState, inventory, onInventoryUpdate, onSave }) => {
    const [blocks, setBlocks] = useState(buildState.currentBuild.blocks || []);
    const [buildName, setBuildName] = useState(buildState.currentBuild.name || 'My Build');
    const [selectedBlockId, setSelectedBlockId] = useState(null);
    const [draggingBlock, setDraggingBlock] = useState(null);
    const [draggingFromInventory, setDraggingFromInventory] = useState(null);
    const [ghostBlock, setGhostBlock] = useState(null);
    const canvasRef = useRef(null);
    const { currentBlock: currentBlockType } = buildState;

    const getBlockEffectiveDimensions = useCallback((block) => {
        const dims = BLOCK_DIMENSIONS[block.type];
        if (!dims) return { width: 0, height: 0 };
        const isVertical = block.rotation === 90 || block.rotation === 270;
        return isVertical ? { width: dims.height, height: dims.width } : dims;
    }, []);

    const checkCollision = useCallback((blockA, blockB) => {
        const dimsA = getBlockEffectiveDimensions(blockA);
        const dimsB = getBlockEffectiveDimensions(blockB);
        return (
            blockA.x < blockB.x + dimsB.width &&
            blockA.x + dimsA.width > blockB.x &&
            blockA.y < blockB.y + dimsB.height &&
            blockA.y + dimsA.height > blockB.y
        );
    }, [getBlockEffectiveDimensions]);

    const isPositionValid = useCallback((targetBlock, allBlocks) => {
        if (targetBlock.type === 'Apple' || ['Bird', 'Fish', 'Insect'].includes(targetBlock.type)) {
            return true;
        }

        for (const block of allBlocks) {
            if (block.id === targetBlock.id) continue;
            if (block.type === 'Apple' || ['Bird', 'Fish', 'Insect'].includes(block.type)) continue;
            if (checkCollision(targetBlock, block)) return false;
        }
        return true;
    }, [checkCollision]);

    const handleDeleteBlock = useCallback((blockId) => {
        const blockToRemove = blocks.find(b => b.id === blockId);
        if (!blockToRemove) return;
        
        const newInventory = { ...inventory };
        newInventory[blockToRemove.type] = (Number(newInventory[blockToRemove.type]) || 0) + 1;
        onInventoryUpdate(newInventory);
        
        setBlocks(blocks.filter(b => b.id !== blockId));
        setSelectedBlockId(null);
    }, [blocks, inventory, onInventoryUpdate]);

    const handleBlockRightClick = useCallback((e, block) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedBlockId(block.id);
    }, []);

    const startDraggingBlock = (clientX, clientY, block) => {
        if (currentBlockType === 'Air') {
            handleDeleteBlock(block.id);
            return;
        }
        setDraggingBlock({
            id: block.id,
            type: block.type,
            rotation: block.rotation,
            initialX: block.x,
            initialY: block.y,
            offsetX: clientX - block.x,
            offsetY: clientY - block.y,
            isValid: true,
        });
    };

    const handleBlockMouseDown = useCallback((e, block) => {
        e.stopPropagation();
        if (e.button !== 0) return;
        startDraggingBlock(e.clientX, e.clientY, block);
    }, [currentBlockType, handleDeleteBlock]);

    const handleBlockTouchStart = useCallback((e, block) => {
        e.stopPropagation();
        const touch = e.touches[0];
        startDraggingBlock(touch.clientX, touch.clientY, block);
    }, [currentBlockType, handleDeleteBlock]);

    const startDraggingFromInventory = (blockType) => {
        const hasBlock = (Number(inventory[blockType]) || 0) > 0;
        if (!hasBlock) return;
        setDraggingFromInventory(blockType);
    };

    const handleInventoryMouseDown = useCallback((e, blockType) => {
        e.preventDefault();
        startDraggingFromInventory(blockType);
    }, [inventory]);

    const handleInventoryTouchStart = useCallback((e, blockType) => {
        e.preventDefault();
        startDraggingFromInventory(blockType);
    }, [inventory]);

    const handleDragMove = useCallback((e) => {
        const isTouchEvent = 'touches' in e;
        if (isTouchEvent) {
             e.preventDefault();
        }

        const clientX = isTouchEvent ? e.touches[0].clientX : e.clientX;
        const clientY = isTouchEvent ? e.touches[0].clientY : e.clientY;

        if (draggingBlock) {
            const SNAP_GRID_SIZE = 20;
            let newX = clientX - draggingBlock.offsetX;
            let newY = clientY - draggingBlock.offsetY;
            
            const SNAP_DISTANCE = 20;
            const draggedDims = getBlockEffectiveDimensions({ type: draggingBlock.type, rotation: draggingBlock.rotation });
            let bestSnap = { x: null, y: null, distanceX: Infinity, distanceY: Infinity };

            for (const otherBlock of blocks) {
                if (otherBlock.id === draggingBlock.id) continue;
                const otherDims = getBlockEffectiveDimensions(otherBlock);
                
                const xTargets = [otherBlock.x, otherBlock.x + otherDims.width, otherBlock.x - draggedDims.width];
                const yTargets = [otherBlock.y, otherBlock.y + otherDims.height, otherBlock.y - draggedDims.height];

                for (const targetX of xTargets) {
                    const dist = Math.abs(newX - targetX);
                    if (dist < SNAP_DISTANCE && dist < bestSnap.distanceX) {
                        bestSnap.distanceX = dist; bestSnap.x = targetX;
                    }
                }
                for (const targetY of yTargets) {
                    const dist = Math.abs(newY - targetY);
                    if (dist < SNAP_DISTANCE && dist < bestSnap.distanceY) {
                        bestSnap.distanceY = dist; bestSnap.y = targetY;
                    }
                }
            }
            
            newX = bestSnap.x !== null ? bestSnap.x : Math.round(newX / SNAP_GRID_SIZE) * SNAP_GRID_SIZE;
            newY = bestSnap.y !== null ? bestSnap.y : Math.round(newY / SNAP_GRID_SIZE) * SNAP_GRID_SIZE;

            const tempBlock = { ...draggingBlock, x: newX, y: newY };
            const isValid = isPositionValid(tempBlock, blocks);

            setDraggingBlock(prev => ({ ...prev, isValid }));
            setBlocks(prevBlocks =>
                prevBlocks.map(b => b.id === draggingBlock.id ? { ...b, x: newX, y: newY } : b)
            );
        } else if (draggingFromInventory) {
            const SNAP_GRID_SIZE = 20;
            const blockType = draggingFromInventory;
            const canvasRect = canvasRef.current?.getBoundingClientRect();
            if (!canvasRect) return;

            const x = clientX - canvasRect.left;
            const y = clientY - canvasRect.top;
            const dims = BLOCK_DIMENSIONS[blockType] || { width: 40, height: 40 };

            const tempBlock = {
                id: 'ghost',
                type: blockType,
                x: Math.round((x - dims.width / 2) / SNAP_GRID_SIZE) * SNAP_GRID_SIZE,
                y: Math.round((y - dims.height / 2) / SNAP_GRID_SIZE) * SNAP_GRID_SIZE,
                rotation: 0,
            };
            
            const isValid = isPositionValid(tempBlock, blocks);
            setGhostBlock({ ...tempBlock, isValid });
        }
    }, [blocks, draggingBlock, draggingFromInventory, getBlockEffectiveDimensions, isPositionValid]);
    
    const handleDragEnd = useCallback(() => {
        if (draggingBlock) {
            if (!draggingBlock.isValid) {
                setBlocks(prevBlocks =>
                    prevBlocks.map(b =>
                        b.id === draggingBlock.id ? { ...b, x: draggingBlock.initialX, y: draggingBlock.initialY } : b
                    )
                );
            }
            setDraggingBlock(null);
        } else if (draggingFromInventory) {
            const blockType = draggingFromInventory;
            if (blockType && ghostBlock && ghostBlock.isValid) {
                 const newInventory = { ...inventory };
                 if ((Number(newInventory[blockType]) || 0) > 0) {
                     const newBlock = {
                        id: `block-${Date.now()}-${Math.random()}`,
                        type: blockType,
                        x: ghostBlock.x,
                        y: ghostBlock.y,
                        rotation: 0,
                    };

                    newInventory[blockType]--;
                    onInventoryUpdate(newInventory);
                    setBlocks(prevBlocks => [...prevBlocks, newBlock]);
                 }
            }
            setDraggingFromInventory(null);
            setGhostBlock(null);
        }
    }, [draggingBlock, draggingFromInventory, ghostBlock, inventory, onInventoryUpdate]);

    const handleRotateBlock = useCallback((blockId) => {
        let rotatedBlock;
        const newBlocks = blocks.map(b => {
            if (b.id === blockId) {
                rotatedBlock = { ...b, rotation: (b.rotation + 90) % 360 };
                return rotatedBlock;
            }
            return b;
        });

        if (rotatedBlock && !isPositionValid(rotatedBlock, newBlocks)) {
            alert("Cannot rotate block, it would overlap another block!");
        } else {
            setBlocks(newBlocks);
        }
    }, [blocks, isPositionValid]);
    
    const handleSave = useCallback(() => {
        onSave(buildName, blocks);
        alert(`Build "${buildName}" saved!`);
    }, [buildName, blocks, onSave]);

    const selectedBlock = blocks.find(b => b.id === selectedBlockId);

    return {
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
    };
};